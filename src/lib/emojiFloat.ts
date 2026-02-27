const EMOJIS = ['\uD83D\uDCAA', '\uD83C\uDFCB\uFE0F'];

/**
 * Spawns floating emojis that rise from a click position to the top of the screen.
 */
export function spawnEmojiFloat(event: { currentTarget: HTMLElement }) {
  const btn = event.currentTarget;
  const rect = btn.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top;
  const count = 5 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    el.style.cssText = `
      position: fixed;
      left: ${startX + (Math.random() - 0.5) * 80}px;
      top: ${startY}px;
      font-size: ${24 + Math.random() * 20}px;
      pointer-events: none;
      z-index: 9999;
      opacity: 1;
      transition: none;
    `;
    document.body.appendChild(el);

    const drift = (Math.random() - 0.5) * 120;
    const duration = 1200 + Math.random() * 800;
    const delay = i * 80;

    setTimeout(() => {
      el.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      el.style.top = `-60px`;
      el.style.left = `${parseFloat(el.style.left) + drift}px`;
      el.style.opacity = '0';
      el.style.transform = `scale(${0.6 + Math.random() * 0.5}) rotate(${(Math.random() - 0.5) * 40}deg)`;
    }, delay + 10);

    setTimeout(() => el.remove(), delay + duration + 50);
  }
}
