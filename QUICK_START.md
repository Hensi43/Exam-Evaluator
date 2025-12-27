# ⚡ QUICK START

Follow these steps to run the **Exam Evaluator** locally.

## PREREQUISITES
- Node.js (v18+)
- Python (3.11+)
- Expo Go App (on your phone) OR Android/iOS Simulator

## 1. BACKEND (API)

The backend handles the AI logic and database.

```bash
# 1. Navigate to root
cd exam-evaluator

# 2. Activate Virtual Env (create if missing: python -m venv .venv)
source .venv/bin/activate

# 3. Install Dependencies
pip install -r apps/api/requirements.txt

# 4. Start Server (Port 8000)
# NOTE: Must run from project root!
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```
> API Docs will be available at: http://localhost:8000/docs

## 2. FRONTEND (MOBILE APP)

The mobile app built with Expo.

```bash
# 1. Open a new terminal
cd exam-evaluator/apps/mobile

# 2. Install Dependencies
npm install

# 3. Start Expo
npx expo start
```
> Press `w` for Web, or scan the QR code with your phone.

## 3. VERIFICATION

1. Go to `http://localhost:8000/docs`.
2. Register a user via `POST /auth/register`.
3. The database file `database.db` will appear in `apps/api/`.
