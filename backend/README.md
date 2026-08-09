# Programming Assessment Platform - FastAPI Backend

FastAPI backend service providing candidate session management, server-side timer enforcement, problem retrieval without hidden test cases, submission scoring, and session lifecycle management.

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   python -m pip install -r requirements.txt
   ```

2. **Environment Configuration**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. **Run Backend Development Server**:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   Or directly with `uvicorn`:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. **Interactive API Documentation**:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

5. **Run Unit Test Suite**:
   ```bash
   python -m pytest
   ```

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/sessions` | Create participant session (UUID4 & 60-min expiration) |
| `GET` | `/api/sessions/{session_id}` | Retrieve session status, remaining time & server score |
| `POST` | `/api/sessions/{session_id}/finish` | Mark test session finished & calculate final score |
| `GET` | `/api/problems` | List 5 problems (**public metadata only**) |
| `POST` | `/api/submissions` | Submit solution for evaluation (server-side scoring) |
