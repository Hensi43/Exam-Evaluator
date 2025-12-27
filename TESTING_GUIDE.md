# 🧪 TESTING GUIDE

## 1. AUTOMATED TESTS

We use **Pytest** for backend logic.

```bash
# Run all backend tests
source .venv/bin/activate
pytest apps/api/tests/
```

## 2. MANUAL VERIFICATION

### Authentication Flow
1.  **Register**:
    -   Open Mobile App (or Swagger UI).
    -   Enter valid Email/Password.
    -   **Expected**: Success message / Auto-login.
    -   **Database Check**: Use `sqlite3` or VS Code to verify row in `user` table.
2.  **Login**:
    -   Enter wrong password. -> **Expected**: Error "Invalid Credentials".
    -   Enter correct password. -> **Expected**: Navigate to Home Screen.

### AI Evaluation Flow
1.  **Capture**:
    -   Take a photo of a handwritten page.
2.  **Upload**:
    -   Ensure the loading spinner appears.
3.  **Result**:
    -   **Expected**: A score (0-100) and text feedback appear within 10 seconds.
    -   **Database Check**: Verify row in `exam` table with `user_id`.

## 3. TROUBLESHOOTING

-   **"ModuleNotFoundError: No module apps"**:
    -   Make sure you run python from the *Root Directory*, not inside `apps/api`.
    -   Correct: `python -m uvicorn apps.api.main:app ...`
-   **"Network Request Failed" (Mobile)**:
    -   On Android Emulator, use `http://10.0.2.2:8000`.
    -   On Real Device, use your computer's local IP (e.g., `http://192.168.1.5:8000`).
