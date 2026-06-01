import { useRef, useState, type ReactNode } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface InventoryHoverTooltipProps {
  trigger: ReactNode;
  children: ReactNode;
  /** Etiqueta accesible del disparador. */
  ariaLabel?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const CLOSE_DELAY_MS = 80;

export function InventoryHoverTooltip({
  trigger,
  children,
  ariaLabel,
  side = 'top',
  align = 'end',
  className,
}: InventoryHoverTooltipProps) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelScheduledClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  const handleOpen = () => {
    cancelScheduledClose();
    setOpen(true);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) setOpen(false);
      }}
    >
      <PopoverTrigger asChild>
        <span
          className="inline-block"
          aria-label={ariaLabel}
          onMouseEnter={handleOpen}
          onMouseLeave={scheduleClose}
          onFocus={handleOpen}
          onBlur={scheduleClose}
          onClick={(event) => event.preventDefault()}
        >
          {trigger}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={6}
        className={cn(
          'w-max max-w-[min(100vw-2rem,20rem)] border-border p-0 shadow-md',
          className,
        )}
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
