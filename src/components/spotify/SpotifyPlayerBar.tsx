import { useEffect } from 'react';
import { useSpotifyStore } from '../../stores/spotifyStore';
import { isSpotifyConfigured } from '../../lib/spotify';

export function SpotifyPlayerBar() {
  const {
    isConnected,
    isPlayerReady,
    isPlaying,
    currentTrack,
    initPlayer,
    togglePlayback,
    skipTrack,
    playWorkoutMusic,
  } = useSpotifyStore();

  useEffect(() => {
    if (!isSpotifyConfigured || !isConnected) return;
    initPlayer();
  }, [isConnected, initPlayer]);

  useEffect(() => {
    if (isPlayerReady && isConnected) {
      playWorkoutMusic();
    }
  }, [isPlayerReady, isConnected, playWorkoutMusic]);

  if (!isSpotifyConfigured || !isConnected) return null;

  if (!isPlayerReady) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white text-center py-2 text-sm">
        Spotify wird geladen...
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur text-white px-4 py-3 flex items-center justify-between z-50">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {currentTrack?.albumArt && (
          <img
            src={currentTrack.albumArt}
            alt=""
            className="w-10 h-10 rounded flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">
            {currentTrack?.name ?? 'Kein Track'}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {currentTrack?.artist ?? ''}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={togglePlayback}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
          )}
        </button>
        <button
          onClick={skipTrack}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Nächster Track"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2l8 6-8 6V2z" />
            <rect x="12" y="2" width="2" height="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
