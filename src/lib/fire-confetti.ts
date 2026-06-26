import confetti from 'canvas-confetti';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Celebración breve al confirmar un pedido (respeta prefers-reduced-motion). */
export function fireCheckoutConfetti(): void {
  if (prefersReducedMotion()) return;

  const duration = 2200;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ['#dc2626', '#ef4444', '#fbbf24', '#ffffff'],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ['#dc2626', '#ef4444', '#fbbf24', '#ffffff'],
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.55 },
    colors: ['#dc2626', '#ef4444', '#fbbf24', '#ffffff'],
    disableForReducedMotion: true,
  });

  requestAnimationFrame(frame);
}
