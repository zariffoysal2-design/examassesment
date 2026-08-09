# Web-Based Programming Assessment System

A web-based programming assessment platform designed for university programming examinations. Allows candidates to take timed programming tests with Monaco code editor integration, immediate execution feedback, secure execution isolation, and administrator CSV exports.

## Project Structure

```
project-01/
├── frontend/             # React + TypeScript + Vite + Monaco Editor app
│   ├── src/
│   │   ├── components/   # UI Components (Navbar, Timer, CodeEditor, etc.)
│   │   ├── data/         # Mock assessment problems & test cases
│   │   ├── pages/        # Views (HomePage, AssessmentApp, CompletionPage)
│   │   ├── types/        # TypeScript interfaces & types
│   │   └── index.css     # Global styles & design system
│   ├── package.json
│   └── vite.config.ts
│
├── backend/              # Python + FastAPI backend (Phase 2)
├── database/             # PostgreSQL / Supabase schema (schema.sql)
├── .env.example          # Environment variable requirements
└── README.md
```

## Phase 1 Implementation Features

- **Home / Login Page**:
  - Participant info registration: Name, University Name, Student ID.
  - Validation ensuring no empty or whitespace-only inputs before test start.

- **Programming Assessment Interface**:
  - 5 Programming problems ranging from Easy to Hard across core topics (Conditional Statements, Loops, Arrays, Functions, Algorithmic Thinking).
  - Monaco Editor integration for Python 3 code editing with syntax highlighting, line numbers, light/dark themes, clear code, and reset code capabilities.
  - Code state persistence across problem tabs during active session.
  - Interactive Run Code (against sample test cases) and Submit Code (against hidden test cases) simulations.
  - Display of execution verdict, runtime duration (seconds), and memory usage (MB).

- **60-Minute Test Timer**:
  - Server-synchronized countdown timer showing time remaining with warning state when time runs short.
  - Automatic test completion & locking when timer expires.

- **Completion Flow**:
  - Finish Test button with modal confirmation dialog.
  - Locked post-test summary displaying final score out of 100 points, problems solved, and breakdown.

## Running the Application

### Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` in your browser.
# exam
