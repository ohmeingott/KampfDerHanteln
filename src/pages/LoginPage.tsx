import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function LoginPage() {
  const { login } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-brutal-bg p-4">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-primary">Kampf</span> der Hanteln
        </h1>
        <p className="text-lg text-gray-600 mb-8 font-medium">
          Remote Training Session Manager
        </p>
        <div className="border-t-3 border-dark pt-6">
          <Button size="lg" onClick={login} className="w-full">
            Mit Google anmelden
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Melde dich an, um deine Trainingsgruppe zu verwalten.
        </p>
      </Card>
    </div>
  );
}
