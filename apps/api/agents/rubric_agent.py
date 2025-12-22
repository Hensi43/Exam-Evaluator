import json
import google.generativeai as genai
from typing import Dict, Any, Optional
import os

class RubricAgent:
    def __init__(self):
        pass

    def generate_rubric(self, model_answer_text: str, api_key: str) -> Dict[str, Any]:
        """
        Parses raw model answer text into a structured rubric using Gemini.
        """
        if not api_key:
             raise ValueError("API Key is required for real AI processing.")
        
        genai.configure(api_key=api_key, transport='rest')
        model = genai.GenerativeModel('gemini-flash-latest')

        prompt = f"""
        You are an educational expert. Convert the following "Model Answer" into a structured grading rubric.
        
        Model Answer:
        "{model_answer_text}"

        Output Format (STRICT JSON, no markdown blocks):
        {{
            "exam_id": "auto_generated",
            "questions": [
                {{
                    "id": "1",
                    "question_text": "Infer the question from the answer if possible",
                    "max_marks": 5,
                    "key_points": ["point 1", "point 2"],
                    "partial_credit_rule": "Guidelines for partial marks"
                }}
            ]
        }}
        """

        try:
            response = model.generate_content(prompt, request_options={'timeout': 30})
            # Cleanup markdown if present
            cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned_text)
        except Exception as e:
            print(f"LLM Error: {e}")
            # Fallback for demo if quota exceeded or key invalid, but we try to warn
            raise e
