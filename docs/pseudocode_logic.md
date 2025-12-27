# Core Agent Logic Pseudocode

## 1. Vision Agent (Image Preprocessing)
```python
class VisionAgent:
    def process_image(self, image_bytes):
        # Load image
        img = cv2.decode(image_bytes)
        
        # 1. Edge Detection
        edges = cv2.Canny(img, 100, 200)
        contours = cv2.findContours(edges)
        
        # 2. Find Page Corners (Largest Rectangle)
        page_contour = find_largest_poly(contours)
        
        # 3. Perspective Transform (Flatten)
        warped = four_point_transform(img, page_contour)
        
        # 4. Adaptive Thresholding (Binarization for Clean Text)
        processed = cv2.adaptiveThreshold(warped)
        
        return processed
```

## 2. Evaluation Agent (Semantic Scoring)
```python
class EvaluationAgent:
    def evaluate_answer(self, student_answer: str, question_rubric: Dict):
        """
        Uses LLM to compare meaning, not just keywords.
        """
        prompt = f"""
        You are an expert examiner.
        Question: {question_rubric['question_text']}
        Model Answer Points: {question_rubric['key_points']}
        Student Answer: "{student_answer}"
        Max Marks: {question_rubric['max_marks']}
        
        Task:
        1. Compare the student answer to the model points.
        2. Award marks based on semantic understanding.
        3. Explain strictly why marks were deducted.
        """
        
        response = llm_client.chat(prompt)
        return parse_json(response) # {score, justification}
```

## 3. Recovery Agent (Error Handling)
```python
def process_pipeline(image):
    try:
        clean_image = VisionAgent.process(image)
        text = OCRAgent.extract(clean_image)
    except VisionError:
        # Fallback: Try without cropping
        text = OCRAgent.extract(image)
        log_warning("Vision Agent failed, using raw image")
    
    if text.confidence < 0.6:
        # Flag for human review
        return {
            "status": "FLAGGED",
            "reason": "Low OCR Confidence - Handwriting unclear"
        }
        
    return EvaluationAgent.evaluate(text)
```
