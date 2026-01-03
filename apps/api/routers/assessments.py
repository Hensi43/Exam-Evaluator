from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from apps.api.database import get_session
from apps.api.models import User, Classroom, Assessment, Exam
from apps.api.auth import get_current_user
from pydantic import BaseModel, Field
from datetime import datetime

router = APIRouter(prefix="/assessments", tags=["Assessments"])

class AssessmentCreate(BaseModel):
    title: str
    classroom_id: int
    date: datetime = datetime.now()
    rubric_id: Annotated[int | None, Field(default=None)] = None

@router.get("/", response_model=List[Assessment])
def get_assessments(
    classroom_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = Query(default=100, le=100),
):
    """List assessments for a specific class"""
    classroom = session.get(Classroom, classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Class not found")
    if classroom.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    assessments = session.exec(
        select(Assessment)
        .where(Assessment.classroom_id == classroom_id)
        .order_by(Assessment.date.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    return assessments

@router.post("/", response_model=Assessment)
def create_assessment(
    assessment_in: AssessmentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    """Create a new assessment for a class"""
    classroom = session.get(Classroom, assessment_in.classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Class not found")
    if classroom.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    assessment = Assessment(
        title=assessment_in.title,
        date=assessment_in.date,
        classroom_id=assessment_in.classroom_id,
        rubric_id=assessment_in.rubric_id
    )
    session.add(assessment)
    session.commit()
    session.refresh(assessment)
    return assessment

@router.get("/{id}/exams")
def get_assessment_exams(
    id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = Query(default=100, le=100),
):
    """List all exams (submissions) for a specific assessment"""
    # Verify ownership
    assessment = session.get(Assessment, id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    classroom = session.get(Classroom, assessment.classroom_id)
    if classroom.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    exams = session.exec(
        select(Exam)
        .where(Exam.assessment_id == id)
        .order_by(Exam.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    return exams
