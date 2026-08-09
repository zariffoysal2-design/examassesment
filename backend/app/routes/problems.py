from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ProblemPublicResponse, GenerateProblemRequest, GenerateProblemResponse
from app.services import problem_service

router = APIRouter(prefix="/api/problems", tags=["Problems"])


@router.get("", response_model=List[ProblemPublicResponse])
def list_problems():
    """
    Returns public problem metadata for all assessment problems.
    NEVER exposes hidden test case inputs or expected outputs.
    """
    return problem_service.get_all_public_problems()


@router.post("/generate", response_model=GenerateProblemResponse, status_code=status.HTTP_201_CREATED)
def generate_problem(request: GenerateProblemRequest):
    """
    Admin utility: uses Gemini to generate a new problem (with sample + hidden
    test cases) for the requested topic/difficulty. Saves it to the problem
    bank by default so it's immediately available via GET /api/problems.

    NOTE: this endpoint has no auth check yet — restrict access at the
    deployment/network layer (or add an admin-only dependency) before
    exposing it publicly.
    """
    try:
        problem = problem_service.generate_problem(
            topic=request.topic, difficulty=request.difficulty, save=request.save
        )
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate a problem right now: {e}",
        )

    return GenerateProblemResponse(
        id=problem.get("id"),
        title=problem["title"],
        topic=problem["topic"],
        difficulty=problem["difficulty"],
        points=problem["points"],
        description=problem["description"],
        input_description=problem["input_description"],
        output_description=problem["output_description"],
        sample_input=problem["sample_input"],
        sample_output=problem["sample_output"],
        starter_code=problem["starter_code"],
        saved=problem.get("id") is not None,
    )
