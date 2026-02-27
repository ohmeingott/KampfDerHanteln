const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/callback/spotify`;

export const isSpotifyConfigured = Boolean(SPOTIFY_CLIENT_ID);

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ');

const TOKEN_KEY = 'kdh_spotify_tokens';
const VERIFIER_KEY = 'kdh_spotify_pkce_verifier';

// --- PKCE helpers ---

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
}

function base64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// --- Token types ---

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// --- Public API ---

export async function redirectToSpotifyAuth(): Promise<void> {
  if (!isSpotifyConfigured) return;

  const verifier = randomString(64);
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const challenge = base64Url(await sha256(verifier));

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error('No PKCE verifier found');
  sessionStorage.removeItem(VERIFIER_KEY);

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) throw new Error('Token exchange failed');
  const data = await res.json();

  const tokens: SpotifyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  return tokens;
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error('Token refresh failed');
  const data = await res.json();

  const tokens: SpotifyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  return tokens;
}

export function getStoredTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function loadSpotifySDKScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('spotify-sdk')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'spotify-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load Spotify SDK'));
    document.head.appendChild(script);
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
  });
}
