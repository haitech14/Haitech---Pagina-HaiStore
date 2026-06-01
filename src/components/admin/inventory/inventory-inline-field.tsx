import type { KeyboardEvent, ReactNode } from 'react';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InventoryInlineFieldProps {
  fieldId: string;
  activeFieldId: string | null;
  onActivate: () => void;
  onClose: () => void;
  display: ReactNode;
  edit: ReactNode;
  className?: string;
  align?: 'start' | 'end';
}

export function InventoryInlineField({
  fieldId,
  activeFieldId,
  onActivate,
  onClose: _onClose,
  display,
  edit,
  className,
  align = 'start',
}: InventoryInlineFieldProps) {
  const isEditing = activeFieldId === fieldId;

  const handleDisplayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    <div
      className={cn(
        'group relative min-h-9 min-w-0',
        align === 'end' ? 'pr-7 text-right' : 'pr-7',
        className,
      )}
    >
      {isEditing ? (
        <div className={cn(align === 'end' && 'flex justify-end')}>{edit}</div>
      ) : (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={onActivate}
            onKeyDown={handleDisplayKeyDown}
            className={cn(
              'min-h-9 cursor-pointer rounded-sm outline-none',
              'hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring',
              align === 'end' && 'flex justify-end',
            )}
            aria-label="Editar campo"
          >
            {display}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className={cn(
              'absolute top-1/2 z-10 size-6 min-h-6 min-w-6 -translate-y-1/2 shadow-sm',
              'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
              align === 'end' ? 'right-0' : 'right-0',
            )}
            onClick={(event) => {
              event.stopPropagation();
              onActivate();
            }}
            aria-label="Editar campo"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
        </>
      )}
    </div>
  );
}
