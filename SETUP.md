# Setup & Run Guide

This project has two parts that must both be running at the same time:
- **Backend** — FastAPI (Python), serves the API on port `8000`
- **Frontend** — React + Vite, serves the UI on port `5173` (or next free port)

It uses **Supabase** (Postgres) for storage and **Gemini** for AI-powered code evaluation, feedback, hints, and problem generation.

---

## 1. Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- A Supabase project (free tier is fine)
- A Gemini API key ([get one here](https://aistudio.google.com/apikey))

---

## 2. One-time setup

### 2.1 Apply the database schema

1. Open your Supabase project → **SQL Editor**
2. Paste in the full contents of `database/schema.sql`
3. Run it — creates `participants`, `test_sessions`, `problems`, `test_cases`, `submissions`

### 2.2 Configure the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # macOS/Linux. Windows: venv\Scripts\activate
pip install -r requirements.txt
```

⚠️ **Verify the venv is actually active** — your terminal prompt must show `(venv)` at the start. If it doesn't, `pip install` will silently install into the wrong Python environment and the app will look like it's working but silently fall back to in-memory storage (no error shown). Double-check with:
```bash
which python3   # should point INSIDE backend/venv/bin/python3
pip show supabase   # should print version info, not "not found"
```

Edit `backend/.env`:
```env
APP_ENV=development
FRONTEND_URL=http://localhost:5173
TEST_DURATION_MINUTES=60
PORT=8000

SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_YOUR-SECRET-KEY

GEMINI_API_KEY=YOUR-GEMINI-KEY
GEMINI_MODEL=gemini-2.5-flash
```

Notes:
- `SUPABASE_SERVICE_KEY` is the **secret** key (starts `sb_secret_...`, or a legacy `service_role` JWT) — NOT the publishable/anon key. The publishable key and JWKS URL from Supabase's onboarding docs are for browser-side auth flows this app doesn't use.
- If `GEMINI_API_KEY` is left as a placeholder, code evaluation automatically falls back to a simple mock judge (still functional for testing, just not AI-graded).

### 2.3 Configure the frontend

```bash
cd frontend
npm install
```

Check `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

---

## 3. Running the app (every time)

**Terminal 1 — backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

---

## 4. Verifying it's actually working

| Check | How | Expect |
|---|---|---|
| Backend is up | Visit `http://localhost:8000/api/health` | `{"status": "ok", ...}` |
| API docs load | Visit `http://localhost:8000/docs` | Swagger UI |
| Problems seeded | Visit `http://localhost:8000/api/problems` | JSON array of 5 problems |
| Supabase actually connected | Backend startup log | No `Failed to connect to Supabase` warning |
| Data really persists | Supabase dashboard → Table Editor → `problems` | 5 rows (not empty) |
| Full flow works | Use the frontend to log in + submit a solution | New row appears in `test_sessions` then `submissions` (with a `feedback` value) |

---

## 5. Common issues

**"Unable to connect to the backend server" in the UI**
Usually a CORS mismatch — the frontend's actual port isn't in the backend's allowed origins list (`backend/app/main.py`, `origins = [...]`). Check what port Vite printed and add it there, or set `FRONTEND_URL` in `backend/.env` to match, then restart uvicorn.

**Another process already on port 5173**
```bash
lsof -i :5173          # see what's using it
npm run dev -- --port 5174   # or just run on a different port
```
If you change ports, also update backend CORS as above.

**Supabase table is empty even though the app "works"**
The app silently falls back to in-memory storage if the `supabase` Python package isn't actually importable in the environment running `uvicorn`. Always confirm the venv is active (`(venv)` in prompt) before running `pip install` or `uvicorn`. Use this quick test script to isolate connection issues:

```bash
cat > test_supabase_connection.py << 'EOF'
import os
from dotenv import load_dotenv
load_dotenv()
url = os.getenv("SUPABASE_URL", "").strip()
key = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
print(f"URL: {url}")
print(f"KEY starts with: {key[:15]}..." if key else "KEY: (empty)")
from supabase import create_client
try:
    client = create_client(url, key)
    res = client.table("problems").select("id").execute()
    print(f"Query result: {res.data}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
EOF
python3 test_supabase_connection.py
```
- `ModuleNotFoundError` → venv not active / dependencies not installed there
- `Query result: []` → connection works, table is just empty — restart `uvicorn` in the correct venv so seeding runs
- `Query result: [{'id': 1}, ...]` → everything is working correctly

**`ADMIN_SECRET` / `JUDGE0_API_KEY` in the root `.env.example`**
These are unused leftovers from early planning — ignore them. This app grades code via Gemini, not Judge0, and `POST /api/problems/generate` currently has no auth (flagged as a known gap — restrict it before deploying publicly).
