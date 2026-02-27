import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

export function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b-3 border-dark px-6 py-4 flex items-center justify-between">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <img src="/hantel-logo.png" alt="" className="h-9" />
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Kampf</span> der Hanteln
        </h1>
      </div>
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
