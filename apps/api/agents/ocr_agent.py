import cv2
import pytesseract
import json
import os
from typing import Dict, Any

class OCRAgent:
    def __init__(self):
        # Check if tesseract is available in PATH
        self.use_mock = False
        try:
            pytesseract.get_tesseract_version()
        except Exception:
            print("Warning: Tesseract not found. Using Mock OCR.")
            self.use_mock = True

    def extract_text(self, image: Any) -> str:
        """
        Raw text extraction.
        """
        if self.use_mock:
            return self._mock_ocr_response()
        
        # Tesseract configuration for block of text
        custom_config = r'--oem 3 --psm 6' 
        text = pytesseract.image_to_string(image, config=custom_config)
        return text

    def extract_structured_data(self, image: Any) -> Dict[str, Any]:
        """
        Extracts text and converts to structured JSON.
        """
        raw_text = self.extract_text(image)
        
        # Heuristic parsing (Simple MVP version)
        # Assumes format "1. Answer..."
        structure = []
        lines = raw_text.split('\n')
        current_question = "unknown"
        current_answer = []

        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect Question Number (e.g., "1.", "Q1", "2)")
            if line[0].isdigit() and (line[1] == '.' or line[1] == ')'):
                if current_answer:
                    structure.append({
                        "question_no": current_question,
                        "answer_text": " ".join(current_answer)
                    })
                current_question = line.split(' ')[0].strip('.)')
                current_answer = [line[len(current_question)+1:].strip()]
            else:
                current_answer.append(line)
        
        # Append last
        if current_answer:
            structure.append({
                "question_no": current_question,
                "answer_text": " ".join(current_answer)
            })

        return {
            "raw_text": raw_text,
            "structured_response": structure
        }

    def _mock_ocr_response(self):
        return """
        1. The mitochondria is the powerhouse of the cell. It generates ATP.
        2. Photosynthesis is the process by which green plants use sunlight to synthesize nutrients.
        3. Newton's third law states that for every action there is an equal and opposite reaction.
        """
