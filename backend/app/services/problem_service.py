from typing import List, Dict, Any, Optional
from app.services import gemini_service
from app.services.database import db


def get_all_public_problems() -> List[Dict[str, Any]]:
    """
    Returns public metadata for all problems.
    Hidden test cases are stripped out.
    """
    return db.get_all_public_problems()


def get_problem(problem_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieves problem details by ID.
    """
    return db.get_problem_by_id(problem_id)


def generate_problem(topic: str, difficulty: str, save: bool = True) -> Dict[str, Any]:
    """
    Uses Gemini to generate a brand-new problem (title, description, starter
    code, sample + hidden test cases). If `save` is True, persists it into the
    problem bank (in-memory and Supabase, when configured) and returns it with
    its assigned id; otherwise returns a preview without an id.
    """
    if not gemini_service.is_gemini_configured():
        raise RuntimeError(
            "Problem generation requires the Gemini API to be configured (set GEMINI_API_KEY)."
        )

    existing_titles = [p["title"] for p in db.get_all_public_problems()]
    generated = gemini_service.generate_problem(topic, difficulty, existing_titles)

    if save:
        return db.add_generated_problem(generated)

    return {**generated, "id": None}
