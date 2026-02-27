import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Exercise } from '../types';
import { TARGET_EXERCISE_COUNT } from '../types';
import { defaultExercises } from '../data/defaultExercises';
import { fetchAll, saveDoc, removeDoc } from '../lib/firestore';

interface ExerciseState {
  library: Exercise[];
  sessionExercises: Exercise[];
  loading: boolean;
  loadExercises: (uid: string) => Promise<void>;
  addExercise: (uid: string, exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (uid: string, exercise: Exercise) => void;
  removeExercise: (uid: string, exerciseId: string) => void;
  addToSession: (exercise: Exercise) => void;
  removeFromSession: (exerciseId: string) => void;
  addAllToSession: () => void;
  clearSession: () => void;
  randomSelect: (count?: number) => void;
  shuffleSession: () => void;
  reorderSession: (exercises: Exercise[]) => void;
}

export const useExerciseStore = create<ExerciseState>((set) => ({
  library: [],
  sessionExercises: [],
  loading: false,

  loadExercises: async (uid: string) => {
    set({ loading: true });
    let exercises = await fetchAll<Exercise>(uid, 'exercises');

    if (exercises.length === 0) {
      // Seed default exercises
      const seeded: Exercise[] = [];
      for (const ex of defaultExercises) {
        const id = uuid();
        const exercise: Exercise = { id, ...ex };
        saveDoc(uid, 'exercises', id, ex);
        seeded.push(exercise);
      }
      exercises = seeded;
    }

    set({ library: exercises, loading: false });
  },

  addExercise: (uid: string, exerciseData: Omit<Exercise, 'id'>) => {
    const id = uuid();
    const exercise: Exercise = { id, ...exerciseData };
    set((state) => ({ library: [...state.library, exercise] }));
    saveDoc(uid, 'exercises', id, exerciseData);
  },

  updateExercise: (uid: string, exercise: Exercise) => {
    const { id, ...data } = exercise;
    set((state) => ({
      library: state.library.map((e) => (e.id === id ? exercise : e)),
      sessionExercises: state.sessionExercises.map((e) => (e.id === id ? exercise : e)),
    }));
    saveDoc(uid, 'exercises', id, data);
  },

  removeExercise: (uid: string, exerciseId: string) => {
    set((state) => ({
      library: state.library.filter((e) => e.id !== exerciseId),
      sessionExercises: state.sessionExercises.filter((e) => e.id !== exerciseId),
    }));
    removeDoc(uid, 'exercises', exerciseId);
  },

  addToSession: (exercise: Exercise) => {
    set((state) => {
      if (state.sessionExercises.some((e) => e.id === exercise.id)) return state;
      return { sessionExercises: [...state.sessionExercises, exercise] };
    });
  },

  removeFromSession: (exerciseId: string) => {
    set((state) => ({
      sessionExercises: state.sessionExercises.filter((e) => e.id !== exerciseId),
    }));
  },

  addAllToSession: () => {
    set((state) => ({ sessionExercises: [...state.library] }));
  },

  clearSession: () => {
    set({ sessionExercises: [] });
  },

  randomSelect: (count?: number) => {
    const target = count ?? TARGET_EXERCISE_COUNT;
    set((state) => {
      const shuffled = [...state.library].sort(() => Math.random() - 0.5);
      return { sessionExercises: shuffled.slice(0, Math.min(target, shuffled.length)) };
    });
  },

  shuffleSession: () => {
    set((state) => ({
      sessionExercises: [...state.sessionExercises].sort(() => Math.random() - 0.5),
    }));
  },

  reorderSession: (exercises: Exercise[]) => {
    set({ sessionExercises: exercises });
  },
}));
