import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);

    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Viewport < 640px (Tailwind `sm` breakpoint). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

/** Viewport >= 1024px (Tailwind `lg` breakpoint). */
export function useIsDesktopNav(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
