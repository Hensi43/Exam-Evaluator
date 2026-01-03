from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    full_name: Optional[str] = None


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str


class UserCreate(UserBase):
    password: str




class Classroom(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    subject: str
    teacher_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    roll_number: str
    classroom_id: int = Field(foreign_key="classroom.id")

class Rubric(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    criteria: str = Field(default="[]") # JSON string of criteria [{"description": "x", "weight": 10}]
    handwriting_weight: float = Field(default=0.0)
    teacher_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Assessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    date: datetime = Field(default_factory=datetime.utcnow)
    classroom_id: int = Field(foreign_key="classroom.id")
    rubric_id: Optional[int] = Field(default=None, foreign_key="rubric.id")
    reference_exam_id: Optional[int] = Field(default=None, foreign_key="exam.id") # The "Golden Answer"

class Exam(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    image_url: str
    ocr_content: Optional[str] = Field(default=None) # Raw text extracted
    feedback: str
    score: int
    content_score: int = Field(default=0)
    handwriting_score: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id") # Teacher who scanned it
    student_id: Optional[int] = Field(default=None, foreign_key="student.id")
    classroom_id: Optional[int] = Field(default=None, foreign_key="classroom.id")
    assessment_id: Optional[int] = Field(default=None, foreign_key="assessment.id")
