import { useSessionStore } from '../../stores/sessionStore';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function SettingsStep() {
  const { settings, setSettings } = useSessionStore();

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Session Einstellungen</h3>
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={'\u00dc' + 'bungsdauer (Sekunden)'}
            type="number"
            min={10}
            max={120}
            value={settings.exerciseDurationSec}
            onChange={(e) => setSettings({ exerciseDurationSec: Number(e.target.value) })}
          />
          <Input
            label="Pause (Sekunden)"
            type="number"
            min={3}
            max={30}
            value={settings.restDurationSec}
            onChange={(e) => setSettings({ restDurationSec: Number(e.target.value) })}
          />
          <Input
            label="Extreme-Dauer (Sekunden)"
            type="number"
            min={10}
            max={180}
            value={settings.extremeDurationSec}
            onChange={(e) => setSettings({ extremeDurationSec: Number(e.target.value) })}
          />
          <Input
            label="Anzahl Extreme-Runden"
            type="number"
            min={0}
            max={10}
            value={settings.extremeCount}
            onChange={(e) => setSettings({ extremeCount: Number(e.target.value) })}
          />
        </div>
      </Card>
    </div>
  );
}
