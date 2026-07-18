import { useState } from 'react';
import { Wrench } from 'lucide-react';

import { headerDarkUtilityButtonClass } from '@/components/layout/header-action-strip';
import { TechnicalServiceRequestDialog } from '@/components/layout/technical-service-request-dialog';
import { cn } from '@/lib/utils';

type HeaderSupportButtonProps = {
  className?: string;
  showLabel?: boolean;
  /** Estilo compacto (móvil) o apilado como Atención al cliente. */
  variant?: 'compact' | 'stacked';
};

export function HeaderSupportButton({
  className,
  showLabel = true,
  variant = 'stacked',
}: HeaderSupportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          headerDarkUtilityButtonClass(),
          variant === 'stacked' ? 'h-auto items-center gap-1.5 py-1.5' : 'gap-2 px-2.5',
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Soporte: agendar servicio técnico"
        onClick={() => setOpen(true)}
      >
        <Wrench className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        {showLabel ? (
          variant === 'stacked' ? (
            <span className="flex flex-col gap-0 text-left text-[0.6875rem] leading-none">
              <span className="font-semibold">Soporte</span>
              <span className="mt-0.5 max-w-[7.5rem] truncate font-normal text-white/75">
                Agendar servicio
              </span>
            </span>
          ) : (
            'Soporte'
          )
        ) : (
          <span className="sr-only">Soporte técnico</span>
        )}
      </button>

      <TechnicalServiceRequestDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
