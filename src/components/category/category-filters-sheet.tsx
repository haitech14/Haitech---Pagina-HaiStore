import type { ReactNode } from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type CategoryFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

/** Sheet de filtros montado bajo demanda (fuera del chunk inicial del grid). */
export function CategoryFiltersSheet({
  open,
  onOpenChange,
  children,
}: CategoryFiltersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full max-w-sm flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
