"""
Gemini API integration.

This module centralizes every call this backend makes to Google's Gemini API
and is used for three things:
  1. Judging submitted code against a problem's test cases and returning a
     verdict + constructive feedback (replaces the old keyword-based mock judge).
  2. Generating hints for a candidate who is stuck on a problem.
  3. Generating brand new problems (title, description, starter code, test
     cases) for admins to add to the assessment bank.

NEVER run untrusted candidate code with eval()/exec()/subprocess here. Gemini
is used purely as a text-in/JSON-out reasoning engine, not a code sandbox.
"""

import os
import json
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
DEFAULT_MODEL = "gemini-2.5-flash"
REQUEST_TIMEOUT_SECONDS = 45.0


def _get_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()


def _get_model() -> str:
    return os.getenv("GEMINI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL


def is_gemini_configured() -> bool:
    """True if a (non-placeholder) Gemini API key is available."""
    key = _get_api_key()
    return bool(key) and "your-" not in key.lower()


class GeminiServiceError(Exception):
    """Raised when the Gemini API call fails or returns an unusable response."""


def _call_gemini(
    prompt: str,
    response_schema: Optional[Dict[str, Any]] = None,
    temperature: float = 0.2,
) -> Dict[str, Any]:
    """
    Low-level call to Gemini's generateContent endpoint, requesting strict
    JSON output constrained to `response_schema` when provided. Returns the
    parsed JSON object from the model's response.
    """
    if not is_gemini_configured():
        raise GeminiServiceError("GEMINI_API_KEY is not configured.")

    url = GEMINI_API_URL_TEMPLATE.format(model=_get_model())

    generation_config: Dict[str, Any] = {
        "temperature": temperature,
        "responseMimeType": "application/json",
    }
    if response_schema:
        generation_config["responseSchema"] = response_schema

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": generation_config,
    }

    try:
        with httpx.Client(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            resp = client.post(url, params={"key": _get_api_key()}, json=payload)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as e:
        raise GeminiServiceError(f"Gemini API returned an error: {e.response.status_code} {e.response.text[:300]}") from e
    except httpx.HTTPError as e:
        raise GeminiServiceError(f"Failed to reach Gemini API: {e}") from e

    try:
        candidates = data.get("candidates") or []
        text = candidates[0]["content"]["parts"][0]["text"]
        return json.loads(text)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as e:
        raise GeminiServiceError(f"Unexpected Gemini response format: {e}") from e


# ---------------------------------------------------------------------------
# 1. Code evaluation + feedback
# ---------------------------------------------------------------------------

_EVALUATION_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {
            "type": "string",
            "enum": [
                "Accepted",
                "Wrong Answer",
                "Runtime Error",
                "Compilation Error",
                "Time Limit Exceeded",
            ],
        },
        "passed_count": {"type": "integer"},
        "total_count": {"type": "integer"},
        "feedback": {"type": "string"},
    },
    "required": ["verdict", "passed_count", "total_count", "feedback"],
}


def evaluate_submission(
    problem: Dict[str, Any],
    test_cases: List[Dict[str, Any]],
    source_code: str,
) -> Dict[str, Any]:
    """
    Uses Gemini as an AI judge: mentally executes `source_code` against every
    test case, decides a verdict, and (when not Accepted) writes feedback
    explaining what's wrong and how the student should think about fixing it,
    without handing over corrected code.
    """
    if not test_cases:
        raise GeminiServiceError("No test cases available to evaluate against.")

    cases_text = "\n\n".join(
        f"Case {i + 1}:\nInput:\n{tc['input_data']}\nExpected Output:\n{tc['expected_output']}"
        for i, tc in enumerate(test_cases)
    )

    prompt = f"""You are an automated code judge for a university Python programming assessment.

Problem: {problem['title']}
Description: {problem['description']}
Input format: {problem['input_description']}
Output format: {problem['output_description']}

Test cases to check the submission against. For each one, feed "Input" to the program via stdin and compare
its printed stdout to "Expected Output" exactly (ignore only leading/trailing whitespace and trailing newlines):

{cases_text}

Submitted Python source code:
```python
{source_code}
```

Carefully and precisely simulate running this exact code against every test case above (trace through the logic
line by line; do not assume it is correct). Then respond with ONLY a JSON object with:
- "verdict": "Accepted" only if the code passes EVERY test case above. Otherwise pick the single verdict that best
  describes the first failure encountered: "Wrong Answer" (runs, wrong output), "Runtime Error" (raises an
  exception / crashes), "Compilation Error" (invalid Python syntax), or "Time Limit Exceeded" (would clearly
  infinite-loop or be far too slow for the given constraints).
- "passed_count": how many of the test cases above produced exactly the expected output.
- "total_count": the total number of test cases listed above.
- "feedback": if verdict is not "Accepted", 2-4 sentences of constructive, specific feedback for the student:
  say what's wrong (e.g. wrong edge case, off-by-one, wrong variable, unhandled input format) and how to think
  about fixing it, WITHOUT writing the corrected code for them. If verdict is "Accepted", one short encouraging
  sentence, optionally with a small code-quality or style observation.
"""

    result = _call_gemini(prompt, response_schema=_EVALUATION_SCHEMA, temperature=0.0)

    total_count = int(result.get("total_count") or len(test_cases)) or len(test_cases)
    passed_count = int(result.get("passed_count", 0))
    verdict = result.get("verdict") or ("Accepted" if passed_count == total_count else "Wrong Answer")

    return {
        "verdict": verdict,
        "passed_count": max(0, min(passed_count, total_count)),
        "total_count": total_count,
        "feedback": (result.get("feedback") or "").strip(),
    }


