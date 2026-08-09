import type {
  Participant,
  Problem,
  SessionData,
  SubmissionResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiServiceError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiServiceError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorMessage = 'An error occurred while communicating with the backend service.';
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to HTTP status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiServiceError(errorMessage, response.status);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiServiceError) {
      throw err;
    }
    throw new ApiServiceError(
      'Unable to connect to the backend server. Please check your network connection.',
      0
    );
  }
}

export const apiService = {
  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<{ status: string; service: string }> {
    return request<{ status: string; service: string }>('/api/health');
  },

  /**
   * Create candidate test session
   */
  async createSession(participant: Participant): Promise<SessionData> {
    return request<SessionData>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        name: participant.name,
        university: participant.university,
        student_id: participant.studentId,
      }),
    });
  },

  /**
   * Retrieve active session state
   */
  async getSession(sessionId: string): Promise<SessionData> {
    return request<SessionData>(`/api/sessions/${sessionId}`);
  },

  /**
   * List assessment problems (public metadata only)
   */
  async getProblems(): Promise<Problem[]> {
    const problems = await request<any[]>('/api/problems');
    return problems.map((p) => ({
      id: p.id,
      problemNumber: p.problem_number,
      title: p.title,
      topic: p.topic,
      difficulty: p.difficulty,
      points: p.points,
      timeLimitSec: p.time_limit,
      memoryLimitMb: p.memory_limit,
      description: p.description,
      inputDescription: p.input_description,
      outputDescription: p.output_description,
      sampleInput: p.sample_input,
      sampleOutput: p.sample_output,
      starterCode: p.starter_code,
      sampleTestCases: [
        { id: `sample-${p.id}`, input: p.sample_input, expectedOutput: p.sample_output, isSample: true }
      ],
      hiddenTestCases: [], // Server hides these for privacy
    }));
  },

  /**
   * Submit code solution for evaluation
   */
  async submitCode(
    sessionId: string,
    problemId: number,
    sourceCode: string,
    language = 'python'
  ): Promise<SubmissionResult> {
    const res = await request<any>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        problem_id: problemId,
        source_code: sourceCode,
        language,
      }),
    });

    return {
      submissionId: res.submission_id,
      problemId: res.problem_id,
      attemptNumber: res.attempt_number,
      verdict: res.verdict,
      score: res.score,
      runtime: res.runtime,
      memory: res.memory,
      feedback: res.feedback,
      submittedAt: new Date(res.submitted_at),
      passedCount: res.verdict === 'Accepted' ? 5 : 0,
      totalCount: 5,
    };
  },

  /**
   * Request an AI-generated hint (Gemini) for a problem, based on the
   * candidate's current code and (if available) their last submission.
   */
  async getHint(problemId: number, sourceCode: string, sessionId?: string): Promise<string> {
    const res = await request<{ problem_id: number; hint: string }>('/api/hints', {
      method: 'POST',
      body: JSON.stringify({
        problem_id: problemId,
        source_code: sourceCode,
        session_id: sessionId,
      }),
    });
    return res.hint;
  },

  /**
   * Finish candidate test session
   */
  async finishSession(sessionId: string): Promise<{
    sessionId: string;
    status: string;
    finishedAt: string;
    totalScore: number;
    problemsSolved: number;
  }> {
    const res = await request<any>(`/api/sessions/${sessionId}/finish`, {
      method: 'POST',
    });

    return {
      sessionId: res.session_id,
      status: res.status,
      finishedAt: res.finished_at,
      totalScore: res.total_score,
      problemsSolved: res.problems_solved,
    };
  },
};
