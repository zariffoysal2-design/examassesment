import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  startedAt: Date;
  durationMinutes: number;
  onExpire: () => void;
}

const Timer: React.FC<TimerProps> = ({ startedAt, durationMinutes, onExpire }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const totalSec = durationMinutes * 60;
    const elapsedSec = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return Math.max(0, totalSec - elapsedSec);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const totalSec = durationMinutes * 60;
      const elapsedSec = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const remaining = Math.max(0, totalSec - elapsedSec);

      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationMinutes, onExpire]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const isLowTime = secondsRemaining < 600; // less than 10 mins
  const isCriticalTime = secondsRemaining < 180; // less than 3 mins

  return (
    <div
      className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 border ${
        isCriticalTime
          ? 'bg-red-950/80 text-red-400 border-red-500/50 animate-pulse shadow-lg shadow-red-900/20'
          : isLowTime
          ? 'bg-amber-950/80 text-amber-400 border-amber-500/50'
          : 'bg-slate-800 text-indigo-300 border-slate-700'
      }`}
    >
      {isCriticalTime ? (
        <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-indigo-400" />
      )}
      <span className="text-[10px] text-slate-400 font-sans tracking-normal uppercase font-semibold">
        Time Remaining
      </span>
      <span className="text-sm">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;
