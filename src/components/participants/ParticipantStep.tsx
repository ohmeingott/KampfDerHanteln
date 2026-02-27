import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useParticipantStore } from '../../stores/participantStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { Card } from '../ui/Card';

export function ParticipantStep() {
  const { user } = useAuthStore();
  const {
    people,
    selectedIds,
    addPerson,
    removePerson,
    toggleSelected,
    selectAll,
    deselectAll,
  } = useParticipantStore();

  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim() || !user) return;
    await addPerson(user.uid, newName.trim());
    setNewName('');
  };

  const handleRemove = async (id: string) => {
    if (!user) return;
    await removePerson(user.uid, id);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Wer trainiert heute mit?</h3>

      <Card className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Name eingeben..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={!newName.trim()}>
            Hinzuf{'\u00fc'}gen
          </Button>
        </div>
      </Card>

      <div className="flex gap-3 mb-4">
        <Button variant="secondary" size="sm" onClick={selectAll}>
          Alle ausw{'\u00e4'}hlen
        </Button>
        <Button variant="ghost" size="sm" onClick={deselectAll}>
          Alle abw{'\u00e4'}hlen
        </Button>
      </div>

      <div className="space-y-2">
        {people.map((person) => (
          <div key={person.id} className="flex items-center gap-2">
            <div className="flex-1">
              <Toggle
                checked={selectedIds.has(person.id)}
                onChange={() => toggleSelected(person.id)}
                label={person.displayName}
              />
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleRemove(person.id)}
            >
              &times;
            </Button>
          </div>
        ))}
      </div>

      {people.length === 0 && (
        <Card className="text-center !py-8 text-gray-400">
          <p className="text-lg font-medium">Noch keine Personen im Pool.</p>
          <p className="text-sm mt-1">F{'\u00fc'}ge oben die erste Person hinzu.</p>
        </Card>
      )}

      <div className="mt-4 text-sm text-gray-500 font-medium">
        {selectedIds.size} von {people.length} ausgew{'\u00e4'}hlt
      </div>
    </div>
  );
}
