from typing import Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form
from sqlmodel import Session
from apps.api.database import get_session
from apps.api.models import Exam, Assessment, Rubric
from apps.api.agents.vision_agent import VisionAgent
from apps.api.agents.ocr_agent import OCRAgent
import uuid
import base64

router = APIRouter()
vision_agent = VisionAgent()
ocr_agent = OCRAgent()

# In-memory store for MVP
submissions = {} 

@router.post("/upload")
async def upload_scan(
    file: UploadFile = File(...),
    assessment_id: Optional[int] = Form(None),
    student_id: Optional[int] = Form(None),
    session: Session = Depends(get_session)
):
    submission_id = str(uuid.uuid4())
    contents = await file.read()
    
    try:
        # 1. Vision Processing
        processed_img, _ = vision_agent.process_image(contents)
        
        # 2. OCR (Text Extraction)
        extracted_data = ocr_agent.extract_structured_data(processed_img)
        student_response = extracted_data.get("structured_response", "")
        # If OCR returns a list/dict, convert to string for the new scoring agent interface
        if isinstance(student_response, list) or isinstance(student_response, dict):
            import json
            student_response = json.dumps(student_response)

        # 3. Fetch Rubric & Configuration
        rubric_dict = {}
        if assessment_id:
            assessment = session.get(Assessment, assessment_id)
            if assessment and assessment.rubric_id:
                rubric = session.get(Rubric, assessment.rubric_id)
                if rubric:
                    rubric_dict = {
                        "title": rubric.title,
                        "criteria": rubric.criteria, # JSON string
                        "handwriting_weight": rubric.handwriting_weight
                    }
        
        # 4. AI Grading
        # Note: In a real app, strict error handling if no rubric found implies we can't grade.
        # For now, we'll proceed if we have a rubric, otherwise skip grading or use default.
        
        grading_result = {}
        if rubric_dict:
            # We need an API key. In MVP, let's grab it from env or assume configured.
            # Ideally passed from client or stored in specific config.
            import os
            api_key = os.getenv("GEMINI_API_KEY") 
            if api_key:
                from apps.api.agents.scoring_agent import ScoringAgent
                scorer = ScoringAgent() # Use fresh instance or global
                grading_result = scorer.evaluate_submission(student_response, rubric_dict, api_key=api_key)
        
        # 5. Save Record
        exam = Exam(
            title=f"Scan {submission_id[:8]}",
            image_url="s3_or_local_path_placeholder", # We aren't saving image file in this MVP step
            feedback=grading_result.get("feedback", "Pending evaluation"),
            score=grading_result.get("final_score", 0),
            content_score=grading_result.get("content_score", 0),
            handwriting_score=grading_result.get("handwriting_score", 0),
            user_id=None, # TBD: Authenticated user uploading
            student_id=student_id,
            assessment_id=assessment_id,
            classroom_id=assessment.classroom_id if assessment_id and assessment else None
        )
        session.add(exam)
        session.commit()
        session.refresh(exam)

        return {
            "submission_id": submission_id,
            "exam_id": exam.id,
            "status": "graded" if grading_result else "processed_no_grading",
            "score": exam.score,
            "feedback": exam.feedback
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
