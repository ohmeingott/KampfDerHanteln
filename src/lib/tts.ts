let supported = false;

try {
  supported = 'speechSynthesis' in window;
} catch {
  supported = false;
}

export function isTTSSupported(): boolean {
  return supported;
}

export function speak(text: string): void {
  if (!supported) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!supported) return;
  window.speechSynthesis.cancel();
}
