from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class ParticipantCreate(BaseModel):
    name: str = Field(..., description="Full Name of the candidate")
    university: str = Field(..., description="University Name")
    student_id: str = Field(..., description="Student ID number")

    @field_validator("name", "university", "student_id")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Field cannot be empty or whitespace-only")
        return trimmed


class SessionResponse(BaseModel):
    session_id: str
    name: str
    university: str
    student_id: str
    started_at: datetime
    expires_at: datetime
    status: str  # 'active', 'completed', 'expired'


class SessionDetailResponse(BaseModel):
    session_id: str
    name: str
    university: str
    student_id: str
    status: str
    started_at: datetime
    expires_at: datetime
    total_score: int
    problems_solved: int
    total_submissions: int


class ProblemPublicResponse(BaseModel):
    id: int
    problem_number: int
    title: str
    topic: str
    difficulty: str
    points: int
    time_limit: float
    memory_limit: int
    description: str
    input_description: str
    output_description: str
    sample_input: str
    sample_output: str
    starter_code: str


class SubmissionCreate(BaseModel):
    session_id: str = Field(..., description="Active session UUID")
    problem_id: int = Field(..., description="Problem ID (1 to 5)")
    source_code: str = Field(..., description="Python source code")
    language: str = Field("python", description="Programming language (default python)")


class SubmissionResponse(BaseModel):
    submission_id: str
    problem_id: int
    attempt_number: int
    verdict: str  # 'Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded'
    score: int
    runtime: float
    memory: Optional[float] = None
    feedback: Optional[str] = None
    submitted_at: datetime


class HealthResponse(BaseModel):
    status: str
    service: str


class HintRequest(BaseModel):
    problem_id: int = Field(..., description="Problem the candidate wants a hint for")
    source_code: str = Field("", description="Candidate's current code in the editor")
    session_id: Optional[str] = Field(None, description="Active session UUID, if available")


class HintResponse(BaseModel):
    problem_id: int
    hint: str


class GenerateProblemRequest(BaseModel):
    topic: str = Field(..., description="Topic for the new problem, e.g. 'recursion', 'strings'")
    difficulty: str = Field("Medium", description="Easy | Easy/Medium | Medium | Hard")
    save: bool = Field(True, description="If true, persist the generated problem to the problem bank")


class GenerateProblemResponse(BaseModel):
    id: Optional[int] = None
    title: str
    topic: str
    difficulty: str
    points: int
    description: str
    input_description: str
    output_description: str
    sample_input: str
    sample_output: str
    starter_code: str
    saved: bool
