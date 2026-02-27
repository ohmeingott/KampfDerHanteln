import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useParticipantStore } from '../stores/participantStore';
import { useSessionStore } from '../stores/sessionStore';
import { calculatePersonStats } from '../lib/streaks';
import { Topbar } from '../components/layout/Topbar';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function StatsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { people, loadPeople } = useParticipantStore();
  const { sessions, loadSessions } = useSessionStore();

  useEffect(() => {
    if (!user) return;
    loadPeople(user.uid);
    loadSessions(user.uid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const completedSessions = sessions.filter((s) => s.completed);

  const personStats = people.map((person) =>
    calculatePersonStats(person.id, person.displayName, completedSessions)
  );

  // Sort by points descending
  personStats.sort((a, b) => b.totalPoints - a.totalPoints);

  // Aggregate session stats
  const totalExercises = completedSessions.reduce((s, session) => s + session.exercises.length, 0);
  const totalMeters = completedSessions.reduce((s, session) => s + session.totalMeters, 0);
  const totalWorkKJ = completedSessions.reduce((s, session) => s + session.totalWorkKJ, 0);

  return (
    <div className="min-h-screen">
      <Topbar />
      <PageContainer>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Statistiken</h2>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Zur{'\u00fc'}ck
          </Button>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-3xl font-bold text-primary">{completedSessions.length}</div>
            <div className="text-sm text-gray-500 font-medium">Sessions</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-accent">{totalExercises}</div>
            <div className="text-sm text-gray-500 font-medium">{'\u00dc'}bungen gesamt</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-secondary">{totalMeters.toFixed(0)} m</div>
            <div className="text-sm text-gray-500 font-medium">Meter gesamt</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-primary">{totalWorkKJ.toFixed(1)} kJ</div>
            <div className="text-sm text-gray-500 font-medium">Arbeit gesamt</div>
          </Card>
        </div>

        {/* Leaderboard */}
        <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
        {personStats.length === 0 ? (
          <Card className="text-center !py-8 text-gray-400">
            <p>Noch keine Daten vorhanden.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {personStats.map((stats, rank) => (
              <Card key={stats.personId} className="!p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-10 h-10 flex items-center justify-center border-brutal-thin
                        font-bold text-lg
                        ${rank === 0 ? 'bg-secondary' : rank === 1 ? 'bg-gray-200' : rank === 2 ? 'bg-orange-200' : 'bg-white'}`}
                    >
                      {rank + 1}
                    </span>
                    <div>
                      <div className="font-bold text-lg">{stats.displayName}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {stats.totalSessions} Sessions
                        </span>
                        {stats.currentStreak > 0 && (
                          <Badge variant="streak">
                            Streak: {stats.currentStreak}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{stats.totalPoints}</div>
                    <div className="text-sm text-gray-500">Punkte</div>
                  </div>
                </div>
                {stats.longestStreak > 1 && (
                  <div className="text-xs text-gray-400 mt-2">
                    L{'\u00e4'}ngster Streak: {stats.longestStreak}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Session History */}
        {completedSessions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Session-Historie</h3>
            <div className="space-y-3">
              {completedSessions
                .slice()
                .reverse()
                .map((session) => (
                  <Card key={session.id} className="!p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">
                          {new Date(session.date).toLocaleDateString('de-DE', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {session.exercises.length} {'\u00dc'}bungen &middot;{' '}
                          {session.participantNames.join(', ')}
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
