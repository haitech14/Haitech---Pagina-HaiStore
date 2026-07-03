import { ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import { cn } from '@/lib/utils';

export type HeaderActionTone = 'light' | 'dark';

export function headerDarkUtilityButtonClass(): string {
  return cn(
    'relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.8125rem] font-normal text-white/90 transition-colors',
    'hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]',
  );
}

export function headerIconActionButtonClass(
  tone: HeaderActionTone,
  size: 'sm' | 'md' = 'sm',
): string {
  return cn(
    'relative inline-flex shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
    size === 'sm' ? 'size-9' : 'size-11',
    tone === 'dark'
      ? 'bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white/40'
      : 'bg-muted/80 text-foreground hover:bg-muted focus-visible:ring-ring',
  );
}

interface HeaderActionStripProps {
  cartCount: number;
  cartAriaLabel: string;
  onOpenCart: () => void;
  tone?: HeaderActionTone;
  accountTrigger?: 'icon' | 'strip' | 'labeled';
  className?: string;
}

export function HeaderActionStrip({
  cartCount,
  cartAriaLabel,
  onOpenCart,
  tone = 'light',
  accountTrigger = 'strip',
  className,
}: HeaderActionStripProps) {
  return (
    <div className={cn('hidden shrink-0 items-center gap-2 sm:flex', className)}>
      <button
        type="button"
        className={headerIconActionButtonClass(tone, 'sm')}
        aria-label={cartAriaLabel}
        onClick={onOpenCart}
      >
        <ShoppingCart className="size-4" strokeWidth={1.75} aria-hidden="true" />
        {cartCount > 0 ? (
          <Badge
            className={cn(
              'absolute -right-0.5 -top-0.5 h-3.5 min-w-3.5 justify-center px-0.5 text-[0.55rem] text-white',
              tone === 'dark' ? 'bg-white text-red-600' : 'bg-red-600 text-white',
            )}
            aria-hidden="true"
          >
            {cartCount}
          </Badge>
        ) : null}
      </button>

      <AccountDropdown triggerVariant={accountTrigger} tone={tone} />
    </div>
  );
}
