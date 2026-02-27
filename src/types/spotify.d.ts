declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: (() => void) | undefined;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: 'ready', cb: (data: { device_id: string }) => void): void;
  addListener(event: 'not_ready', cb: (data: { device_id: string }) => void): void;
  addListener(event: 'player_state_changed', cb: (state: SpotifyPlaybackState | null) => void): void;
  addListener(event: 'initialization_error', cb: (data: { message: string }) => void): void;
  addListener(event: 'authentication_error', cb: (data: { message: string }) => void): void;
  addListener(event: 'account_error', cb: (data: { message: string }) => void): void;
  removeListener(event: string): void;
  togglePlay(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getCurrentState(): Promise<SpotifyPlaybackState | null>;
}

interface SpotifyPlaybackState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: {
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album: {
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
      };
    };
    next_tracks: Array<{ id: string; name: string }>;
  };
}

export {};
