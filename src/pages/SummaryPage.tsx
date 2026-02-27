import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useSessionStore } from '../stores/sessionStore';
import { calculatePhysics } from '../lib/physics';
import { Topbar } from '../components/layout/Topbar';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function SummaryPage() {
  const navigate = useNavigate();
  const { currentSession } = useSessionStore();

  useEffect(() => {
    if (!currentSession) return;
    const end = Date.now() + 2000;
    const frame = () => {
      confetti({ particleCount: 30, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 30, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [currentSession]);

  if (!currentSession) {
    return (
      <div className="min-h-screen">
        <Topbar />
        <PageContainer>
          <Card className="text-center !py-12">
            <p className="text-lg font-medium text-gray-400">Keine Session gefunden.</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              Zum Dashboard
            </Button>
          </Card>
        </PageContainer>
      </div>
    );
  }

  const physics = calculatePhysics(currentSession.exercises);
  const totalMinutes = Math.round(currentSession.totalDurationSec / 60);
  const extremeCount = currentSession.exercises.filter((e) => e.isExtreme).length;

  return (
    <div className="min-h-screen">
      <Topbar />
      <PageContainer>
        <h2 className="text-3xl font-bold mb-6">Session Zusammenfassung</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-3xl font-bold text-primary">{currentSession.exercises.length}</div>
            <div className="text-sm text-gray-500 font-medium">{'\u00dc'}bungen</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-accent">{totalMinutes} min</div>
            <div className="text-sm text-gray-500 font-medium">Dauer</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-secondary">
              {physics.totalMeters.toFixed(1)} m
            </div>
            <div className="text-sm text-gray-500 font-medium">Meter bewegt</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-primary">
              {physics.totalWorkKJ.toFixed(2)} kJ
            </div>
            <div className="text-sm text-gray-500 font-medium">Arbeit</div>
          </Card>
        </div>

        {/* Participants */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold mb-3">Teilnehmer ({currentSession.participantNames.length})</h3>
          <div className="flex flex-wrap gap-2">
            {currentSession.participantNames.map((name, i) => (
              <Badge key={i} variant="success">{name}</Badge>
            ))}
          </div>
        </Card>

        {/* Exercises */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold mb-3">
            {'\u00dc'}bungen ({currentSession.exercises.length})
            {extremeCount > 0 && (
              <span className="text-sm font-medium text-gray-500 ml-2">
                {extremeCount}x Extreme
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {currentSession.exercises.map((ex, i) => {
              const p = physics.perExercise[i];
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-2 border-brutal-thin
                    ${ex.isExtreme ? 'bg-red-50 border-red-300' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-mono w-6">{i + 1}.</span>
                    <span className="font-medium">{ex.name}</span>
                    {ex.isExtreme && <Badge variant="extreme">EXTREME</Badge>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ex.durationSec}s &middot; {p.meters.toFixed(1)}m
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => navigate('/dashboard')}>Zum Dashboard</Button>
          <Button variant="secondary" onClick={() => navigate('/stats')}>
            Statistiken
          </Button>
        </div>
      </PageContainer>
    </div>
  );
}
