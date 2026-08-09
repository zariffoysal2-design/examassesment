import React from 'react';
import type { Participant, Problem, ProblemState } from '../types';
import { Award, CheckCircle2, XCircle, Trophy, User, School, IdCard, Clock } from 'lucide-react';

interface CompletionPageProps {
  participant: Participant;
  problems: Problem[];
  problemStates: Record<number, ProblemState>;
  startedAt: Date;
  finishedAt: Date;
}

const CompletionPage: React.FC<CompletionPageProps> = ({
  participant,
  problems,
  problemStates,
  startedAt,
  finishedAt,
}) => {
  const totalScore = problems.reduce((acc, p) => {
    return acc + (problemStates[p.id]?.bestScore || 0);
  }, 0);

  const solvedCount = problems.filter((p) => problemStates[p.id]?.solved).length;

  const durationSec = Math.max(
    0,
    Math.floor((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000)
  );
  const minutesTaken = Math.floor(durationSec / 60);
  const secondsTaken = durationSec % 60;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-emerald-400 shadow-xl shadow-emerald-950/50">
            <Trophy className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Programming Test Completed
          </h1>
          <p className="text-xs text-slate-400">
            Your evaluation responses have been stored securely in the database.
          </p>
        </div>

        {/* Participant Details & Performance Summary Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8">
          
          {/* Info Header Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-slate-500 text-[10px]">Participant</div>
                <div className="font-semibold text-white">{participant.name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <School className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-slate-500 text-[10px]">University</div>
                <div className="font-semibold text-white">{participant.university}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <IdCard className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-slate-500 text-[10px]">Student ID</div>
                <div className="font-semibold font-mono text-indigo-300">{participant.studentId}</div>
              </div>
            </div>
          </div>

          {/* Metric Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Total Score */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center space-x-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>Total Score</span>
              </div>
              <div className="text-3xl font-extrabold text-indigo-400 font-mono">
                {totalScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
            </div>

            {/* Solved Count */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Problems Solved</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                {solvedCount} <span className="text-xs text-slate-500 font-normal">/ 5</span>
              </div>
            </div>

            {/* Time Taken */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Time Spent</span>
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono pt-1">
                {minutesTaken}m {secondsTaken}s
              </div>
            </div>

          </div>

          {/* Individual Problem Results Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Problem Summary Breakdown
            </h3>
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
              {problems.map((prob) => {
                const state = problemStates[prob.id];
                const score = state?.bestScore || 0;
                const isPassed = score === prob.points;

                return (
                  <div
                    key={prob.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-900/50 transition duration-150 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-white">
                          Problem {prob.problemNumber}: {prob.title}
                        </span>
                        <span className="ml-2 text-[10px] text-slate-500">
                          ({prob.topic})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 font-mono">
                      <span className="text-[11px] text-slate-500">
                        {state?.attemptsCount || 0} attempt(s)
                      </span>
                      <span
                        className={`font-bold px-2.5 py-1 rounded-md text-xs ${
                          isPassed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {score} / {prob.points} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <p className="text-center text-xs text-slate-500">
          Thank you for completing the university programming assessment.
        </p>

      </div>
    </div>
  );
};

export default CompletionPage;
