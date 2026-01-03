from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from apps.api.agents.scoring_agent import ScoringAgent
# Import the in-memory store from scan router
from apps.api.routers.scan import submissions

class EvaluationRequest(BaseModel):
    rubric: Dict[str, Any]

router = APIRouter()
scoring_agent = ScoringAgent()

@router.post("/{submission_id}")
async def evaluate_submission(submission_id: str, request: EvaluationRequest, x_gemini_api_key: Optional[str] = Header(None)):
    # Retrieve submission
    submission = submissions.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    student_data = submission["data"]["structured_response"]
    
    try:
        results = scoring_agent.evaluate_submission(student_data, request.rubric, api_key=x_gemini_api_key)
        return results
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
