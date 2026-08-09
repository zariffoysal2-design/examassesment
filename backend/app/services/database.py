import os
import uuid
from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

load_dotenv()

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = Any

from app.data.problems import PROBLEMS_DATA


def is_real_supabase_configured() -> bool:
    """
    Returns True if valid non-placeholder Supabase credentials are configured in environment.
    Supports standard JWT service role keys as well as new sb_secret_ key formats.
    """
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
    if not url or not key:
        return False
    if "your-project" in url or "your-service" in key:
        return False
    if not (url.startswith("http://") or url.startswith("https://")):
        return False
    return True


class DatabaseService:
    def __init__(self):
        self.supabase_client: Optional[Client] = None
        self._init_supabase_client()

        # Thread-safe in-memory fallback store for offline testing / development
        self._lock = Lock()
        self._participants: Dict[str, Dict[str, Any]] = {}
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._problems: Dict[int, Dict[str, Any]] = {}
        self._test_cases: List[Dict[str, Any]] = []
        self._submissions: Dict[str, List[Dict[str, Any]]] = {}

        # Seed local problem data immediately for fallback
        self._seed_local_problems()

    def _init_supabase_client(self):
        load_dotenv(override=True)
        url = os.getenv("SUPABASE_URL", "").strip()
        key = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
        if create_client and is_real_supabase_configured():
            try:
                self.supabase_client = create_client(url, key)
            except Exception as e:
                print(f"[DatabaseService] Warning: Failed to connect to Supabase: {e}")
                self.supabase_client = None


    def _seed_local_problems(self):
        with self._lock:
            for prob in PROBLEMS_DATA:
                p_id = prob["id"]
                self._problems[p_id] = {
                    "id": p_id,
                    "problem_number": prob["problem_number"],
                    "title": prob["title"],
                    "topic": prob["topic"],
                    "difficulty": prob["difficulty"],
                    "points": prob["points"],
                    "time_limit": prob["time_limit"],
                    "memory_limit": prob["memory_limit"],
                    "description": prob["description"],
                    "input_description": prob["input_description"],
                    "output_description": prob["output_description"],
                    "sample_input": prob["sample_input"],
                    "sample_output": prob["sample_output"],
                    "starter_code": prob["starter_code"],
                }
                for tc in prob.get("sample_test_cases", []):
                    self._test_cases.append({
                        "id": str(uuid.uuid4()),
                        "problem_id": p_id,
                        "input_data": tc["input"],
                        "expected_output": tc["expected_output"],
                        "is_hidden": False,
                    })
                for tc in prob.get("hidden_test_cases", []):
                    self._test_cases.append({
                        "id": str(uuid.uuid4()),
                        "problem_id": p_id,
                        "input_data": tc["input"],
                        "expected_output": tc["expected_output"],
                        "is_hidden": True,
                    })

    def seed_problems_in_supabase(self) -> Dict[str, Any]:
        """
        Seeds problems and test cases into Supabase database safely without duplicates.
        Returns a diagnostic result dictionary reporting outcome.
        """
        if not self.supabase_client:
            self._init_supabase_client()

        if not self.supabase_client:
            return {
                "status": "skipped",
                "reason": "Supabase client not configured (using placeholder credentials or offline mock mode)",
                "problems_seeded": 0,
                "test_cases_seeded": 0,
            }

        try:
            # Check existing problems
            res = self.supabase_client.table("problems").select("id").execute()
            if res.data and len(res.data) >= 5:
                return {
                    "status": "already_seeded",
                    "reason": f"Database already contains {len(res.data)} problems.",
                    "problems_seeded": 0,
                    "test_cases_seeded": 0,
                    "existing_problems": len(res.data),
                }

            problems_seeded = 0
            test_cases_seeded = 0

            for prob in PROBLEMS_DATA:
                # 1. Upsert problem
                self.supabase_client.table("problems").upsert({
                    "id": prob["id"],
                    "problem_number": prob["problem_number"],
                    "title": prob["title"],
                    "topic": prob["topic"],
                    "difficulty": prob["difficulty"],
                    "points": prob["points"],
                    "time_limit": prob["time_limit"],
                    "memory_limit": prob["memory_limit"],
                    "description": prob["description"],
                    "input_description": prob["input_description"],
                    "output_description": prob["output_description"],
                    "sample_input": prob["sample_input"],
                    "sample_output": prob["sample_output"],
                    "starter_code": prob["starter_code"],
                }).execute()
                problems_seeded += 1

                # 2. Clear existing test cases for this problem to avoid duplication on re-run
                self.supabase_client.table("test_cases").delete().eq("problem_id", prob["id"]).execute()

                # 3. Seed sample test cases
                for tc in prob.get("sample_test_cases", []):
                    self.supabase_client.table("test_cases").insert({
                        "problem_id": prob["id"],
                        "input_data": tc["input"],
                        "expected_output": tc["expected_output"],
                        "is_hidden": False,
                    }).execute()
                    test_cases_seeded += 1

                # 4. Seed hidden test cases
                for tc in prob.get("hidden_test_cases", []):
                    self.supabase_client.table("test_cases").insert({
                        "problem_id": prob["id"],
                        "input_data": tc["input"],
                        "expected_output": tc["expected_output"],
                        "is_hidden": True,
                    }).execute()
                    test_cases_seeded += 1

            return {
                "status": "success",
                "problems_seeded": problems_seeded,
                "test_cases_seeded": test_cases_seeded,
            }
        except Exception as e:
            print(f"[DatabaseService] Error seeding Supabase database: {e}")
            return {
                "status": "error",
                "error": str(e),
                "problems_seeded": 0,
                "test_cases_seeded": 0,
            }


    # ==================== PARTICIPANTS & SESSIONS ====================

    def create_session(self, name: str, university: str, student_id: str, duration_minutes: int) -> Dict[str, Any]:
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=duration_minutes)

        if self.supabase_client:
            try:
                # 1. Insert participant
                p_res = self.supabase_client.table("participants").insert({
                    "name": name,
                    "university": university,
                    "student_id": student_id,
                }).execute()

                participant_id = p_res.data[0]["id"] if p_res.data else str(uuid.uuid4())

                # 2. Insert test session
                s_res = self.supabase_client.table("test_sessions").insert({
                    "session_id": session_id,
                    "participant_id": participant_id,
                    "started_at": now.isoformat(),
                    "expires_at": expires_at.isoformat(),
                    "finished_at": None,
                    "status": "active",
                }).execute()

                if s_res.data:
                    return {
                        "session_id": session_id,
                        "name": name,
                        "university": university,
                        "student_id": student_id,
                        "started_at": now,
                        "expires_at": expires_at,
                        "finished_at": None,
                        "status": "active",
                    }
            except Exception as e:
                print(f"[DatabaseService] Error creating session in Supabase, falling back to local: {e}")

        # Fallback in-memory
        participant_id = str(uuid.uuid4())
        session_record = {
            "session_id": session_id,
            "participant_id": participant_id,
            "name": name,
            "university": university,
            "student_id": student_id,
            "started_at": now,
            "expires_at": expires_at,
            "finished_at": None,
            "status": "active",
        }
        with self._lock:
            self._participants[participant_id] = {
                "id": participant_id,
                "name": name,
                "university": university,
                "student_id": student_id,
            }
            self._sessions[session_id] = session_record

        return session_record

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc)

        if self.supabase_client:
            try:
                res = self.supabase_client.table("test_sessions").select("*, participants(*)").eq("session_id", session_id).execute()
                if res.data and len(res.data) > 0:
                    row = res.data[0]
                    p_data = row.get("participants", {}) or {}

                    started_at = datetime.fromisoformat(row["started_at"].replace("Z", "+00:00"))
                    expires_at = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
                    status = row["status"]

                    # Expiration check
                    if status == "active" and now >= expires_at:
                        status = "expired"
                        self.supabase_client.table("test_sessions").update({"status": "expired"}).eq("session_id", session_id).execute()

                    return {
                        "session_id": row["session_id"],
                        "name": p_data.get("name", ""),
                        "university": p_data.get("university", ""),
                        "student_id": p_data.get("student_id", ""),
                        "started_at": started_at,
                        "expires_at": expires_at,
                        "finished_at": row.get("finished_at"),
                        "status": status,
                    }
            except Exception as e:
                print(f"[DatabaseService] Error fetching session from Supabase, fallback to local: {e}")

        # Fallback in-memory
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return None

            if session["status"] == "active" and now >= session["expires_at"]:
                session["status"] = "expired"

            return session

    def finish_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        session = self.get_session(session_id)
        if not session:
            return None

        now = datetime.now(timezone.utc)
        new_status = session["status"]
        if session["status"] == "active":
            if now >= session["expires_at"]:
                new_status = "expired"
            else:
                new_status = "completed"
                session["finished_at"] = now
        session["status"] = new_status

        if self.supabase_client:
            try:
                update_payload = {"status": new_status}
                if session.get("finished_at"):
                    update_payload["finished_at"] = session["finished_at"].isoformat()
                self.supabase_client.table("test_sessions").update(update_payload).eq("session_id", session_id).execute()
            except Exception as e:
                print(f"[DatabaseService] Error updating finish session in Supabase: {e}")

        return session

    # ==================== PROBLEMS & TEST CASES ====================

    def get_all_public_problems(self) -> List[Dict[str, Any]]:
        if self.supabase_client:
            try:
                res = self.supabase_client.table("problems").select("*").order("problem_number").execute()
                if res.data and len(res.data) > 0:
                    public_list = []
                    for prob in res.data:
                        public_list.append({
                            "id": prob["id"],
                            "problem_number": prob["problem_number"],
                            "title": prob["title"],
                            "topic": prob["topic"],
                            "difficulty": prob["difficulty"],
                            "points": prob["points"],
                            "time_limit": prob["time_limit"],
                            "memory_limit": prob["memory_limit"],
                            "description": prob["description"],
                            "input_description": prob["input_description"],
                            "output_description": prob["output_description"],
                            "sample_input": prob["sample_input"],
                            "sample_output": prob["sample_output"],
                            "starter_code": prob["starter_code"],
                        })
                    return public_list
            except Exception as e:
                print(f"[DatabaseService] Error getting problems from Supabase, fallback to local: {e}")

        # Fallback local
        with self._lock:
            problems_list = sorted(list(self._problems.values()), key=lambda x: x["problem_number"])
            return [
                {
                    "id": p["id"],
                    "problem_number": p["problem_number"],
                    "title": p["title"],
                    "topic": p["topic"],
                    "difficulty": p["difficulty"],
                    "points": p["points"],
                    "time_limit": p["time_limit"],
                    "memory_limit": p["memory_limit"],
                    "description": p["description"],
                    "input_description": p["input_description"],
                    "output_description": p["output_description"],
                    "sample_input": p["sample_input"],
                    "sample_output": p["sample_output"],
                    "starter_code": p["starter_code"],
                }
                for p in problems_list
            ]

    def add_generated_problem(self, problem: Dict[str, Any]) -> Dict[str, Any]:
        """
        Persists a new (typically Gemini-generated) problem, auto-assigning the
        next available id/problem_number. Stored locally always, and mirrored
        into Supabase when configured.
        """
        with self._lock:
            next_id = (max(self._problems.keys()) + 1) if self._problems else 1

            record = {
                "id": next_id,
                "problem_number": next_id,
                "title": problem["title"],
                "topic": problem["topic"],
                "difficulty": problem["difficulty"],
                "points": problem["points"],
                "time_limit": problem.get("time_limit", 2.0),
                "memory_limit": problem.get("memory_limit", 256),
                "description": problem["description"],
                "input_description": problem["input_description"],
                "output_description": problem["output_description"],
                "sample_input": problem["sample_input"],
                "sample_output": problem["sample_output"],
                "starter_code": problem["starter_code"],
            }
            self._problems[next_id] = record

            for tc in problem.get("sample_test_cases", []):
                self._test_cases.append({
                    "id": str(uuid.uuid4()),
                    "problem_id": next_id,
                    "input_data": tc["input"],
                    "expected_output": tc["expected_output"],
                    "is_hidden": False,
                })
            for tc in problem.get("hidden_test_cases", []):
                self._test_cases.append({
                    "id": str(uuid.uuid4()),
                    "problem_id": next_id,
                    "input_data": tc["input"],
                    "expected_output": tc["expected_output"],
                    "is_hidden": True,
                })

        if self.supabase_client:
            try:
                self.supabase_client.table("problems").upsert(record).execute()
                self.supabase_client.table("test_cases").delete().eq("problem_id", next_id).execute()
                for tc in problem.get("sample_test_cases", []):
                    self.supabase_client.table("test_cases").insert({
                        "problem_id": next_id,
                        "input_data": tc["input"],
                        "expected_output": tc["expected_output"],
                        "is_hidden": False,
                    }).execute()
                for tc in problem.get("hidden_test_cases", []):
                    self.supabase_client.table("test_cases").insert({
                        "problem_id": next_id,
                        "input_data": tc["input"],
                        "expected_output": tc["expected_output"],
                        "is_hidden": True,
                    }).execute()
            except Exception as e:
                print(f"[DatabaseService] Error saving generated problem to Supabase: {e}")

        return record

    def get_problem_by_id(self, problem_id: int) -> Optional[Dict[str, Any]]:
        if self.supabase_client:
            try:
                res = self.supabase_client.table("problems").select("*").eq("id", problem_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"[DatabaseService] Error getting problem {problem_id} from Supabase: {e}")

        with self._lock:
            return self._problems.get(problem_id)

    def get_test_cases(self, problem_id: int) -> List[Dict[str, Any]]:
        """
        Returns ALL test cases (sample + hidden) for a problem, used server-side
        for evaluation. Never expose the result of this method to the client.
        """
        if self.supabase_client:
            try:
                res = (
                    self.supabase_client.table("test_cases")
                    .select("*")
                    .eq("problem_id", problem_id)
                    .execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[DatabaseService] Error getting test cases for problem {problem_id} from Supabase: {e}")

        with self._lock:
            return [tc for tc in self._test_cases if tc["problem_id"] == problem_id]

    # ==================== SUBMISSIONS ====================

    def create_submission(
        self,
        session_id: str,
        problem_id: int,
        source_code: str,
        language: str,
        verdict: str,
        score: int,
        runtime: float,
        memory: float,
        feedback: str = "",
    ) -> Dict[str, Any]:
        submission_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        # Count attempt number
        existing_submissions = self.get_session_submissions(session_id)
        attempts_for_prob = [s for s in existing_submissions if s["problem_id"] == problem_id]
        attempt_number = len(attempts_for_prob) + 1

        submission_record = {
            "submission_id": submission_id,
            "session_id": session_id,
            "problem_id": problem_id,
            "source_code": source_code,
            "language": language,
            "attempt_number": attempt_number,
            "verdict": verdict,
            "score": score,
            "runtime": runtime,
            "memory": memory,
            "feedback": feedback,
            "submitted_at": now,
        }

        if self.supabase_client:
            try:
                self.supabase_client.table("submissions").insert({
                    "submission_id": submission_id,
                    "session_id": session_id,
                    "problem_id": problem_id,
                    "source_code": source_code,
                    "language": language,
                    "attempt_number": attempt_number,
                    "verdict": verdict,
                    "score": score,
                    "runtime": runtime,
                    "memory": memory,
                    "feedback": feedback,
                    "submitted_at": now.isoformat(),
                }).execute()
            except Exception as e:
                print(f"[DatabaseService] Error inserting submission in Supabase: {e}")

        # Always update local fallback for consistency
        with self._lock:
            if session_id not in self._submissions:
                self._submissions[session_id] = []
            self._submissions[session_id].append(submission_record)

        return submission_record

    def get_session_submissions(self, session_id: str) -> List[Dict[str, Any]]:
        if self.supabase_client:
            try:
                res = self.supabase_client.table("submissions").select("*").eq("session_id", session_id).order("submitted_at").execute()
                if res.data is not None:
                    submissions = []
                    for row in res.data:
                        sub_at = datetime.fromisoformat(row["submitted_at"].replace("Z", "+00:00"))
                        submissions.append({
                            "submission_id": row["submission_id"],
                            "session_id": row["session_id"],
                            "problem_id": row["problem_id"],
                            "source_code": row["source_code"],
                            "language": row["language"],
                            "attempt_number": row["attempt_number"],
                            "verdict": row["verdict"],
                            "score": row["score"],
                            "runtime": row["runtime"],
                            "memory": row["memory"],
                            "feedback": row.get("feedback", ""),
                            "submitted_at": sub_at,
                        })
                    return submissions
            except Exception as e:
                print(f"[DatabaseService] Error fetching submissions from Supabase: {e}")

        with self._lock:
            return list(self._submissions.get(session_id, []))

    def get_session_submission_summary(self, session_id: str) -> Dict[str, Any]:
        submissions = self.get_session_submissions(session_id)

        best_scores: Dict[int, int] = {}
        for sub in submissions:
            prob_id = sub["problem_id"]
            current_best = best_scores.get(prob_id, 0)
            best_scores[prob_id] = max(current_best, sub["score"])

        total_score = sum(best_scores.values())

        problems_solved = 0
        for prob_id, score in best_scores.items():
            prob = self.get_problem_by_id(prob_id)
            if prob and score == prob["points"]:
                problems_solved += 1

        return {
            "total_score": total_score,
            "problems_solved": problems_solved,
            "total_submissions": len(submissions),
            "best_scores": best_scores,
        }


# Global database service singleton
db = DatabaseService()
