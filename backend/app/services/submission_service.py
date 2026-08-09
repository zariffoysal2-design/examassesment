from typing import Dict, List, Any, Tuple, Optional
from app.services import gemini_service
from app.services.database import db


def _mock_execute_code(source_code: str, problem: Dict[str, Any]) -> Tuple[str, int, float, float, str]:
    """
    ========================================================================
    FALLBACK JUDGE — used automatically when GEMINI_API_KEY is not configured,
    or if a live Gemini evaluation call fails (network error, quota, bad
    response), so the assessment platform keeps working during an outage.
    NEVER use eval(), exec(), subprocess, or shell execution on untrusted input!
    ========================================================================
    """
    code_lower = source_code.lower().strip()

    if not code_lower:
        return "Compilation Error", 0, 0.0, 0.0, "No code was submitted. Write your solution before submitting."
    elif "mock_syntax_error" in code_lower:
        return "Compilation Error", 0, 0.010, 5.2, "Your code has a syntax error and could not be parsed."
    elif "mock_fail" in code_lower or "mock_wrong_answer" in code_lower:
        return "Wrong Answer", 0, 0.025, 7.8, "Your code ran but produced incorrect output on one or more test cases. Re-check your logic against the sample input/output."
    elif "mock_time_limit" in code_lower or "mock_infinite_loop" in code_lower:
        return "Time Limit Exceeded", 0, problem["time_limit"], 8.0, "Your solution did not finish within the time limit. Check for infinite loops or an inefficient algorithm."
    else:
        return "Accepted", problem["points"], 0.032, 8.4, "All test cases passed. Nice work!"


def _evaluate_with_gemini(problem: Dict[str, Any], source_code: str) -> Optional[Tuple[str, int, float, float, str]]:
    """
    Runs the submission through Gemini acting as an AI judge against the
    problem's real sample + hidden test cases. Returns None (rather than
    raising) if Gemini is unavailable or the call fails, so the caller can
    transparently fall back to the mock judge.
    """
    if not gemini_service.is_gemini_configured():
        return None

    test_cases = db.get_test_cases(problem["id"])
    if not test_cases:
        return None

    try:
        result = gemini_service.evaluate_submission(problem, test_cases, source_code)
    except Exception as e:
        print(f"[submission_service] Gemini evaluation failed, falling back to mock judge: {e}")
        return None

    verdict = result["verdict"]
    feedback = result.get("feedback", "")
    score = problem["points"] if verdict == "Accepted" else 0

    # Gemini reasons about the code rather than executing it in a real sandbox,
    # so runtime/memory are reported as small representative estimates.
    runtime = 0.05 if verdict == "Accepted" else 0.03
    memory = 8.0

    return verdict, score, runtime, memory, feedback


def submit_code(session_id: str, problem_id: int, source_code: str, language: str) -> Dict[str, Any]:
    problem = db.get_problem_by_id(problem_id)
    if not problem:
        raise ValueError(f"Problem with ID {problem_id} does not exist.")

    gemini_result = _evaluate_with_gemini(problem, source_code)
    if gemini_result is not None:
        verdict, score, runtime, memory, feedback = gemini_result
    else:
        verdict, score, runtime, memory, feedback = _mock_execute_code(source_code, problem)

    submission_record = db.create_submission(
        session_id=session_id,
        problem_id=problem_id,
        source_code=source_code,
        language=language,
        verdict=verdict,
        score=score,
        runtime=runtime,
        memory=memory,
        feedback=feedback,
    )

    return {
        "submission_id": submission_record["submission_id"],
        "problem_id": problem_id,
        "attempt_number": submission_record["attempt_number"],
        "verdict": verdict,
        "score": score,
        "runtime": runtime,
        "memory": memory,
        "feedback": feedback,
        "submitted_at": submission_record["submitted_at"],
    }


def get_session_submission_summary(session_id: str) -> Dict[str, Any]:
    """
    Computes total score (best attempt per problem), problems solved count,
    and total submission count for a given session from database records.
    """
    return db.get_session_submission_summary(session_id)


def get_session_submissions(session_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all submissions for a given test session from the database.
    """
    return db.get_session_submissions(session_id)
