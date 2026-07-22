/** Tipografías críticas (woff2 subset): body + bold en el camino crítico. */
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/700.css';

/** 500/600 tras el primer paint — no compiten con LCP de la home. */
function loadDeferredMontserratWeights() {
  void import('@fontsource/montserrat/500.css');
  void import('@fontsource/montserrat/600.css');
}

if (typeof window !== 'undefined') {
  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(loadDeferredMontserratWeights, { timeout: 3000 });
    } else {
      window.setTimeout(loadDeferredMontserratWeights, 1200);
    }
  };

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
}
