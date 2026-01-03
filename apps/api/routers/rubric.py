from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from apps.api.agents.rubric_agent import RubricAgent
from typing import Optional

class RubricRequest(BaseModel):
    answer_text: str

router = APIRouter()
rubric_agent = RubricAgent()

@router.post("/generate")
async def generate_rubric(request: RubricRequest, x_gemini_api_key: Optional[str] = Header(None)):
    # API Key is passed via header

    try:
        # Pass the key to the agent
        rubric = rubric_agent.generate_rubric(request.answer_text, api_key=x_gemini_api_key)
        return {"rubric": rubric}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
