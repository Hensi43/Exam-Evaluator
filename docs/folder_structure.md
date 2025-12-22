# Project Structure & Monorepo Setup

This project uses a **Monorepo** architecture to manage the Frontend (UX Agent) and Backend (AI Agents) in a single repository. This ensures type safety and easy sharing of config.

```
exam-evaluator/
├── apps/
│   ├── web/                 # Next.js 14 (App Router) - The UX Agent
│   │   ├── app/             # Pages & Layouts
│   │   ├── components/      # React Components (Upload, Results, Camera)
│   │   ├── lib/             # API Clients & Utilities
│   │   └── public/          # Static Assets
│   │
│   └── api/                 # FastAPI (Python) - The Core AI Agents
│       ├── agents/
│       │   ├── vision_agent.py   # OpenCV / Edge Detection
│       │   ├── ocr_agent.py      # Text Extraction
│       │   ├── scoring_agent.py  # Semantic Evaluation Logic
│       │   └── rubric_agent.py   # Model Answer Parsing
│       ├── routers/         # API Endpoints
│       ├── main.py          # Server Entrypoint
│       └── requirements.txt
│
├── packages/
│   └── shared-config/       # Shared linting/typescript config
│
├── docs/                    # Architecture & Design Docs
├── docker-compose.yml       # Local Dev Orchestration
└── README.md                # Entry point
```

## detailed Breakdown

### `apps/web` (Frontend)
- **Framework**: Next.js 14
- **Styling**: TailwindCSS
- **State**: React Query (TanStack Query) for async agent state.
- **Responsibility**: Camera handling, Image Upload, Result Visualization, Annotation Overlay.

### `apps/api` (Backend)
- **Framework**: FastAPI (Async Python)
- **Responsibility**: Orchestrating the AI agents.
- **Why Python?**: Native support for PyTorch, OpenCV, and LangChain/LLM libraries is essential for the "Model Answer" and "Evaluation" agents.
