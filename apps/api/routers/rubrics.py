from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from apps.api.database import get_session
from apps.api.models import User, Rubric
from apps.api.auth import get_current_user
from pydantic import BaseModel
import json

router = APIRouter(prefix="/rubrics", tags=["Rubrics"])

class RubricItem(BaseModel):
    description: str
    weight: float

class RubricCreate(BaseModel):
    title: str
    criteria: List[RubricItem]
    handwriting_weight: float = 0.0

@router.get("/", response_model=List[Rubric])
def get_rubrics(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    """List all rubrics for the logged-in teacher"""
    return session.exec(select(Rubric).where(Rubric.teacher_id == current_user.id)).all()

@router.post("/", response_model=Rubric)
def create_rubric(
    rubric_in: RubricCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    """Create a new rubric"""
    # Validate weights
    total_criteria_weight = sum(item.weight for item in rubric_in.criteria)
    total_weight = total_criteria_weight + rubric_in.handwriting_weight
    
    # Allow some floating point tolerance or just warn. 
    # For now, let's assume they might not sum to 100 exactly but should be close or normalized later.
    
    rubric = Rubric(
        title=rubric_in.title,
        criteria=json.dumps([item.dict() for item in rubric_in.criteria]),
        handwriting_weight=rubric_in.handwriting_weight,
        teacher_id=current_user.id
    )
    session.add(rubric)
    session.commit()
    session.refresh(rubric)
    return rubric
