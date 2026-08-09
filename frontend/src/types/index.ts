export interface Participant {
  name: string;
  university: string;
  studentId: string;
}

export type VerdictType =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Runtime Error'
  | 'Compilation Error'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Execution Error'
  | 'Idle'
  | 'Running';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface Problem {
  id: number;
  problemNumber: number;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Easy/Medium' | 'Medium' | 'Hard';
  points: number;
  timeLimitSec: number;
  memoryLimitMb: number;
  description: string;
  inputDescription: string;
  outputDescription: string;
  sampleInput: string;
  sampleOutput: string;
  starterCode: string;
  sampleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
}

export interface SubmissionResult {
  submissionId?: string;
  problemId?: number;
  verdict: VerdictType;
  passedCount: number;
  totalCount: number;
  runtime: number; // in seconds
  memory?: number; // in MB
  stdout?: string;
  stderr?: string;
  feedback?: string; // AI-generated feedback explaining the verdict
  submittedAt: Date;
  attemptNumber: number;
  score: number;
}

export interface ProblemState {
  code: string;
  lastResult?: SubmissionResult;
  bestScore: number;
  solved: boolean;
  attemptsCount: number;
}

export interface SessionData {
  session_id: string;
  name: string;
  university: string;
  student_id: string;
  started_at: string;
  expires_at: string;
  status: 'active' | 'completed' | 'expired';
  total_score?: number;
  problems_solved?: number;
  total_submissions?: number;
}
