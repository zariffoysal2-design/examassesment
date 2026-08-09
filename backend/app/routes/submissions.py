from fastapi import APIRouter, HTTPException, status
from app.models.schemas import SubmissionCreate, SubmissionResponse
from app.services import session_service, problem_service, submission_service

router = APIRouter(prefix="/api/submissions", tags=["Submissions"])


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_code_solution(submission: SubmissionCreate):
    """
    Submits code for evaluation.
    Validates session, checks active status & expiration, records attempt,
    evaluates score server-side, and returns verdict.
    """
    # 1. Verify session existence & status
    session = session_service.get_session(submission.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{submission.session_id}' not found.",
        )

    # 2. Enforce session active status & expiration check
    if session["status"] == "expired":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Test session has expired. Further submissions are rejected.",
        )
    elif session["status"] == "completed":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Test session has already been completed.",
        )

    # 3. Verify problem existence
    problem = problem_service.get_problem(submission.problem_id)
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Problem with ID '{submission.problem_id}' not found.",
        )

    # 4. Record submission & evaluate score
    result = submission_service.submit_code(
        session_id=submission.session_id,
        problem_id=submission.problem_id,
        source_code=submission.source_code,
        language=submission.language,
    )

    return SubmissionResponse(**result)
