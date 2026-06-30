import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CheckoutMobileActionBarProps {
  children: ReactNode;
  className?: string;
}

/** Barra fija inferior para CTAs de checkout en móvil (sin bottom nav). */
export function CheckoutMobileActionBar({ children, className }: CheckoutMobileActionBarProps) {
  return (
    <>
      <div className="h-[5.5rem] sm:hidden" aria-hidden="true" />
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-4px_20px_rgba(15,23,42,0.1)] backdrop-blur-sm sm:hidden',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
}
