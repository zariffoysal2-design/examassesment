import React, { useState } from 'react';
import type { Participant, SessionData } from '../types';
import { apiService } from '../services/api';
import { Code2, School, User, IdCard, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

interface HomePageProps {
  onStartTest: (participant: Participant, session: SessionData) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartTest }) => {
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedUniversity = university.trim();
    const trimmedStudentId = studentId.trim();

    if (!trimmedName || !trimmedUniversity || !trimmedStudentId) {
      setError('All fields are required. Please fill in your name, university, and student ID.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const participantInfo: Participant = {
        name: trimmedName,
        university: trimmedUniversity,
        studentId: trimmedStudentId,
      };

      const session = await apiService.createSession(participantInfo);

      // Save session ID for browser refresh recovery
      localStorage.setItem('assessment_session_id', session.session_id);

      onStartTest(participantInfo, session);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize session on backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/20 ring-1 ring-white/20">
            <Code2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Programming Skill Assessment
          </h1>
          <p className="text-sm text-indigo-400 font-medium tracking-wide uppercase">
            University Programming Test
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl shadow-black/50 space-y-6">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Enter your candidate credentials to launch your 60-minute test session.</span>
          </div>

          {error && (
            <div className="p-3.5 bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-medium rounded-xl flex items-start space-x-2">
              <span className="shrink-0 text-red-400">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rahim Chowdhury"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:opacity-50"
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <School className="w-3.5 h-3.5 text-indigo-400" />
                <span>University Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. University of Engineering and Technology"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:opacity-50"
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <IdCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Student ID</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 210201"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:opacity-50"
              />
            </div>

            {/* Assessment Rules */}
            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>5 Problems (Conditional, Loops, Arrays, Functions, Algorithmic)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Total Score: 100 points | Duration: 60 Minutes</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Backend...</span>
                </>
              ) : (
                <>
                  <span>Start Test</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          Powered by University Code Evaluation Platform
        </p>

      </div>
    </div>
  );
};

export default HomePage;
