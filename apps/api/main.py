from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.api.database import create_db_and_tables
from apps.api.routers import auth, scan, rubric, evaluate, classes, assessments, rubrics as rubric_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="Exam Evaluator API",
    description="Backend for AI-powered Exam Evaluation Agents",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(classes.router)
app.include_router(assessments.router)
app.include_router(rubric_router.router) # use alias to avoid conflict with existing 'rubric' module import if needed
app.include_router(scan.router, prefix="/api/v1/scan", tags=["Scanning"])
app.include_router(rubric.router, prefix="/api/v1/rubric", tags=["Rubric"]) # keeping old one for backward compat if any test relies on it
app.include_router(evaluate.router, prefix="/api/v1/evaluate", tags=["Evaluation"])

@app.get("/")
def read_root():
    return {"message": "Exam Evaluator API is running", "status": "active"}
