import { useSpotifyStore } from '../../stores/spotifyStore';
import { isSpotifyConfigured } from '../../lib/spotify';
import { Button } from '../ui/Button';

export function SpotifyConnectButton() {
  const { isConnected, connect, disconnect } = useSpotifyStore();

  if (!isSpotifyConfigured) return null;

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-green-600">Spotify verbunden</span>
        <Button variant="ghost" size="sm" onClick={disconnect}>
          Trennen
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" size="lg" onClick={connect}>
      Spotify verbinden
    </Button>
  );
}
