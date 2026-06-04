import { useState } from 'react';
import { Plus } from 'lucide-react';

import { CrmMuralCardView } from '@/components/admin/crm/crm-mural-card';
import { Button } from '@/components/ui/button';
import { CRM_MURAL_DRAG_TYPE } from '@/lib/crm-mural-utils';
import type { CrmMuralCard, CrmMuralColumn, CrmMuralColumnId } from '@/types/crm-mural';
import { cn } from '@/lib/utils';

interface CrmMuralColumnProps {
  column: CrmMuralColumn;
  cards: CrmMuralCard[];
  /** Notas ancladas al pie (p. ej. número de cuenta bajo Ventas). */
  pinnedCards?: CrmMuralCard[];
  pinnedSectionLabel?: string;
  draggingCardId: string | null;
  onQuickAdd: (columnId: CrmMuralColumnId) => void;
  onMoveCard: (cardId: string, columnId: CrmMuralColumnId) => void;
  onEditCard: (card: CrmMuralCard) => void;
  onDuplicateCard: (card: CrmMuralCard) => void;
  onDeleteCard: (card: CrmMuralCard) => void;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
}

export function CrmMuralColumnView({
  column,
  cards,
  pinnedCards = [],
  pinnedSectionLabel,
  draggingCardId,
  onQuickAdd,
  onMoveCard,
  onEditCard,
  onDuplicateCard,
  onDeleteCard,
  onDragStart,
  onDragEnd,
}: CrmMuralColumnProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(CRM_MURAL_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const cardId = event.dataTransfer.getData(CRM_MURAL_DRAG_TYPE);
    if (cardId) onMoveCard(cardId, column.id);
  };

  return (
    <section
      className={cn(
        'flex w-[min(100%,17.5rem)] shrink-0 flex-col sm:w-[17.5rem]',
        dragOver && 'rounded-lg ring-2 ring-inset ring-primary/25',
      )}
      aria-label={`Columna ${column.label}`}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <header className="mb-3 text-center">
        <div className={cn('mx-auto mb-2 h-1 w-14 rounded-full', column.accentClass)} />
        <h2 className="text-sm font-bold text-foreground">
          {column.label}
          <span className="ml-1.5 font-normal text-muted-foreground">({cards.length})</span>
        </h2>
      </header>
      <div className="flex flex-col gap-3">
        {cards.map((card) => (
          <CrmMuralCardView
            key={card.id}
            card={card}
            isDragging={draggingCardId === card.id}
            onEdit={onEditCard}
            onDuplicate={onDuplicateCard}
            onDelete={onDeleteCard}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {pinnedCards.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-neutral-300/80 pt-4">
            {pinnedSectionLabel != null && (
              <p className="text-center text-xs font-bold text-foreground">{pinnedSectionLabel}</p>
            )}
            {pinnedCards.map((card) => (
              <CrmMuralCardView
                key={card.id}
                card={card}
                isDragging={draggingCardId === card.id}
                onEdit={onEditCard}
                onDuplicate={onDuplicateCard}
                onDelete={onDeleteCard}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          className="min-h-10 w-full border-dashed border-neutral-300 bg-white/60 text-xs text-muted-foreground hover:bg-white hover:text-foreground"
          onClick={() => onQuickAdd(column.id)}
        >
          <Plus className="mr-1 size-3.5" aria-hidden="true" />
          Añadir nota
        </Button>
      </div>
    </section>
  );
}
