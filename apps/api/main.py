from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import scan, rubric, evaluate

app = FastAPI(
    title="Exam Evaluator API",
    description="Backend for AI-powered Exam Evaluation Agents",
    version="0.1.0",
)

# CORS Configuration
origins = [
    "http://localhost:3000",  # Next.js Frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(scan.router, prefix="/api/v1/scan", tags=["Scanning"])
app.include_router(rubric.router, prefix="/api/v1/rubric", tags=["Rubric"])
app.include_router(evaluate.router, prefix="/api/v1/evaluate", tags=["Evaluation"])

@app.get("/")
async def root():
    return {"message": "Exam Evaluator API is running", "agents_status": "standby"}
