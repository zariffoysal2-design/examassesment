import React, { useState, useEffect } from 'react';
import type { Participant, Problem, ProblemState, SubmissionResult, SessionData } from '../types';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import ProblemStatement from '../components/ProblemStatement';
import CodeEditor from '../components/CodeEditor';
import ExecutionResultPanel from '../components/ExecutionResultPanel';
import FinishModal from '../components/FinishModal';
import CompletionPage from '../components/CompletionPage';
import { Play, Send, CheckCircle, AlertTriangle, Loader2, Lightbulb, Sparkles } from 'lucide-react';

interface AssessmentAppProps {
  participant: Participant;
  session: SessionData;
  initialCompleted?: boolean;
}

const AssessmentApp: React.FC<AssessmentAppProps> = ({
  participant,
  session,
  initialCompleted = false,
}) => {
  const [startedAt] = useState<Date>(() => new Date(session.started_at));
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState<boolean>(true);
  const [activeProblemId, setActiveProblemId] = useState<number>(1);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(
    initialCompleted || session.status === 'completed' || session.status === 'expired'
  );
  const [finishedAt, setFinishedAt] = useState<Date | undefined>(
    session.status !== 'active' ? new Date() : undefined
  );
  const [apiError, setApiError] = useState<string | null>(null);

  const [problemStates, setProblemStates] = useState<Record<number, ProblemState>>({});
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executingType, setExecutingType] = useState<'run' | 'submit' | undefined>(undefined);

  const [hints, setHints] = useState<Record<number, string>>({});
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [hintError, setHintError] = useState<string | null>(null);

  // Fetch problem list from Backend API on mount
  useEffect(() => {
    let isMounted = true;
    async function loadProblems() {
      try {
        setIsLoadingProblems(true);
        const fetchedProblems = await apiService.getProblems();
        if (!isMounted) return;

        setProblems(fetchedProblems);
        
        // Initialize problem state mapping
        setProblemStates((prev) => {
          const initial: Record<number, ProblemState> = {};
          fetchedProblems.forEach((p) => {
            initial[p.id] = prev[p.id] || {
              code: p.starterCode,
              bestScore: 0,
              solved: false,
              attemptsCount: 0,
            };
          });
          return initial;
        });

        if (fetchedProblems.length > 0) {
          setActiveProblemId(fetchedProblems[0].id);
        }
      } catch (err: any) {
        if (isMounted) {
          setApiError(err.message || 'Failed to load assessment problems from backend API.');
        }
      } finally {
        if (isMounted) setIsLoadingProblems(false);
      }
    }

    loadProblems();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeProblem: Problem | undefined = problems.find((p) => p.id === activeProblemId);
  const activeState: ProblemState | undefined = problemStates[activeProblemId];

  const handleCodeChange = (newCode: string) => {
    if (!activeProblemId) return;
    setProblemStates((prev) => ({
      ...prev,
      [activeProblemId]: {
        ...(prev[activeProblemId] || {
          code: '',
          bestScore: 0,
          solved: false,
          attemptsCount: 0,
        }),
        code: newCode,
      },
    }));
  };

  const handleResetCode = () => {
    if (!activeProblem) return;
    setProblemStates((prev) => ({
      ...prev,
      [activeProblemId]: {
        ...prev[activeProblemId],
        code: activeProblem.starterCode,
      },
    }));
  };

  const handleClearCode = () => {
    setProblemStates((prev) => ({
      ...prev,
      [activeProblemId]: {
        ...prev[activeProblemId],
        code: '',
      },
    }));
  };

  // Run Code (sample test case simulation)
  const handleRunCode = () => {
    if (!activeProblem || !activeState) return;
    setIsExecuting(true);
    setExecutingType('run');

    setTimeout(() => {
      const code = activeState.code.trim();
      let verdict: SubmissionResult['verdict'] = 'Accepted';
      let stdout = 'Sample Input: ' + activeProblem.sampleInput + '\nSample Output: ' + activeProblem.sampleOutput;
      let stderr = undefined;

      if (!code) {
        verdict = 'Compilation Error';
        stdout = '';
        stderr = 'Error: Source code is empty.';
      } else if (code.includes('mock_syntax_error')) {
        verdict = 'Compilation Error';
        stdout = '';
        stderr = 'SyntaxError: invalid syntax on line 4';
      }

      const result: SubmissionResult = {
        verdict,
        passedCount: verdict === 'Accepted' ? 1 : 0,
        totalCount: 1,
        runtime: 0.024,
        memory: 8.2,
        stdout,
        stderr,
        submittedAt: new Date(),
        attemptNumber: activeState.attemptsCount,
        score: 0,
      };

      setProblemStates((prev) => ({
        ...prev,
        [activeProblemId]: {
          ...prev[activeProblemId],
          lastResult: result,
        },
      }));

      setIsExecuting(false);
      setExecutingType(undefined);
    }, 600);
  };

  // Submit Code (POST /api/submissions)
  const handleSubmitCode = async () => {
    if (!activeProblem || !activeState) return;
    setIsExecuting(true);
    setExecutingType('submit');
    setApiError(null);

    try {
      const result = await apiService.submitCode(
        session.session_id,
        activeProblemId,
        activeState.code,
        'python'
      );

      const isPassed = result.verdict === 'Accepted';
      const earnedScore = isPassed ? activeProblem.points : 0;
      const newBestScore = Math.max(activeState.bestScore, earnedScore);

      setProblemStates((prev) => ({
        ...prev,
        [activeProblemId]: {
          ...prev[activeProblemId],
          lastResult: result,
          attemptsCount: result.attemptNumber,
          bestScore: newBestScore,
          solved: newBestScore === activeProblem.points,
        },
      }));
    } catch (err: any) {
      if (err.status === 403) {
        setApiError('Test session has expired or completed. Submissions are rejected.');
        setIsCompleted(true);
        setFinishedAt(new Date());
      } else {
        setApiError(err.message || 'Error submitting code to backend server.');
      }
    } finally {
      setIsExecuting(false);
      setExecutingType(undefined);
    }
  };

  // Get an AI hint (Gemini) for the active problem, based on current code
  const handleGetHint = async () => {
    if (!activeProblem || !activeState) return;
    setIsHintLoading(true);
    setHintError(null);

    try {
      const hint = await apiService.getHint(activeProblemId, activeState.code, session.session_id);
      setHints((prev) => ({ ...prev, [activeProblemId]: hint }));
    } catch (err: any) {
      setHintError(err.message || 'Unable to fetch a hint right now.');
    } finally {
      setIsHintLoading(false);
    }
  };

  // Finish test (POST /api/sessions/{session_id}/finish)
  const handleFinishConfirm = async () => {
    try {
      await apiService.finishSession(session.session_id);
    } catch (err: any) {
      console.warn('Error closing session on backend:', err);
    } finally {
      localStorage.removeItem('assessment_session_id');
      setFinishedAt(new Date());
      setIsCompleted(true);
      setIsFinishModalOpen(false);
    }
  };

  const handleTimeExpired = () => {
    if (!isCompleted) {
      localStorage.removeItem('assessment_session_id');
      setFinishedAt(new Date());
      setIsCompleted(true);
    }
  };

  const solvedTotal = problems.filter((p) => problemStates[p.id]?.solved).length;

  if (isCompleted && finishedAt) {
    return (
      <CompletionPage
        participant={participant}
        problems={problems}
        problemStates={problemStates}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    );
  }

  if (isLoadingProblems) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-slate-300">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-semibold">Loading problems from FastAPI backend...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        participant={participant}
        startedAt={startedAt}
        durationMinutes={60}
        onTimeExpired={handleTimeExpired}
        onFinishRequest={() => setIsFinishModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col space-y-4">
        
        {apiError && (
          <div className="p-4 bg-red-950/90 border border-red-500/50 rounded-xl text-red-200 text-xs font-medium flex items-center space-x-2 shadow-lg">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Problem Navigation Tabs */}
        <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            {problems.map((prob) => {
              const state = problemStates[prob.id];
              const isActive = prob.id === activeProblemId;
              const isSolved = state?.solved;

              return (
                <button
                  key={prob.id}
                  onClick={() => setActiveProblemId(prob.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition duration-150 cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  {isSolved ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                  <span>P{prob.problemNumber}: {prob.topic}</span>
                  <span className="text-[10px] opacity-75 font-mono">({prob.points}pt)</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 font-mono px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
            Solved: <span className="text-emerald-400 font-bold">{solvedTotal}</span> / 5
          </div>
        </div>

        {/* Workspace Grid */}
        {activeProblem && activeState && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
            
            {/* Left Panel: Statement */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-[700px] flex flex-col">
              <ProblemStatement problem={activeProblem} />
            </div>

            {/* Right Panel: Editor & Logs */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              
              {/* Monaco Editor */}
              <div className="flex-1 min-h-[420px]">
                <CodeEditor
                  code={activeState.code}
                  onChange={handleCodeChange}
                  onReset={handleResetCode}
                  onClear={handleClearCode}
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md">
                <div className="text-xs text-slate-400 font-mono">
                  Attempts: <span className="text-white font-semibold">{activeState.attemptsCount}</span>
                </div>

                <div className="flex items-center space-x-3">

                  {/* Get Hint (Gemini) */}
                  <button
                    onClick={handleGetHint}
                    disabled={isHintLoading}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-xl border border-slate-700 transition duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isHintLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lightbulb className="w-3.5 h-3.5" />
                    )}
                    <span>Get Hint</span>
                  </button>

                  {/* Run Code */}
                  <button
                    onClick={handleRunCode}
                    disabled={isExecuting}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                    <span>Run Code</span>
                  </button>

                  {/* Submit */}
                  <button
                    onClick={handleSubmitCode}
                    disabled={isExecuting}
                    className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Code</span>
                  </button>

                </div>
              </div>

              {/* AI Hint (Gemini) */}
              {hintError && (
                <div className="p-3 bg-red-950/60 border border-red-900/50 rounded-xl text-red-200 text-xs font-medium flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{hintError}</span>
                </div>
              )}
              {hints[activeProblemId] && (
                <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hint</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{hints[activeProblemId]}</p>
                </div>
              )}

              {/* Execution Result Log */}
              <ExecutionResultPanel
                result={activeState.lastResult}
                isExecuting={isExecuting}
                executingType={executingType}
              />

            </div>

          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      <FinishModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirm={handleFinishConfirm}
        solvedCount={solvedTotal}
        totalProblems={problems.length}
      />

    </div>
  );
};

export default AssessmentApp;