# ---------------------------------------------------------------------------
# 2. Hints
# ---------------------------------------------------------------------------

_HINT_SCHEMA = {
    "type": "object",
    "properties": {"hint": {"type": "string"}},
    "required": ["hint"],
}


def get_hint(
    problem: Dict[str, Any],
    source_code: str,
    previous_verdict: Optional[str] = None,
    previous_feedback: Optional[str] = None,
) -> str:
    """
    Produces one short, targeted hint for a candidate stuck on `problem`,
    based on their current code and (optionally) their last verdict/feedback.
    Never reveals full solution code.
    """
    context_lines = []
    if previous_verdict:
        context_lines.append(f"Their most recent submission verdict was: {previous_verdict}.")
    if previous_feedback:
        context_lines.append(f"Feedback given on that submission: {previous_feedback}")
    context = "\n".join(context_lines)

    prompt = f"""A student is working on this programming problem:

Title: {problem['title']}
Description: {problem['description']}
Input format: {problem['input_description']}
Output format: {problem['output_description']}

Their current code:
```python
{source_code.strip() or "# (no code written yet)"}
```

{context}

Give ONE short, targeted hint (2-4 sentences) that helps them move forward WITHOUT writing solution code or
revealing the exact algorithm outright. Point at the concept, edge case, or approach they seem to be missing.
If they have written no code yet, give a hint about how to approach the problem instead.

Respond with ONLY a JSON object: {{"hint": "..."}}
"""

    result = _call_gemini(prompt, response_schema=_HINT_SCHEMA, temperature=0.4)
    return (result.get("hint") or "").strip()


# ---------------------------------------------------------------------------
# 3. Problem generation
# ---------------------------------------------------------------------------

_PROBLEM_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "topic": {"type": "string"},
        "difficulty": {"type": "string", "enum": ["Easy", "Easy/Medium", "Medium", "Hard"]},
        "points": {"type": "integer"},
        "description": {"type": "string"},
        "input_description": {"type": "string"},
        "output_description": {"type": "string"},
        "sample_input": {"type": "string"},
        "sample_output": {"type": "string"},
        "starter_code": {"type": "string"},
        "sample_test_cases": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "input": {"type": "string"},
                    "expected_output": {"type": "string"},
                },
                "required": ["input", "expected_output"],
            },
        },
        "hidden_test_cases": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "input": {"type": "string"},
                    "expected_output": {"type": "string"},
                },
                "required": ["input", "expected_output"],
            },
        },
    },
    "required": [
        "title", "topic", "difficulty", "points", "description",
        "input_description", "output_description", "sample_input", "sample_output",
        "starter_code", "sample_test_cases", "hidden_test_cases",
    ],
}


def generate_problem(
    topic: str,
    difficulty: str,
    existing_titles: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Generates a brand-new, self-contained stdin/stdout Python problem in the
    same shape as backend/app/data/problems.py entries, for an admin to review
    and add to the assessment bank.
    """
    avoid = ", ".join(existing_titles) if existing_titles else "none"

    prompt = f"""You are creating a new Python programming assessment problem for a university exam,
in the same style as a competitive-programming judge.

Requested topic: {topic}
Requested difficulty: {difficulty}
Avoid duplicating these existing problem titles/concepts: {avoid}

Design ONE self-contained problem solvable by reading input from stdin and printing output to stdout in Python.
It must have a single unambiguous correct output for every valid input (avoid floating point ambiguity unless
you specify exact rounding/precision rules).

Respond with ONLY a JSON object with these fields:
- title, topic, difficulty ("Easy" | "Easy/Medium" | "Medium" | "Hard"), points (integer 10-25 based on difficulty)
- description, input_description, output_description
- sample_input, sample_output (must match exactly what a correct solution prints for that input)
- starter_code: a short Python comment header plus code that reads the input and has a clear TODO for the
  student — do NOT include the full working solution
- sample_test_cases: 2-3 cases shown to students, each {{"input": "...", "expected_output": "..."}}
- hidden_test_cases: 4-6 additional cases (including edge cases) NOT shown to students, used for grading

The sample_input/sample_output pair must also appear as the first entry of sample_test_cases. All
expected_output values must be exactly what correct code would print for that input, matching output_description.
"""

    return _call_gemini(prompt, response_schema=_PROBLEM_SCHEMA, temperature=0.7)
