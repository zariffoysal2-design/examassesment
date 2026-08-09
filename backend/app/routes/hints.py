from fastapi import APIRouter, HTTPException, status
from app.models.schemas import HintRequest, HintResponse
from app.services import hint_service

router = APIRouter(prefix="/api/hints", tags=["Hints"])


@router.post("", response_model=HintResponse)
def get_hint(request: HintRequest):
    """
    Returns one short, Gemini-generated hint for the given problem and the
    candidate's current code, without revealing the full solution.
    """
    try:
        hint = hint_service.get_hint_for_problem(
            problem_id=request.problem_id,
            source_code=request.source_code,
            session_id=request.session_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate a hint right now: {e}",
        )

    return HintResponse(problem_id=request.problem_id, hint=hint)
