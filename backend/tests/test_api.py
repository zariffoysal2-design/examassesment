import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.services import session_service

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "programming-assessment-api"


def test_session_creation_valid():
    payload = {
        "name": " Rahim Chowdhury ",
        "university": " University of Engineering ",
        "student_id": " 210201 ",
    }
    response = client.post("/api/sessions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Rahim Chowdhury"
    assert data["university"] == "University of Engineering"
    assert data["student_id"] == "210201"
    assert data["status"] == "active"
    assert "session_id" in data


def test_session_creation_empty_fields_rejected():
    payload = {
        "name": "   ",
        "university": "ABC University",
        "student_id": "210201",
    }
    response = client.post("/api/sessions", json=payload)
    assert response.status_code == 422


def test_get_problems_no_hidden_test_cases():
    response = client.get("/api/problems")
    assert response.status_code == 200
    problems = response.json()
    assert len(problems) == 5
    for prob in problems:
        assert "hidden_test_cases" not in prob
        assert "sample_input" in prob
        assert "starter_code" in prob


def test_submission_invalid_session():
    payload = {
        "session_id": "invalid-uuid-12345",
        "problem_id": 1,
        "source_code": "print('hello')",
    }
    response = client.post("/api/submissions", json=payload)
    assert response.status_code == 404


def test_submission_and_attempt_tracking():
    # 1. Create session
    sess_res = client.post(
        "/api/sessions",
        json={"name": "Alice", "university": "MIT", "student_id": "S101"},
    )
    session_id = sess_res.json()["session_id"]

    # 2. First attempt on Problem 1 (Wrong Answer)
    sub1 = client.post(
        "/api/submissions",
        json={
            "session_id": session_id,
            "problem_id": 1,
            "source_code": "# code with mock_fail bug",
        },
    )
    assert sub1.status_code == 201
    d1 = sub1.json()
    assert d1["attempt_number"] == 1
    assert d1["verdict"] == "Wrong Answer"
    assert d1["score"] == 0

    # 3. Second attempt on Problem 1 (Accepted)
    sub2 = client.post(
        "/api/submissions",
        json={
            "session_id": session_id,
            "problem_id": 1,
            "source_code": "score = int(input()); print('PASS' if score>=50 else 'FAIL')",
        },
    )
    assert sub2.status_code == 201
    d2 = sub2.json()
    assert d2["attempt_number"] == 2
    assert d2["verdict"] == "Accepted"
    assert d2["score"] == 15

    # 4. Check session state (Total score should be 15)
    state = client.get(f"/api/sessions/{session_id}")
    assert state.status_code == 200
    s_data = state.json()
    assert s_data["total_score"] == 15
    assert s_data["problems_solved"] == 1
    assert s_data["total_submissions"] == 2


def test_finish_session_locks_submissions():
    # 1. Create session
    sess_res = client.post(
        "/api/sessions",
        json={"name": "Bob", "university": "Harvard", "student_id": "S102"},
    )
    session_id = sess_res.json()["session_id"]

    # 2. Finish session
    finish_res = client.post(f"/api/sessions/{session_id}/finish")
    assert finish_res.status_code == 200
    assert finish_res.json()["status"] == "completed"

    # 3. Submitting after finish must fail with 403 Forbidden
    sub = client.post(
        "/api/submissions",
        json={
            "session_id": session_id,
            "problem_id": 1,
            "source_code": "print('hello')",
        },
    )
    assert sub.status_code == 403


def test_expired_session_rejects_submissions():
    # Create session
    sess_res = client.post(
        "/api/sessions",
        json={"name": "Charlie", "university": "Stanford", "student_id": "S103"},
    )
    session_id = sess_res.json()["session_id"]

    # Manually expire the session in store/database for test assertion
    from app.services.database import db
    expired_time = datetime.now(timezone.utc) - timedelta(seconds=10)
    if db.supabase_client:
        db.supabase_client.table("test_sessions").update({"expires_at": expired_time.isoformat()}).eq("session_id", session_id).execute()
    session = db.get_session(session_id)
    if session and not db.supabase_client:
        session["expires_at"] = expired_time



    # Submitting must return HTTP 403
    sub = client.post(
        "/api/submissions",
        json={
            "session_id": session_id,
            "problem_id": 1,
            "source_code": "print('hello')",
        },
    )
    assert sub.status_code == 403
    assert "expired" in sub.json()["detail"].lower()
