import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useParticipantStore } from '../stores/participantStore';
import { useExerciseStore } from '../stores/exerciseStore';
import { useSessionStore } from '../stores/sessionStore';
import { Topbar } from '../components/layout/Topbar';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { people, loadPeople } = useParticipantStore();
  const { library, loadExercises } = useExerciseStore();
  const { sessions, loadSessions } = useSessionStore();

  useEffect(() => {
    if (!user) return;
    loadPeople(user.uid);
    loadExercises(user.uid);
    loadSessions(user.uid);
  }, [user]);

  const completedSessions = sessions.filter((s) => s.completed);

  return (
    <div className="min-h-screen">
      <Topbar />
      <PageContainer>
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <div className="text-4xl font-bold text-primary">{people.length}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Personen im Pool</div>
          </Card>
          <Card>
            <div className="text-4xl font-bold text-accent">{library.length}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">{'\u00dc'}bungen</div>
          </Card>
          <Card>
            <div className="text-4xl font-bold text-secondary">{completedSessions.length}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Sessions</div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button size="lg" onClick={() => navigate('/session/setup')}>
            Neue Session starten
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/stats')}>
            Statistiken
          </Button>
        </div>

        {completedSessions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Letzte Sessions</h3>
            <div className="space-y-3">
              {completedSessions
                .slice(-5)
                .reverse()
                .map((session) => (
                  <Card key={session.id} className="!p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">
                          {new Date(session.date).toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.exercises.length} {'\u00dc'}bungen &middot;{' '}
                          {session.participantNames.length} Teilnehmer
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {session.totalMeters.toFixed(1)} m
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.totalWorkKJ.toFixed(2)} kJ
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
