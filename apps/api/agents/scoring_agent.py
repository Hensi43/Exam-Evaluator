import json
import google.generativeai as genai
from typing import Dict, Any, List, Optional

class ScoringAgent:
    def __init__(self):
        pass

    def evaluate_submission(self, student_data: List[Dict], rubric: Dict, api_key: str) -> Dict[str, Any]:
        """
        Compares student answers against the rubric semantically using Gemini.
        """
        if not api_key:
             raise ValueError("API Key is required for real AI processing.")

        genai.configure(api_key=api_key, transport='rest')
        model = genai.GenerativeModel('gemini-flash-latest')

        # Prepare context
        rubric_str = json.dumps(rubric, indent=2)
        student_answers_str = json.dumps(student_data, indent=2)

        prompt = f"""
        You are a strict and fair examiner.
        
        RUBRIC:
        {rubric_str}

        STUDENT ANSWERS:
        {student_answers_str}

        Task:
        1. For each student answer, find the corresponding question in the rubric.
        2. Grade the answer based on the key points and partial credit rules.
        3. Be fair. Semantic matches (synonyms) count.

        Output Format (STRICT JSON, no markdown blocks):
        {{
            "total_score": <number>,
            "max_score": <number>,
            "detailed_results": [
                {{
                    "question_id": "<id>",
                    "score": <number>,
                    "max_marks": <number>,
                    "feedback": "<concise justification>",
                    "student_text": "<original text>"
                }}
            ]
        }}
        """

        try:
            response = model.generate_content(prompt, request_options={'timeout': 30})
            cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned_text)
        except Exception as e:
             raise e
