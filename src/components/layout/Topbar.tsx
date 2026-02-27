import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

export function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b-3 border-dark px-6 py-4 flex items-center justify-between">
      <h1
        className="text-2xl font-bold tracking-tight cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <span className="text-primary">Kampf</span> der Hanteln
      </h1>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:block">
            {user.displayName || user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
