import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSpotifyStore } from '../stores/spotifyStore';

export function SpotifyCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback } = useSpotifyStore();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      console.warn('Spotify auth failed:', error);
      navigate('/dashboard', { replace: true });
      return;
    }

    handleCallback(code)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err) => {
        console.warn('Spotify token exchange failed:', err);
        navigate('/dashboard', { replace: true });
      });
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl font-bold text-gray-400">Spotify wird verbunden...</div>
    </div>
  );
}
