-- Database Schema for University Programming Assessment Platform
-- PostgreSQL / Supabase PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Test Sessions Table
CREATE TABLE IF NOT EXISTS test_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Problems Table
CREATE TABLE IF NOT EXISTS problems (
    id INT PRIMARY KEY,
    problem_number INT NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    points INT NOT NULL DEFAULT 20 CHECK (points >= 0),
    description TEXT NOT NULL,
    input_description TEXT NOT NULL,
    output_description TEXT NOT NULL,
    sample_input TEXT NOT NULL,
    sample_output TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    time_limit FLOAT DEFAULT 2.0 CHECK (time_limit > 0),
    memory_limit INT DEFAULT 256 CHECK (memory_limit > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Test Cases Table (Sample & Hidden)
CREATE TABLE IF NOT EXISTS test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id INT REFERENCES problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    submission_id VARCHAR(100) PRIMARY KEY,
    session_id VARCHAR(100) REFERENCES test_sessions(session_id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(id) ON DELETE CASCADE,
    source_code TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'python',
    attempt_number INT DEFAULT 1 CHECK (attempt_number >= 1),
    verdict VARCHAR(50) NOT NULL, -- 'Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded'
    score INT DEFAULT 0 CHECK (score >= 0),
    runtime FLOAT DEFAULT 0.0, -- seconds
    memory FLOAT DEFAULT 0.0, -- MB
    feedback TEXT DEFAULT '', -- AI-generated feedback explaining the verdict
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying & reporting
CREATE INDEX IF NOT EXISTS idx_participants_student_id ON participants(student_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_participant ON test_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_submissions_session ON submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_test_cases_problem ON test_cases(problem_id);
