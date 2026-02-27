import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Exercise, SessionSlot } from '../types';
import { TARGET_EXERCISE_COUNT } from '../types';
import { defaultExercises } from '../data/defaultExercises';
import { fetchAll, saveDoc, removeDoc } from '../lib/firestore';

interface ExerciseState {
  library: Exercise[];
  sessionExercises: SessionSlot[];
  loading: boolean;
  loadExercises: (uid: string) => Promise<void>;
  addExercise: (uid: string, exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (uid: string, exercise: Exercise) => void;
  removeExercise: (uid: string, exerciseId: string) => void;
  addToSession: (exercise: Exercise) => void;
  removeFromSession: (slotId: string) => void;
  addAllToSession: () => void;
  clearSession: () => void;
  randomSelect: (count?: number) => void;
  shuffleSession: () => void;
  reorderSession: (slots: SessionSlot[]) => void;
}

function seedDefaults(): Exercise[] {
  return defaultExercises.map((ex) => ({ id: uuid(), ...ex }));
}

function toSlot(exercise: Exercise): SessionSlot {
  return { slotId: uuid(), exercise };
}

/**
 * Pick ~count unique exercises from the library, repeat each 2-3 times,
 * then arrange: floor exercises grouped together, never same exercise consecutive.
 */
function buildSmartSession(library: Exercise[], targetTotal: number): SessionSlot[] {
  if (library.length === 0) return [];

  // How many unique exercises to pick: targetTotal / avg(2.5) ≈ targetTotal * 0.4
  const uniqueCount = Math.min(
    Math.max(Math.round(targetTotal / 3), 3),
    library.length
  );

  // Pick random unique exercises
  const shuffled = [...library].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, uniqueCount);

  // Assign 2-3 repetitions each to reach ~targetTotal
  const slots: SessionSlot[] = [];
  let remaining = targetTotal;

  for (let i = 0; i < picked.length; i++) {
    const isLast = i === picked.length - 1;
    let reps: number;
    if (isLast) {
      reps = Math.max(2, Math.min(3, remaining));
    } else {
      reps = remaining / (picked.length - i) > 2.5 ? 3 : 2;
      // Add some randomness
      if (Math.random() > 0.5 && remaining > (picked.length - i) * 2) {
        reps = 3;
      } else {
        reps = 2;
      }
    }
    remaining -= reps;
    for (let r = 0; r < reps; r++) {
      slots.push(toSlot(picked[i]));
    }
  }

  return arrangeSlots(slots);
}

/**
 * Arrange slots so that:
 * 1. Floor exercises are grouped together (consecutive block)
 * 2. Same exercise never appears directly after itself
 */
function arrangeSlots(slots: SessionSlot[]): SessionSlot[] {
  const floor = slots.filter((s) => s.exercise.isFloor);
  const standing = slots.filter((s) => !s.exercise.isFloor);

  const arrangedFloor = preventConsecutiveSame(floor);
  const arrangedStanding = preventConsecutiveSame(standing);

  // Insert floor block at a random position within the standing exercises
  if (arrangedFloor.length === 0) return arrangedStanding;
  if (arrangedStanding.length === 0) return arrangedFloor;

  // Pick insertion point roughly in the middle area (avoid very start/end)
  const min = Math.max(1, Math.floor(arrangedStanding.length * 0.25));
  const max = Math.floor(arrangedStanding.length * 0.75);
  const insertAt = min + Math.floor(Math.random() * (max - min + 1));

  const result = [
    ...arrangedStanding.slice(0, insertAt),
    ...arrangedFloor,
    ...arrangedStanding.slice(insertAt),
  ];

  return result;
}

/**
 * Shuffle an array so the same exercise never appears consecutively.
 */
function preventConsecutiveSame(slots: SessionSlot[]): SessionSlot[] {
  if (slots.length <= 1) return slots;

  // Fisher-Yates shuffle first
  const arr = [...slots];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Fix consecutive duplicates with swaps (best-effort)
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].exercise.id === arr[i - 1].exercise.id) {
      // Find a swap candidate further ahead
      let swapped = false;
      for (let j = i + 1; j < arr.length; j++) {
        if (
          arr[j].exercise.id !== arr[i - 1].exercise.id &&
          (i + 1 >= arr.length || arr[j].exercise.id !== arr[i + 1]?.exercise.id)
        ) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swapped = true;
          break;
        }
      }
      // Try swapping backward if forward didn't work
      if (!swapped) {
        for (let j = 0; j < i - 1; j++) {
          if (
            arr[j].exercise.id !== arr[i].exercise.id &&
            (j === 0 || arr[j - 1].exercise.id !== arr[i].exercise.id) &&
            arr[j + 1].exercise.id !== arr[i].exercise.id
          ) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            break;
          }
        }
      }
    }
  }

  return arr;
}

export const useExerciseStore = create<ExerciseState>((set) => ({
  library: [],
  sessionExercises: [],
  loading: false,

  loadExercises: async (uid: string) => {
    set({ loading: true });

    let exercises: Exercise[] = [];
    try {
      exercises = await fetchAll<Exercise>(uid, 'exercises');
    } catch (err) {
      console.warn('Firestore load failed, using defaults:', err);
    }

    if (exercises.length === 0) {
      const seeded = seedDefaults();
      exercises = seeded;
      for (const ex of seeded) {
        const { id, ...data } = ex;
        saveDoc(uid, 'exercises', id, data).catch(() => {});
      }
    }

    set({ library: exercises, loading: false });
  },

  addExercise: (uid: string, exerciseData: Omit<Exercise, 'id'>) => {
    const id = uuid();
    const exercise: Exercise = { id, ...exerciseData };
    set((state) => ({ library: [...state.library, exercise] }));
    saveDoc(uid, 'exercises', id, exerciseData).catch(() => {});
  },

  updateExercise: (uid: string, exercise: Exercise) => {
    const { id, ...data } = exercise;
    set((state) => ({
      library: state.library.map((e) => (e.id === id ? exercise : e)),
      sessionExercises: state.sessionExercises.map((s) =>
        s.exercise.id === id ? { ...s, exercise } : s
      ),
    }));
    saveDoc(uid, 'exercises', id, data).catch(() => {});
  },

  removeExercise: (uid: string, exerciseId: string) => {
    set((state) => ({
      library: state.library.filter((e) => e.id !== exerciseId),
      sessionExercises: state.sessionExercises.filter((s) => s.exercise.id !== exerciseId),
    }));
    removeDoc(uid, 'exercises', exerciseId).catch(() => {});
  },

  addToSession: (exercise: Exercise) => {
    set((state) => ({
      sessionExercises: [...state.sessionExercises, toSlot(exercise)],
    }));
  },

  removeFromSession: (slotId: string) => {
    set((state) => ({
      sessionExercises: state.sessionExercises.filter((s) => s.slotId !== slotId),
    }));
  },

  addAllToSession: () => {
    set((state) => ({
      sessionExercises: state.library.map(toSlot),
    }));
  },

  clearSession: () => {
    set({ sessionExercises: [] });
  },

  randomSelect: (count?: number) => {
    const target = count ?? TARGET_EXERCISE_COUNT;
    set((state) => ({
      sessionExercises: buildSmartSession(state.library, target),
    }));
  },

  shuffleSession: () => {
    set((state) => ({
      sessionExercises: arrangeSlots(state.sessionExercises),
    }));
  },

  reorderSession: (slots: SessionSlot[]) => {
    set({ sessionExercises: slots });
  },
}));
