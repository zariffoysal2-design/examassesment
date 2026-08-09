from typing import Optional
from app.services import gemini_service
from app.services.database import db


def get_hint_for_problem(problem_id: int, source_code: str, session_id: Optional[str] = None) -> str:
    problem = db.get_problem_by_id(problem_id)
    if not problem:
        raise ValueError(f"Problem with ID {problem_id} does not exist.")

    if not gemini_service.is_gemini_configured():
        raise RuntimeError(
            "Hints require the Gemini API to be configured (set GEMINI_API_KEY)."
        )

    previous_verdict = None
    previous_feedback = None
    if session_id:
        submissions = [
            s for s in db.get_session_submissions(session_id) if s["problem_id"] == problem_id
        ]
        if submissions:
            last = submissions[-1]
            previous_verdict = last.get("verdict")
            previous_feedback = last.get("feedback")

    return gemini_service.get_hint(
        problem,
        source_code,
        previous_verdict=previous_verdict,
        previous_feedback=previous_feedback,
    )
