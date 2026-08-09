from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ParticipantCreate, SessionResponse, SessionDetailResponse
from app.services import session_service, submission_service

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_participant_session(participant: ParticipantCreate):
    """
    Creates a new test session for a participant.
    Server records start time and enforces 60-minute duration.
    """
    return session_service.create_session(participant)


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_participant_session(session_id: str):
    """
    Retrieves candidate session details, server expiration status, and score summary.
    """
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test session '{session_id}' was not found.",
        )

    summary = submission_service.get_session_submission_summary(session_id)
    return session_service.get_session_detail(session_id, summary)


@router.post("/{session_id}/finish")
def finish_participant_session(session_id: str):
    """
    Finishes an active test session, records server finish time, and locks further submissions.
    """
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test session '{session_id}' was not found.",
        )

    updated_session = session_service.finish_session(session_id)
    summary = submission_service.get_session_submission_summary(session_id)

    return {
        "session_id": updated_session["session_id"],
        "status": updated_session["status"],
        "finished_at": updated_session.get("finished_at"),
        "total_score": summary["total_score"],
        "problems_solved": summary["problems_solved"],
    }
