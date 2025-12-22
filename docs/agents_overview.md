# Agent Definitions

## 1. Camera Agent
**Role:** The "Eye".
**Function:** Runs primarily on the client (Frontend) to guide the user to take a good photo, and on the server (Vision Agent) to perfect the image.
**Tech:** React-Webcam, OpenCV (Server).

## 2. OCR Agent
**Role:** The "Transcriber".
**Function:** Converts raw pixels into structured digital text. It is robust against "Indian Exam" handwriting styles (cursive, overwriting).
**Tech:** Google Cloud Vision (Recommended for production) or paddleOCR.

## 3. Model Answer Agent
**Role:** The "Head Examiner".
**Function:** It doesn't just read the answer key; it understands it. It breaks down a paragraph answer into a "marking scheme" or "rubric" with points for keywords, concepts, and steps.

## 4. Evaluation Agent
**Role:** The "Grader".
**Philosophy:** "Award marks for knowledge, not just matching words."
**Function:** Performs Semantic Similarity checks. If the model answer says "H2O" and student writes "Water", it awards full marks.

## 5. Annotation Agent
**Role:** The "Feedback Giver".
**Function:** Maps the digital text back to the coordinate space of the original image. When the Evaluation Agent says "Line 4 is wrong", the Annotation Agent draws a red box around Line 4 on the user's screen.

## 6. UX Agent
**Role:** The "Interface".
**Function:** Manages the user flow. It handles the "Happy Path" (Scan -> Grade -> Result) and the "Unhappy Path" (Scan -> Blurry -> Retry).

## 7. Debug & Recovery Agent
**Role:** The "Supervisor".
**Function:** Watches the other agents. If OCR returns garbage, it triggers image enhancement filters. If the LLM hallucinates (e.g., awards > max marks), it clamps the score and flags an internal error.
