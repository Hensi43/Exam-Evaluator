from fastapi import APIRouter, File, UploadFile, HTTPException
from agents.vision_agent import VisionAgent
from agents.ocr_agent import OCRAgent
import uuid
import base64

router = APIRouter()
vision_agent = VisionAgent()
ocr_agent = OCRAgent()

# In-memory store for MVP
submissions = {} 

@router.post("/upload")
async def upload_scan(file: UploadFile = File(...)):
    submission_id = str(uuid.uuid4())
    contents = await file.read()
    
    try:
        # 1. Vision Processing (Deskew, Binarize)
        processed_img, _ = vision_agent.process_image(contents)
        
        # 2. OCR (Text Extraction)
        # Note: Tesseract needs image array or path. 
        # For simplicity in this step, we pass the numpy array directly if supported, 
        # or we might need to encode it back to bytes/PIL. 
        # Pytesseract supports numpy arrays.
        extracted_data = ocr_agent.extract_structured_data(processed_img)
        
        # Store result
        submissions[submission_id] = {
            "status": "PROCESSED",
            "data": extracted_data
        }
        
        return {
            "submission_id": submission_id,
            "status": "success",
            "extracted_text_preview": extracted_data["structured_response"][:2]
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
