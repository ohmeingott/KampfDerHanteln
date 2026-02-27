import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Exercise } from '../../types';

interface Props {
  exercise: Exercise | null;
  onClose: () => void;
}

export function ExerciseEditDialog({ exercise, onClose }: Props) {
  const { user } = useAuthStore();
  const { updateExercise, addExercise } = useExerciseStore();

  const [name, setName] = useState(exercise?.name ?? '');
  const [romCm, setRomCm] = useState(exercise?.romCm ?? 40);
  const [repsPer40s, setRepsPer40s] = useState(exercise?.repsPer40s ?? 12);
  const [dumbbellsUsed, setDumbbellsUsed] = useState(exercise?.dumbbellsUsed ?? 2);
  const [verticalFactor, setVerticalFactor] = useState(exercise?.verticalFactor ?? 0.5);
  const [isFloor, setIsFloor] = useState(exercise?.isFloor ?? false);

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    if (exercise) {
      await updateExercise(user.uid, {
        id: exercise.id,
        name: name.trim(),
        romCm,
        repsPer40s,
        dumbbellsUsed,
        verticalFactor,
        isFloor,
      });
    } else {
      await addExercise(user.uid, {
        name: name.trim(),
        romCm,
        repsPer40s,
        dumbbellsUsed,
        verticalFactor,
        isFloor,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-brutal shadow-brutal-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {exercise ? '\u00dc' + 'bung bearbeiten' : 'Neue \u00dc' + 'bung'}
        </h3>

        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="ROM (cm)"
            type="number"
            value={romCm}
            onChange={(e) => setRomCm(Number(e.target.value))}
          />
          <Input
            label="Reps pro 40s"
            type="number"
            value={repsPer40s}
            onChange={(e) => setRepsPer40s(Number(e.target.value))}
          />
          <Input
            label="Hanteln (1 oder 2)"
            type="number"
            min={1}
            max={2}
            value={dumbbellsUsed}
            onChange={(e) => setDumbbellsUsed(Number(e.target.value))}
          />
          <Input
            label="Vertikalfaktor (0-1)"
            type="number"
            step={0.05}
            min={0}
            max={1}
            value={verticalFactor}
            onChange={(e) => setVerticalFactor(Number(e.target.value))}
          />
          <label className="flex items-center gap-3 font-bold text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFloor}
              onChange={(e) => setIsFloor(e.target.checked)}
              className="w-5 h-5 accent-blue-500"
            />
            Boden{'\u00fc'}bung
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} disabled={!name.trim()}>
            Speichern
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  );
}
