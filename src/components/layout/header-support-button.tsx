import { useState } from 'react';
import { Headphones } from 'lucide-react';

import { headerDarkUtilityButtonClass } from '@/components/layout/header-action-strip';
import { TechnicalServiceRequestDialog } from '@/components/layout/technical-service-request-dialog';
import { cn } from '@/lib/utils';

type HeaderSupportButtonProps = {
  className?: string;
  showLabel?: boolean;
};

export function HeaderSupportButton({ className, showLabel = true }: HeaderSupportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(headerDarkUtilityButtonClass(), 'gap-2 px-2.5', className)}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Headphones className="size-4" strokeWidth={1.75} aria-hidden="true" />
        {showLabel ? 'Soporte' : <span className="sr-only">Soporte técnico</span>}
      </button>

      <TechnicalServiceRequestDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
