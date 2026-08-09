import React from 'react';
import type { SubmissionResult } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Clock, HardDrive, Terminal, Sparkles } from 'lucide-react';

interface ExecutionResultPanelProps {
  result?: SubmissionResult;
  isExecuting: boolean;
  executingType?: 'run' | 'submit';
}

const ExecutionResultPanel: React.FC<ExecutionResultPanelProps> = ({
  result,
  isExecuting,
  executingType,
}) => {
  if (isExecuting) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 min-h-[140px]">
        <div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-indigo-300">
          {executingType === 'submit'
            ? 'Running hidden test cases on secure execution engine...'
            : 'Executing sample test cases...'}
        </p>
        <span className="text-[10px] text-slate-500">Evaluating Python runtime...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-center text-xs text-slate-500 min-h-[100px] flex items-center justify-center space-x-2">
        <Terminal className="w-4 h-4 text-slate-600" />
        <span>Click "Run Code" to test against sample inputs, or "Submit" to evaluate hidden test cases.</span>
      </div>
    );
  }

  const isAccepted = result.verdict === 'Accepted';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
      
      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        
        {/* Verdict Badge */}
        <div className="flex items-center space-x-2">
          {isAccepted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : result.verdict === 'Wrong Answer' ? (
            <XCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400" />
          )}
          <span
            className={`text-sm font-bold tracking-wide ${
              isAccepted
                ? 'text-emerald-400'
                : result.verdict === 'Wrong Answer'
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}
          >
            {isAccepted ? '✓ Accepted' : `✗ ${result.verdict}`}
          </span>
        </div>

        {/* Test pass ratio & metrics */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-slate-300">
            Tests Passed: <span className="font-bold text-white">{result.passedCount}</span> / {result.totalCount}
          </div>

          <div className="flex items-center space-x-1 text-indigo-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{result.runtime.toFixed(3)}s</span>
          </div>

          {result.memory && (
            <div className="flex items-center space-x-1 text-indigo-300">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>{result.memory.toFixed(1)} MB</span>
            </div>
          )}
        </div>

      </div>

      {/* AI feedback (Gemini) */}
      {result.feedback && (
        <div
          className={`rounded-lg border p-3 space-y-1.5 ${
            isAccepted
              ? 'bg-emerald-950/30 border-emerald-900/50'
              : 'bg-amber-950/30 border-amber-900/50'
          }`}
        >
          <div
            className={`flex items-center space-x-1.5 text-[11px] font-semibold ${
              isAccepted ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Feedback</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{result.feedback}</p>
        </div>
      )}

      {/* Stdout / Stderr logs if available */}
      {(result.stdout || result.stderr) && (
        <div className="space-y-2 pt-1">
          {result.stdout && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400">Standard Output</div>
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-200 overflow-x-auto max-h-36 custom-scrollbar">
                {result.stdout}
              </pre>
            </div>
          )}

          {result.stderr && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-red-400">Standard Error / Logs</div>
              <pre className="bg-red-950/40 p-3 rounded-lg border border-red-900/50 text-xs font-mono text-red-300 overflow-x-auto max-h-36 custom-scrollbar">
                {result.stderr}
              </pre>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ExecutionResultPanel;
