# Deployment & Scaling Guide

## Deployment Setup

### Frontend (Next.js)
- **Platform**: Vercel
- **Config**: Zero-config needed mostly, just link the GitHub repo.
- **Env**: `NEXT_PUBLIC_API_URL` pointing to the backend.

### Backend (FastAPI)
- **Platform**: Railway or AWS App Runner (Container based).
- **Docker**:
```dockerfile
# apps/api/Dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Database
- **Platform**: Supabase (Managed PostgreSQL).
- **Setup**: Create a project, get the `DATABASE_URL`, plug it into the Backend env.

## Scaling Strategy

### 1. Queue System for Heavy Workloads
OCR and LLM grading are slow (5-10s per page).
- **Move to Async Workers**: Use Celery + Redis.
- The API accepts the file and returns `202 Accepted`.
- A background worker processes the file.
- Client polls (or uses WebSockets) for status.

### 2. Caching
- Cache generated Rubrics. If 1000 students take the same exam, don't re-generate the rubric 1000 times.

### 3. Cost Optimization
- **OCR**: Use Tesseract (Free) for typed text, Cloud Vision ($$) only for handwriting.
- **LLM**: Use GPT-4o-mini or a fine-tuned Llama 3 model for grading simple answers to save costs.
