from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from apps.api.database import get_session
from apps.api.models import User, Classroom, Student, Exam, Assessment
from apps.api.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/classes", tags=["Classes"])

# Pydantic Models for Requests/Responses
class ClassroomCreate(BaseModel):
    name: str
    subject: str

class StudentCreate(BaseModel):
    name: str
    roll_number: str

class ClassroomWithStats(Classroom):
    student_count: int
    average_score: float

class StudentWithStats(Student):
    average_score: float

@router.get("/", response_model=List[ClassroomWithStats])
def get_classes(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    """List all classes for the current teacher with basic stats"""
    classes = session.exec(select(Classroom).where(Classroom.teacher_id == current_user.id)).all()
    
    results = []
    for cls in classes:
        # Get student count
        student_count = session.exec(select(func.count(Student.id)).where(Student.classroom_id == cls.id)).one()
        
        # Get class average (from all exams in this class)
        # Note: This is a simple average of all exams linked to this class
        avg_score = session.exec(
             select(func.avg(Exam.score)).where(Exam.classroom_id == cls.id)
        ).one() or 0.0
        
        results.append(ClassroomWithStats(
            **cls.dict(),
            student_count=student_count,
            average_score=round(avg_score, 1)
        ))
    
    return results

@router.post("/", response_model=Classroom)
def create_class(
    classroom_in: ClassroomCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    """Create a new class"""
    classroom = Classroom(
        name=classroom_in.name,
        subject=classroom_in.subject,
        teacher_id=current_user.id
    )
    session.add(classroom)
    session.commit()
    session.refresh(classroom)
    return classroom

@router.get("/{class_id}", response_model=ClassroomWithStats)
def get_class_detail(
    class_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    """Get class details including stats"""
    classroom = session.get(Classroom, class_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Class not found")
    if classroom.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this class")
        
    student_count = session.exec(select(func.count(Student.id)).where(Student.classroom_id == class_id)).one()
    avg_score = session.exec(
        select(func.avg(Exam.score)).where(Exam.classroom_id == class_id)
    ).one() or 0.0
    
    return ClassroomWithStats(
        **classroom.dict(),
        student_count=student_count,
        average_score=round(avg_score, 1)
    )

@router.get("/{class_id}/students", response_model=List[StudentWithStats])
def get_class_students(
    class_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    """List students in a class with their individual averages"""
    classroom = session.get(Classroom, class_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Class not found")
    if classroom.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    students = session.exec(select(Student).where(Student.classroom_id == class_id)).all()
    
    results = []
    for student in students:
        avg = session.exec(
            select(func.avg(Exam.score)).where(Exam.student_id == student.id)
        ).one() or 0.0
        
        results.append(StudentWithStats(
            **student.dict(),
            average_score=round(avg, 1)
        ))
        
    return results

@router.post("/{class_id}/students", response_model=Student)
def add_student(
    class_id: int,
    student_in: StudentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    """Add a student to a class"""
    classroom = session.get(Classroom, class_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Class not found")
    if classroom.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    student = Student(
        name=student_in.name,
        roll_number=student_in.roll_number,
        classroom_id=class_id
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    return student
