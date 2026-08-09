import os
from typing import Dict, Any, Optional
from app.models.schemas import ParticipantCreate, SessionResponse, SessionDetailResponse
from app.services.database import db

TEST_DURATION_MINUTES = int(os.getenv("TEST_DURATION_MINUTES", "60"))


def create_session(participant: ParticipantCreate) -> SessionResponse:
    """
    Creates a new candidate test session.
    Server records start time and calculates 60-minute duration expiry.
    """
    session_data = db.create_session(
        name=participant.name,
        university=participant.university,
        student_id=participant.student_id,
        duration_minutes=TEST_DURATION_MINUTES,
    )
    return SessionResponse(**session_data)


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves test session details and checks for server-side expiration.
    """
    return db.get_session(session_id)


def get_session_detail(session_id: str, submission_summary: Dict[str, Any]) -> Optional[SessionDetailResponse]:
    """
    Builds detailed session response with score summary.
    """
    session = get_session(session_id)
    if not session:
        return None

    return SessionDetailResponse(
        session_id=session["session_id"],
        name=session["name"],
        university=session["university"],
        student_id=session["student_id"],
        status=session["status"],
        started_at=session["started_at"],
        expires_at=session["expires_at"],
        total_score=submission_summary["total_score"],
        problems_solved=submission_summary["problems_solved"],
        total_submissions=submission_summary["total_submissions"],
    )


def finish_session(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Marks an active session as completed in the database.
    """
    return db.finish_session(session_id)
