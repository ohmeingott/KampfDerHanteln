import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { speak, stopSpeaking } from '../lib/tts';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

type Phase = 'exercise' | 'rest' | 'finished';

export function LiveSessionPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSession, completeSession } = useSessionStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('exercise');
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);

  const sessionStartRef = useRef(Date.now());
  const endTimeRef = useRef(0);
  const animFrameRef = useRef(0);
  const completingRef = useRef(false);

  const exercises = currentSession?.exercises ?? [];
  const settings = currentSession?.settings;
  const currentExercise = exercises[currentIndex];
  const nextExercise = exercises[currentIndex + 1];

  const startTimer = useCallback((durationSec: number) => {
    endTimeRef.current = Date.now() + durationSec * 1000;
    setTimeLeft(durationSec);
  }, []);

  const finishSession = useCallback(async () => {
    if (completingRef.current || !user || !currentSession) return;
    completingRef.current = true;
    stopSpeaking();
    const totalDuration = Math.round((Date.now() - sessionStartRef.current) / 1000);
    await completeSession(user.uid, totalDuration);
    navigate('/session/summary');
  }, [user, currentSession, completeSession, navigate]);

  const handlePhaseEnd = useCallback(() => {
    if (phase === 'exercise') {
      if (currentIndex >= exercises.length - 1) {
        setPhase('finished');
        speak('Fertig! Gute Arbeit!');
        return;
      }
      setPhase('rest');
      startTimer(settings!.restDurationSec);

      const next = exercises[currentIndex + 1];
      if (next.isExtreme) {
        speak('Extreme!');
        setTimeout(() => speak(next.name), 1200);
      } else {
        speak(`N\u00e4chste \u00dcbung: ${next.name}`);
      }
    } else if (phase === 'rest') {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setPhase('exercise');
      startTimer(exercises[nextIdx].durationSec);
    }
  }, [phase, currentIndex, exercises, settings, startTimer]);

  // Initialize on mount
  useEffect(() => {
    if (!currentSession || exercises.length === 0) {
      navigate('/dashboard');
      return;
    }
    const ex = exercises[0];
    if (ex.isExtreme) {
      speak('Extreme!');
      setTimeout(() => speak(ex.name), 1500);
    } else {
      speak(ex.name);
    }
    startTimer(ex.durationSec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer tick loop
  useEffect(() => {
    if (paused || phase === 'finished') return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        handlePhaseEnd();
        return;
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, paused, currentIndex, handlePhaseEnd]);

  // Auto-finish when phase becomes 'finished'
  useEffect(() => {
    if (phase === 'finished') {
      finishSession();
    }
  }, [phase, finishSession]);

  const handlePause = () => {
    if (paused) {
      const remainingMs = timeLeft * 1000;
      endTimeRef.current = Date.now() + remainingMs;
    }
    setPaused(!paused);
  };

  if (!currentSession || exercises.length === 0) return null;

  const progress = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      {/* Progress bar */}
      <div className="h-2 bg-gray-700 w-full">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {phase === 'rest' ? (
          <>
            <div className="text-2xl font-bold text-gray-400 mb-4 uppercase tracking-wider">
              Pause
            </div>
            <div className="text-[8rem] leading-none font-bold tabular-nums text-secondary">
              {timeLeft}
            </div>
            {nextExercise && (
              <div className="mt-8 text-center">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                  N{'\u00e4'}chste {'\u00dc'}bung
                </div>
                <div className="text-3xl font-bold">
                  {nextExercise.name}
                </div>
                {nextExercise.isExtreme && (
                  <Badge variant="extreme">EXTREME</Badge>
                )}
              </div>
            )}
          </>
        ) : phase === 'exercise' ? (
          <>
            <div className="text-lg text-gray-400 mb-2 font-medium">
              {'\u00dc'}bung {currentIndex + 1} von {exercises.length}
            </div>

            {currentExercise.isExtreme && (
              <div className="mb-4">
                <Badge variant="extreme">EXTREME</Badge>
              </div>
            )}

            <h1 className="text-5xl md:text-7xl font-bold text-center mb-8 leading-tight">
              {currentExercise.name}
            </h1>

            <div
              className={`text-[10rem] leading-none font-bold tabular-nums
                ${timeLeft <= 5 ? 'text-primary animate-pulse' : 'text-white'}`}
            >
              {timeLeft}
            </div>

            <div className="text-lg text-gray-500 mt-4 font-medium">
              {currentExercise.durationSec} Sekunden
            </div>

            {nextExercise && (
              <div className="mt-8 text-gray-500 text-sm">
                Danach: {nextExercise.name}
                {nextExercise.isExtreme && ' (EXTREME)'}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 p-6">
        {phase !== 'finished' && (
          <>
            <Button
              variant={paused ? 'primary' : 'secondary'}
              size="lg"
              onClick={handlePause}
            >
              {paused ? 'Weiter' : 'Pause'}
            </Button>
            <Button variant="danger" size="lg" onClick={finishSession}>
              Beenden
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
