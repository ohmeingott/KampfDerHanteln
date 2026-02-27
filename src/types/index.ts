export interface Person {
  id: string;
  displayName: string;
  nickname?: string;
  createdAt: number;
}

export interface Exercise {
  id: string;
  name: string;
  romCm: number;
  repsPer40s: number;
  dumbbellsUsed: number;
  verticalFactor: number;
  isFloor?: boolean;
}

export interface SessionSlot {
  slotId: string;
  exercise: Exercise;
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  durationSec: number;
  isExtreme: boolean;
  order: number;
  romCm: number;
  repsPer40s: number;
  dumbbellsUsed: number;
  verticalFactor: number;
}

export interface SessionSettings {
  exerciseDurationSec: number;
  restDurationSec: number;
  extremeDurationSec: number;
  extremeCount: number;
}

export interface Session {
  id: string;
  date: number;
  participants: string[];
  participantNames: string[];
  exercises: SessionExercise[];
  settings: SessionSettings;
  completed: boolean;
  totalDurationSec: number;
  totalMeters: number;
  totalWorkKJ: number;
}

export interface PersonStats {
  personId: string;
  displayName: string;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastSessionDate: number | null;
}

export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  exerciseDurationSec: 40,
  restDurationSec: 5,
  extremeDurationSec: 60,
  extremeCount: 2,
};

export const STREAK_MAX_GAP_DAYS = 7;
export const POINTS_PER_SESSION = 10;
export const STREAK_BONUS = 5;
export const TARGET_EXERCISE_COUNT = 25;
export const GRAVITY = 9.81;
export const DEFAULT_DUMBBELL_MASS_KG = 10;
