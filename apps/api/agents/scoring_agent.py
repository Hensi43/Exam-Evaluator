import json
import google.generativeai as genai
from typing import Dict, Any, List, Optional

class ScoringAgent:
    def __init__(self):
        pass

    def evaluate_submission(self, student_response: str, rubric: Dict[str, Any], api_key: str = None) -> Dict[str, Any]:
        """
        Evaluates a student submission against a weighted rubric using Gemini.
        rubric: {
            "title": str,
            "criteria": [{"description": str, "weight": float}],
            "handwriting_weight": float
        }
        """
        if not api_key:
             raise ValueError("API Key is required/configured for real AI processing.")

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Format criteria for the prompt
        criteria_list = rubric.get('criteria', [])
        # If criteria came from DB as string, parse it
        if isinstance(criteria_list, str):
            try:
                criteria_list = json.loads(criteria_list)
            except:
                criteria_list = []

        criteria_text = "\n".join([f"- {c.get('description', 'Criterion')} (Weight: {c.get('weight', 0)}%)" for c in criteria_list])
        handwriting_weight = float(rubric.get('handwriting_weight', 0))

        prompt = f"""
        You are an expert strict exam grader. 
        
        **Rubric Criteria:**
        {criteria_text}
        
        **Handwriting Policy:**
        - Evaluate the handwriting legibility on a scale of 0-100.
        - This contributes {handwriting_weight}% to the final score.
        
        **Student Response:**
        "{student_response}"
        
        **Task:**
        1. Evaluate the content against EACH rubric criterion. Assign a score (0-100) for each criterion based on correctness.
        2. Calculate 'content_score' (0-100) as the weighted average of the individual criterion scores.
        3. Evaluate 'handwriting_score' (0-100) based on legibility and neatness.
        4. Provide specific, constructive feedback explaining the score.

        **Output JSON Format ONLY:**
        {{
            "content_score": <int 0-100>,
            "handwriting_score": <int 0-100>,
            "feedback": "<string>",
            "criterion_breakdown": [
                {{ "criterion": "<description>", "score": <int>, "reason": "<string>" }}
            ]
        }}
        """

        try:
            response = model.generate_content(prompt)
            # Simple cleanup if the model returns markdown code blocks
            text = response.text.replace('```json', '').replace('```', '').strip()
            result = json.loads(text)
            
            # Calculate final weighted score locally for safety, or trust the model? 
            # Let's calculate locally to ensure weights are respected.
            
            c_score = float(result.get('content_score', 0))
            h_score = float(result.get('handwriting_score', 0))
            
            # Total = (Content Score * ((100-H_Weight)/100)) + (Handwriting Score * (H_Weight/100))
            content_weight_factor = (100.0 - handwriting_weight) / 100.0
            handwriting_weight_factor = handwriting_weight / 100.0
            
            final_score = (c_score * content_weight_factor) + (h_score * handwriting_weight_factor)
            
            result['final_score'] = round(final_score)
            return result
            
        except Exception as e:
            print(f"Error in ScoringAgent: {e}")
            # Fallback
            return {
                "content_score": 0,
                "handwriting_score": 0,
                "final_score": 0,
                "feedback": f"Error evaluating submission: {str(e)}"
            }
