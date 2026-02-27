import { useSpotifyStore } from '../stores/spotifyStore';

let supported = false;

try {
  supported = 'speechSynthesis' in window;
} catch {
  supported = false;
}

export function isTTSSupported(): boolean {
  return supported;
}

let activeCount = 0;

function duckSpotify() {
  activeCount++;
  if (activeCount === 1) useSpotifyStore.getState().duck();
}

function unduckSpotify() {
  activeCount = Math.max(0, activeCount - 1);
  if (activeCount === 0) useSpotifyStore.getState().unduck();
}

export function speak(text: string): void {
  if (!supported) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 1;
  utterance.pitch = 1;
  duckSpotify();
  utterance.onend = () => unduckSpotify();
  utterance.onerror = () => unduckSpotify();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!supported) return;
  window.speechSynthesis.cancel();
  activeCount = 0;
  useSpotifyStore.getState().unduck();
}
