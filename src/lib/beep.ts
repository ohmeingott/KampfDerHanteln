let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function beepCountdown() {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.frequency.value = 880;
  gain.gain.value = 0.3;
  osc.start();
  osc.stop(c.currentTime + 0.15);
}

export function beepGo() {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.frequency.value = 1320;
  gain.gain.value = 0.4;
  osc.start();
  osc.stop(c.currentTime + 0.3);
}

export function beepEnd() {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.frequency.value = 520;
  gain.gain.value = 0.3;
  osc.start();
  osc.stop(c.currentTime + 0.25);
}