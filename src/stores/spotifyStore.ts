import { create } from 'zustand';
import {
  isSpotifyConfigured,
  redirectToSpotifyAuth,
  exchangeCodeForTokens,
  refreshAccessToken,
  getStoredTokens,
  clearStoredTokens,
  loadSpotifySDKScript,
  type SpotifyTokens,
} from '../lib/spotify';

interface TrackInfo {
  name: string;
  artist: string;
  albumArt: string;
}

interface SpotifyState {
  isConnected: boolean;
  isPlayerReady: boolean;
  deviceId: string | null;
  tokens: SpotifyTokens | null;
  isPlaying: boolean;
  currentTrack: TrackInfo | null;

  connect: () => Promise<void>;
  handleCallback: (code: string) => Promise<void>;
  disconnect: () => void;
  initPlayer: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  skipTrack: () => Promise<void>;
  startPlayback: (contextUri?: string) => Promise<void>;
  playWorkoutMusic: () => Promise<void>;
  duck: () => void;
  unduck: () => void;

  _player: SpotifyPlayer | null;
  _getValidToken: () => Promise<string>;
}

function initFromStorage(): { isConnected: boolean; tokens: SpotifyTokens | null } {
  const stored = getStoredTokens();
  if (stored && stored.expiresAt > Date.now()) {
    return { isConnected: true, tokens: stored };
  }
  return { isConnected: false, tokens: null };
}

export const useSpotifyStore = create<SpotifyState>((set, get) => ({
  ...initFromStorage(),
  isPlayerReady: false,
  deviceId: null,
  isPlaying: false,
  currentTrack: null,
  _player: null,

  _getValidToken: async () => {
    const { tokens } = get();
    if (!tokens) throw new Error('No Spotify tokens');

    if (tokens.expiresAt - Date.now() < 5 * 60 * 1000) {
      try {
        const fresh = await refreshAccessToken(tokens.refreshToken);
        set({ tokens: fresh });
        return fresh.accessToken;
      } catch {
        set({ isConnected: false, tokens: null });
        clearStoredTokens();
        throw new Error('Token refresh failed');
      }
    }
    return tokens.accessToken;
  },

  connect: async () => {
    if (!isSpotifyConfigured) return;
    await redirectToSpotifyAuth();
  },

  handleCallback: async (code: string) => {
    const tokens = await exchangeCodeForTokens(code);
    set({ isConnected: true, tokens });
  },

  disconnect: () => {
    const { _player } = get();
    if (_player) _player.disconnect();
    clearStoredTokens();
    set({
      isConnected: false,
      isPlayerReady: false,
      deviceId: null,
      tokens: null,
      isPlaying: false,
      currentTrack: null,
      _player: null,
    });
  },

  initPlayer: async () => {
    const { tokens, _player } = get();
    if (!isSpotifyConfigured || !tokens || _player) return;

    await loadSpotifySDKScript();

    const player = new window.Spotify.Player({
      name: 'Kampf der Hanteln',
      getOAuthToken: async (cb) => {
        try {
          const token = await get()._getValidToken();
          cb(token);
        } catch {
          console.warn('Spotify: token unavailable');
        }
      },
      volume: 0.5,
    });

    player.addListener('ready', ({ device_id }) => {
      set({ isPlayerReady: true, deviceId: device_id });
    });

    player.addListener('not_ready', () => {
      set({ isPlayerReady: false, deviceId: null });
    });

    player.addListener('player_state_changed', (state) => {
      if (!state) {
        set({ isPlaying: false, currentTrack: null });
        return;
      }
      const track = state.track_window.current_track;
      set({
        isPlaying: !state.paused,
        currentTrack: {
          name: track.name,
          artist: track.artists.map((a) => a.name).join(', '),
          albumArt: track.album.images[0]?.url ?? '',
        },
      });
    });

    player.addListener('authentication_error', () => {
      console.warn('Spotify: auth error');
      get().disconnect();
    });

    player.addListener('initialization_error', ({ message }) => {
      console.warn('Spotify: init error', message);
    });

    player.addListener('account_error', ({ message }) => {
      console.warn('Spotify: account error (Premium required?)', message);
    });

    await player.connect();
    set({ _player: player });
  },

  togglePlayback: async () => {
    const { _player } = get();
    if (_player) await _player.togglePlay();
  },

  skipTrack: async () => {
    const { _player } = get();
    if (_player) await _player.nextTrack();
  },

  duck: () => {
    const { _player } = get();
    if (_player) _player.setVolume(0.1);
  },

  unduck: () => {
    const { _player } = get();
    if (_player) _player.setVolume(0.5);
  },

  startPlayback: async (contextUri?: string) => {
    const { deviceId } = get();
    if (!deviceId) return;
    try {
      const token = await get()._getValidToken();
      const body = contextUri ? JSON.stringify({ context_uri: contextUri }) : undefined;
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });
    } catch (err) {
      console.warn('Spotify: failed to start playback', err);
    }
  },

  playWorkoutMusic: async () => {
    const { deviceId } = get();
    if (!deviceId) return;
    try {
      const token = await get()._getValidToken();

      // Try workout category playlists first
      let playlistUri: string | null = null;
      try {
        const catRes = await fetch(
          'https://api.spotify.com/v1/browse/categories/workout/playlists?limit=1',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (catRes.ok) {
          const catData = await catRes.json();
          const first = catData?.playlists?.items?.[0];
          if (first) playlistUri = first.uri;
        }
      } catch { /* fall through to search */ }

      // Fallback: search for "Workout" playlist
      if (!playlistUri) {
        const searchRes = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent('workout music')}&type=playlist&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const first = searchData?.playlists?.items?.[0];
          if (first) playlistUri = first.uri;
        }
      }

      if (playlistUri) {
        await get().startPlayback(playlistUri);
      } else {
        // Last resort: just resume whatever was playing
        await get().startPlayback();
      }
    } catch (err) {
      console.warn('Spotify: failed to play workout music', err);
    }
  },
}));
