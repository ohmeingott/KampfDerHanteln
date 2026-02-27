import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuthStore } from '../../stores/authStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Exercise } from '../../types';
import { ExerciseEditDialog } from './ExerciseEditDialog';

function SortableItem({ exercise, onRemove }: { exercise: Exercise; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: exercise.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-white border-brutal-thin px-3 py-2 text-sm font-medium"
    >
      <span {...attributes} {...listeners} className="cursor-grab text-gray-400 select-none">
        &#x2630;
      </span>
      <span className="flex-1">{exercise.name}</span>
      <button
        onClick={onRemove}
        className="text-red-500 font-bold hover:text-red-700 cursor-pointer"
      >
        &times;
      </button>
    </div>
  );
}

export function ExerciseStep() {
  const { user } = useAuthStore();
  const {
    library,
    sessionExercises,
    loading,
    addToSession,
    removeFromSession,
    addAllToSession,
    clearSession,
    randomSelect,
    shuffleSession,
    reorderSession,
    removeExercise,
    loadExercises,
  } = useExerciseStore();

  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);

  // Ensure exercises are loaded
  useEffect(() => {
    if (user && library.length === 0 && !loading) {
      loadExercises(user.uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, library.length, loading]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sessionIds = new Set(sessionExercises.map((e) => e.id));
  const availableExercises = library.filter((e) => !sessionIds.has(e.id));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sessionExercises.findIndex((e) => e.id === active.id);
    const newIndex = sessionExercises.findIndex((e) => e.id === over.id);
    reorderSession(arrayMove(sessionExercises, oldIndex, newIndex));
  }

  const handleDeleteExercise = async (id: string) => {
    if (!user) return;
    await removeExercise(user.uid, id);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">{'\u00dc'}bungen f{'\u00fc'}r heute</h3>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="secondary" size="sm" onClick={() => randomSelect()}>
          Random (~25)
        </Button>
        <Button variant="secondary" size="sm" onClick={shuffleSession}>
          Shuffle
        </Button>
        <Button variant="ghost" size="sm" onClick={addAllToSession}>
          Alle rein
        </Button>
        <Button variant="ghost" size="sm" onClick={clearSession}>
          Alle raus
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowAddNew(true)}>
          + Neue {'\u00dc'}bung
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Library */}
        <div>
          <h4 className="font-bold mb-3 text-sm uppercase tracking-wider text-gray-500">
            Bibliothek ({availableExercises.length})
          </h4>
          <Card className="!p-3 max-h-[500px] overflow-y-auto">
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Laden...
              </p>
            ) : availableExercises.length === 0 && library.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Keine {'\u00dc'}bungen vorhanden. Klicke &quot;+ Neue {'\u00dc'}bung&quot;.
              </p>
            ) : availableExercises.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Alle {'\u00dc'}bungen ausgew{'\u00e4'}hlt
              </p>
            ) : (
              <div className="space-y-1">
                {availableExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-2 px-3 py-2 border-brutal-thin text-sm font-medium hover:bg-gray-50"
                  >
                    <span className="flex-1">{exercise.name}</span>
                    <button
                      onClick={() => setEditingExercise(exercise)}
                      className="text-gray-400 hover:text-dark cursor-pointer text-xs"
                    >
                      &#9998;
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="text-gray-400 hover:text-red-500 cursor-pointer text-xs"
                    >
                      &#128465;
                    </button>
                    <Button size="sm" onClick={() => addToSession(exercise)}>
                      +
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Session */}
        <div>
          <h4 className="font-bold mb-3 text-sm uppercase tracking-wider text-gray-500">
            Heute ({sessionExercises.length})
          </h4>
          <Card className="!p-3 max-h-[500px] overflow-y-auto">
            {sessionExercises.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Noch keine {'\u00dc'}bungen gew{'\u00e4'}hlt
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sessionExercises.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {sessionExercises.map((exercise) => (
                      <SortableItem
                        key={exercise.id}
                        exercise={exercise}
                        onRemove={() => removeFromSession(exercise.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </Card>
        </div>
      </div>

      {editingExercise && (
        <ExerciseEditDialog
          exercise={editingExercise}
          onClose={() => setEditingExercise(null)}
        />
      )}

      {showAddNew && (
        <ExerciseEditDialog
          exercise={null}
          onClose={() => setShowAddNew(false)}
        />
      )}
    </div>
  );
}
