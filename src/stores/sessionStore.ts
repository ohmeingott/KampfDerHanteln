import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Session, SessionExercise, SessionSettings, Exercise } from '../types';
import { DEFAULT_SESSION_SETTINGS } from '../types';
import { fetchAll, saveDoc } from '../lib/firestore';
import { pickExtremeIndices } from '../lib/extreme';
import { calculatePhysics } from '../lib/physics';

interface SessionState {
  settings: SessionSettings;
  currentSession: Session | null;
  sessions: Session[];
  loading: boolean;
  setSettings: (settings: Partial<SessionSettings>) => void;
  createSession: (
    participants: string[],
    participantNames: string[],
    exercises: Exercise[]
  ) => Session;
  completeSession: (uid: string, totalDurationSec: number) => Promise<void>;
  loadSessions: (uid: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  settings: { ...DEFAULT_SESSION_SETTINGS },
  currentSession: null,
  sessions: [],
  loading: false,

  setSettings: (partial: Partial<SessionSettings>) => {
    set((state) => ({ settings: { ...state.settings, ...partial } }));
  },

  createSession: (
    participants: string[],
    participantNames: string[],
    exercises: Exercise[]
  ): Session => {
    const { settings } = get();
    const extremeIndices = pickExtremeIndices(exercises.length, settings.extremeCount);

    const sessionExercises: SessionExercise[] = exercises.map((ex, i) => ({
      exerciseId: ex.id,
      name: ex.name,
      durationSec: extremeIndices.has(i) ? settings.extremeDurationSec : settings.exerciseDurationSec,
      isExtreme: extremeIndices.has(i),
      order: i,
      romCm: ex.romCm,
      repsPer40s: ex.repsPer40s,
      dumbbellsUsed: ex.dumbbellsUsed,
      verticalFactor: ex.verticalFactor,
    }));

    const physics = calculatePhysics(sessionExercises);

    const session: Session = {
      id: uuid(),
      date: Date.now(),
      participants,
      participantNames,
      exercises: sessionExercises,
      settings,
      completed: false,
      totalDurationSec: 0,
      totalMeters: physics.totalMeters,
      totalWorkKJ: physics.totalWorkKJ,
    };

    set({ currentSession: session });
    return session;
  },

  completeSession: async (uid: string, totalDurationSec: number) => {
    const session = get().currentSession;
    if (!session) return;

    const completed: Session = {
      ...session,
      completed: true,
      totalDurationSec,
    };

    await saveDoc(uid, 'sessions', completed.id, {
      date: completed.date,
      participants: completed.participants,
      participantNames: completed.participantNames,
      exercises: completed.exercises,
      settings: completed.settings,
      completed: true,
      totalDurationSec,
      totalMeters: completed.totalMeters,
      totalWorkKJ: completed.totalWorkKJ,
    });

    set((state) => ({
      currentSession: completed,
      sessions: [...state.sessions, completed],
    }));
  },

  loadSessions: async (uid: string) => {
    set({ loading: true });
    const sessions = await fetchAll<Session>(uid, 'sessions', 'date');
    set({ sessions, loading: false });
  },
}));
