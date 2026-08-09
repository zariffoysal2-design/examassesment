import React from 'react';
import type { Participant } from '../types';
import { User, School, IdCard, LogOut, Code2 } from 'lucide-react';
import Timer from './Timer';

interface NavbarProps {
  participant: Participant;
  startedAt: Date;
  durationMinutes: number;
  onTimeExpired: () => void;
  onFinishRequest: () => void;
  isCompleted?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  participant,
  startedAt,
  durationMinutes,
  onTimeExpired,
  onFinishRequest,
  isCompleted = false,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand / Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-md">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Programming Skill Assessment
              </h1>
              <p className="text-xs text-indigo-400 font-medium">University Programming Test</p>
            </div>
          </div>

          {/* Participant Info Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white">{participant.name}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <School className="w-3.5 h-3.5 text-indigo-400" />
              <span>{participant.university}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <IdCard className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono bg-slate-900/80 px-2 py-0.5 rounded text-indigo-300 font-medium">
                {participant.studentId}
              </span>
            </div>
          </div>

          {/* Controls: Timer & Finish Test */}
          <div className="flex items-center space-x-4">
            {!isCompleted ? (
              <>
                <Timer
                  startedAt={startedAt}
                  durationMinutes={durationMinutes}
                  onExpire={onTimeExpired}
                />
                <button
                  onClick={onFinishRequest}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs rounded-xl shadow-sm hover:shadow-red-900/30 transition duration-150 active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Finish Test</span>
                </button>
              </>
            ) : (
              <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-lg">
                Assessment Finished
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
