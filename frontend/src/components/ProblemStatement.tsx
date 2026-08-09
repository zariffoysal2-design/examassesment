import React from 'react';
import type { Problem } from '../types';
import { BookOpen, Clock, HardDrive, FileText, ArrowRightCircle } from 'lucide-react';

interface ProblemStatementProps {
  problem: Problem;
}

const getDifficultyColor = (difficulty: Problem['difficulty']) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Easy/Medium':
      return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    case 'Medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'Hard':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-700 text-slate-300 border-slate-600';
  }
};

const ProblemStatement: React.FC<ProblemStatementProps> = ({ problem }) => {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-slate-200 custom-scrollbar">
      
      {/* Header Info */}
      <div className="border-b border-slate-800 pb-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Problem {problem.problemNumber} — {problem.topic}
          </span>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(
                problem.difficulty
              )}`}
            >
              {problem.difficulty}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {problem.points} Points
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">{problem.title}</h2>

        <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Time Limit: {problem.timeLimitSec}s</span>
          </div>
          <div className="flex items-center space-x-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>Memory Limit: {problem.memoryLimitMb}MB</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Description</span>
        </h3>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-sm leading-relaxed text-slate-300 font-sans">
          {problem.description}
        </div>
      </div>

      {/* Input Format */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Input Format</span>
        </h3>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
          {problem.inputDescription}
        </div>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <ArrowRightCircle className="w-4 h-4 text-indigo-400" />
          <span>Output Format</span>
        </h3>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
          {problem.outputDescription}
        </div>
      </div>

      {/* Sample Cases */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Sample Test Case
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400">Sample Input</div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
              {problem.sampleInput}
            </pre>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400">Sample Output</div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
              {problem.sampleOutput}
            </pre>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ProblemStatement;
