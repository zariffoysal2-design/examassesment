import React, { useState, useEffect } from 'react';
import type { Participant, SessionData } from './types';
import { apiService } from './services/api';
import HomePage from './components/HomePage';
import AssessmentApp from './pages/AssessmentApp';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Browser Refresh Recovery (Retrieve session state from backend)
  useEffect(() => {
    async function recoverSession() {
      const storedSessionId = localStorage.getItem('assessment_session_id');
      if (!storedSessionId) {
        setIsInitializing(false);
        return;
      }

      try {
        const retrievedSession = await apiService.getSession(storedSessionId);
        setSession(retrievedSession);
        setParticipant({
          name: retrievedSession.name,
          university: retrievedSession.university,
          studentId: retrievedSession.student_id,
        });
      } catch (err) {
        console.warn('Session recovery failed. Clearing local storage session.', err);
        localStorage.removeItem('assessment_session_id');
      } finally {
        setIsInitializing(false);
      }
    }

    recoverSession();
  }, []);

  const handleStartTest = (participantInfo: Participant, sessionData: SessionData) => {
    setParticipant(participantInfo);
    setSession(sessionData);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-slate-300">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-semibold">Recovering candidate session from backend...</p>
      </div>
    );
  }

  if (!participant || !session) {
    return <HomePage onStartTest={handleStartTest} />;
  }

  return <AssessmentApp participant={participant} session={session} />;
};

export default App;
