import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CheckoutMobileActionBarProps {
  children: ReactNode;
  className?: string;
}

/** Barra fija inferior para CTAs de checkout en móvil (sin bottom nav). */
export function CheckoutMobileActionBar({ children, className }: CheckoutMobileActionBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [spacerPx, setSpacerPx] = useState(88);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const update = () => {
      setSpacerPx(Math.ceil(bar.getBoundingClientRect().height));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <>
      <div className="sm:hidden" style={{ height: spacerPx }} aria-hidden="true" />
      <div
        ref={barRef}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 shadow-[0_-4px_20px_rgba(15,23,42,0.1)] backdrop-blur-sm sm:hidden',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
}
