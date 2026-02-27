import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { isFirebaseConfigured } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function LoginPage() {
  const { user, login, loginDemo } = useAuthStore();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brutal-bg p-4">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-primary">Kampf</span> der Hanteln
        </h1>
        <p className="text-lg text-gray-600 mb-8 font-medium">
          Remote Training Session Manager
        </p>
        <div className="border-t-3 border-dark pt-6 space-y-3">
          {isFirebaseConfigured ? (
            <Button size="lg" onClick={login} className="w-full">
              Mit Google anmelden
            </Button>
          ) : (
            <div className="bg-secondary/20 border-brutal-thin p-4 mb-4 text-left text-sm">
              <p className="font-bold mb-1">Firebase nicht konfiguriert</p>
              <p className="text-gray-600">
                Erstelle eine <code className="bg-gray-200 px-1">.env</code> Datei
                mit deiner Firebase-Config (siehe README).
                Du kannst trotzdem den Demo-Modus nutzen.
              </p>
            </div>
          )}
          <Button
            size="lg"
            variant={isFirebaseConfigured ? 'ghost' : 'primary'}
            onClick={loginDemo}
            className="w-full"
          >
            Demo-Modus (ohne Login)
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Im Demo-Modus werden Daten lokal im Browser gespeichert.
        </p>
      </Card>
    </div>
  );
}
