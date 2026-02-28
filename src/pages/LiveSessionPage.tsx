import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { speak, stopSpeaking } from '../lib/tts';
import { beepCountdown, beepGo, beepEnd } from '../lib/beep';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SpotifyPlayerBar } from '../components/spotify/SpotifyPlayerBar';
import { useSpotifyStore } from '../stores/spotifyStore';

type Phase = 'countdown' | 'exercise' | 'rest' | 'finished';

const BG_COLORS = [
  '#1a1a2e', // deep navy
  '#16213e', // dark blue
  '#0f3460', // royal blue
  '#1b1b3a', // dark purple
  '#2d132c', // plum
  '#3b0d2c', // dark magenta
  '#1a3c40', // dark teal
  '#0b3d3d', // deep cyan
  '#2b2d42', // steel blue
  '#3d1c02', // dark amber
  '#1c2833', // charcoal blue
  '#1e0a3c', // deep violet
];

export function LiveSessionPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSession, completeSession } = useSessionStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('countdown');
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);

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

  const finishSession = useCallback(() => {
    if (completingRef.current || !user || !currentSession) return;
    completingRef.current = true;
    stopSpeaking();
    const totalDuration = Math.round((Date.now() - sessionStartRef.current) / 1000);
    completeSession(user.uid, totalDuration).catch((err) => {
      console.warn('Failed to save session:', err);
    });
    navigate('/session/summary');
  }, [user, currentSession, completeSession, navigate]);

  const handlePhaseEnd = useCallback(() => {
    if (phase === 'exercise') {
      beepEnd();
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
      beepGo();
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setPhase('exercise');
      startTimer(exercises[nextIdx].durationSec);
    }
  }, [phase, currentIndex, exercises, settings, startTimer]);

  // Initialize on mount – start with countdown
  useEffect(() => {
    if (!currentSession || exercises.length === 0) {
      navigate('/dashboard');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown 3-2-1-GO logic
  useEffect(() => {
    if (phase !== 'countdown') return;
    beepCountdown();
    if (countdownNum <= 0) {
      beepGo();
      setPhase('exercise');
      const ex = exercises[0];
      if (ex.isExtreme) {
        speak('Extreme!');
        setTimeout(() => speak(ex.name), 1500);
      } else {
        speak(ex.name);
      }
      startTimer(ex.durationSec);
      sessionStartRef.current = Date.now();
      return;
    }
    const timer = setTimeout(() => setCountdownNum((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdownNum, exercises, startTimer]);

  // Timer tick loop
  useEffect(() => {
    if (paused || phase === 'finished' || phase === 'countdown') return;

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

  const { isConnected: spotifyConnected, isPlaying: spotifyPlaying, togglePlayback: spotifyToggle } = useSpotifyStore();

  const handlePause = () => {
    if (paused) {
      const remainingMs = timeLeft * 1000;
      endTimeRef.current = Date.now() + remainingMs;
      if (spotifyConnected && !spotifyPlaying) spotifyToggle();
    } else {
      if (spotifyConnected && spotifyPlaying) spotifyToggle();
    }
    setPaused(!paused);
  };

  const handleSkip = () => {
    stopSpeaking();
    if (currentIndex >= exercises.length - 1) {
      setPhase('finished');
      speak('Fertig! Gute Arbeit!');
      return;
    }
    // Jump to rest phase announcing the next exercise
    setPhase('rest');
    startTimer(settings!.restDurationSec);
    const next = exercises[currentIndex + 1];
    if (next.isExtreme) {
      speak('Extreme!');
      setTimeout(() => speak(next.name), 1200);
    } else {
      speak(`N\u00e4chste \u00dcbung: ${next.name}`);
    }
  };

  if (!currentSession || exercises.length === 0) return null;

  const progress = ((currentIndex + 1) / exercises.length) * 100;
  const bgColor = phase === 'rest' ? '#111111' : BG_COLORS[currentIndex % BG_COLORS.length];

  return (
    <div
      className="min-h-screen text-white flex flex-col transition-colors duration-700"
      style={{ backgroundColor: bgColor }}
    >
      {/* Progress bar */}
      <div className="h-2 bg-gray-700 w-full">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            key={countdownNum}
            className="text-[7rem] sm:text-[10rem] md:text-[14rem] leading-none font-bold text-white animate-ping-once"
          >
            {countdownNum > 0 ? countdownNum : 'LOS!'}
          </div>
        </div>
      )}

      {/* Main content */}
      {phase !== 'countdown' && (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {phase === 'rest' ? (
          <>
            <div className="text-2xl font-bold text-gray-400 mb-4 uppercase tracking-wider">
              Pause
            </div>
            <div className="text-[5rem] sm:text-[6rem] md:text-[8rem] leading-none font-bold tabular-nums text-secondary">
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

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-center mb-8 leading-tight">
              {currentExercise.name}
            </h1>

            <div
              className={`text-[5rem] sm:text-[7rem] md:text-[10rem] leading-none font-bold tabular-nums
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
      )}

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3 p-4 pb-20 sm:gap-4 sm:p-6 sm:pb-20">
        {phase !== 'finished' && (
          <>
            <Button
              variant={paused ? 'primary' : 'secondary'}
              size="lg"
              onClick={handlePause}
            >
              {paused ? 'Weiter' : 'Pause'}
            </Button>
            {phase === 'exercise' && (
              <Button variant="secondary" size="lg" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button variant="danger" size="lg" onClick={finishSession}>
              Beenden
            </Button>
          </>
        )}
      </div>

      <SpotifyPlayerBar />
    </div>
  );
}
