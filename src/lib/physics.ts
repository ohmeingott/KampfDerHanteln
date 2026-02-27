import type { SessionExercise } from '../types';
import { GRAVITY, DEFAULT_DUMBBELL_MASS_KG } from '../types';

export interface PhysicsResult {
  totalMeters: number;
  totalWorkKJ: number;
  perExercise: {
    name: string;
    meters: number;
    workKJ: number;
    isExtreme: boolean;
  }[];
}

export function calculatePhysics(exercises: SessionExercise[]): PhysicsResult {
  const perExercise = exercises.map((ex) => {
    const scaleFactor = ex.durationSec / 40;
    const estimatedReps = ex.repsPer40s * scaleFactor;
    const distancePerRepM = ex.romCm / 100;
    const meters = distancePerRepM * estimatedReps * ex.dumbbellsUsed;
    const massKg = DEFAULT_DUMBBELL_MASS_KG * ex.dumbbellsUsed;
    const workJ = massKg * GRAVITY * meters * ex.verticalFactor;

    return {
      name: ex.name,
      meters: Math.round(meters * 100) / 100,
      workKJ: Math.round((workJ / 1000) * 1000) / 1000,
      isExtreme: ex.isExtreme,
    };
  });

  const totalMeters = Math.round(perExercise.reduce((s, e) => s + e.meters, 0) * 100) / 100;
  const totalWorkKJ = Math.round(perExercise.reduce((s, e) => s + e.workKJ, 0) * 1000) / 1000;

  return { totalMeters, totalWorkKJ, perExercise };
}
