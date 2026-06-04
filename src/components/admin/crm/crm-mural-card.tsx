import { useRef } from 'react';
import { ClipboardCopy, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  CrmMuralDigitDisplay,
  CrmMuralPriceBadges,
} from '@/components/admin/crm/crm-mural-digit-display';
import { CrmMuralRichText, stripMuralMarkup } from '@/components/admin/crm/crm-mural-rich-text';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  copyMuralCardToClipboard,
  CRM_MURAL_DRAG_TYPE,
  muralCardDisplayTitle,
} from '@/lib/crm-mural-utils';
import type { CrmMuralCard } from '@/types/crm-mural';
import { cn } from '@/lib/utils';

interface CrmMuralCardViewProps {
  card: CrmMuralCard;
  onEdit: (card: CrmMuralCard) => void;
  onDuplicate: (card: CrmMuralCard) => void;
  onDelete: (card: CrmMuralCard) => void;
  onDragStart?: (cardId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

function FeatureList({ items }: { items: Array<{ label: string; highlight?: boolean }> }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-2 text-xs text-foreground">
          <span className="shrink-0 text-base leading-none" aria-hidden="true">
            ✅
          </span>
          <CrmMuralRichText
            as="span"
            className={cn(item.highlight ? 'font-medium text-amber-800' : undefined)}
          >
            {item.label}
          </CrmMuralRichText>
        </li>
      ))}
    </ul>
  );
}

export function CrmMuralCardView({
  card,
  onEdit,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: CrmMuralCardViewProps) {
  const didDragRef = useRef(false);
  const displayTitle = muralCardDisplayTitle(card);

  const openEdit = () => onEdit(card);

  const handleCopy = async () => {
    try {
      await copyMuralCardToClipboard(card);
      toast.success('Copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar al portapapeles');
    }
  };

  return (
    <article
      draggable
      onDragStart={(event) => {
        didDragRef.current = true;
        event.dataTransfer.setData(CRM_MURAL_DRAG_TYPE, card.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart?.(card.id);
      }}
      onDragEnd={() => {
        onDragEnd?.();
        window.setTimeout(() => {
          didDragRef.current = false;
        }, 0);
      }}
      onClick={() => {
        if (didDragRef.current) return;
        openEdit();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openEdit();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'group cursor-pointer rounded-md border border-neutral-200/90 bg-white p-3.5 text-sm text-emoji shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-shadow',
        'hover:shadow-[0_2px_8px_rgba(0,0,0,0.14)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        card.topBorderClass && cn('border-t-[3px]', card.topBorderClass),
        isDragging && 'opacity-50 ring-2 ring-primary/30',
      )}
      aria-label={`${displayTitle}. Pulsa para editar o arrastra para mover.`}
      aria-grabbed={isDragging}
    >
      <div className="mb-1 flex items-start justify-end gap-1">
        <p className="sr-only">{displayTitle}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              aria-label={`Acciones de ${displayTitle}`}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
            <DropdownMenuItem onSelect={openEdit}>
              <Pencil className="size-4" aria-hidden="true" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void handleCopy();
              }}
            >
              <ClipboardCopy className="size-4" aria-hidden="true" />
              Copiar al portapapeles
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(card)}>
              <Copy className="size-4" aria-hidden="true" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete(card)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {card.kind === 'text' && (
        <div className="space-y-2 text-xs leading-relaxed text-foreground">
          {card.paragraphs.map((paragraph, index) => (
            <CrmMuralRichText key={index} as="p">
              {paragraph}
            </CrmMuralRichText>
          ))}
        </div>
      )}

      {card.kind === 'accounts' && (
        <div className="space-y-3 text-xs">
          {card.title != null && (
            <CrmMuralRichText as="p" className="text-[0.65rem] font-bold uppercase tracking-wide">
              {card.title}
            </CrmMuralRichText>
          )}
          {card.accounts.map((account) => (
            <div key={account.bank} className="space-y-1">
              <CrmMuralRichText as="p" className="font-semibold">
                {account.bank}
              </CrmMuralRichText>
              {account.lines.map((line) => (
                <p key={line} className="leading-relaxed">
                  <CrmMuralDigitDisplay value={line} />
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {card.kind === 'product' && (
        <>
          <CrmMuralRichText as="h3" className="text-xs font-bold uppercase tracking-wide">
            {card.title}
          </CrmMuralRichText>
          <CrmMuralPriceBadges priceLabel={stripMuralMarkup(card.priceLabel)} />
          <FeatureList items={card.features} />
          {card.footer != null && (
            <CrmMuralRichText as="p" className="mt-2 text-[0.65rem] leading-snug text-muted-foreground">
              {card.footer}
            </CrmMuralRichText>
          )}
        </>
      )}

      {card.kind === 'equipment' && (
        <>
          <CrmMuralRichText as="h3" className="text-xs font-bold uppercase tracking-wide">
            {card.title}
          </CrmMuralRichText>
          <CrmMuralPriceBadges priceLabel={stripMuralMarkup(card.priceLabel)} />
          <FeatureList items={card.specs} />
        </>
      )}

      {card.kind === 'shipment' && (
        <div className="space-y-2 text-xs">
          <CrmMuralRichText as="p" className="text-sm font-bold">
            {card.dateLabel}
          </CrmMuralRichText>
          <div className="space-y-0.5">
            {card.shippingFields.map((field) => {
              const isPedidoHeader = /pedido/i.test(field.label);
              const isSectionOnly = field.value.trim() === '';

              if (isPedidoHeader) {
                return (
                  <div key={field.label} className="pt-2">
                    <CrmMuralRichText as="p" className="font-semibold">
                      {field.label}
                    </CrmMuralRichText>
                    {card.orderLines.map((line) => (
                      <p
                        key={line.description}
                        className="flex flex-wrap items-center justify-between gap-2 leading-relaxed"
                      >
                        <span>{line.description}</span>
                        <CrmMuralDigitDisplay
                          value={line.priceLabel}
                          className="shrink-0 font-semibold"
                        />
                      </p>
                    ))}
                  </div>
                );
              }

              if (isSectionOnly) {
                return (
                  <CrmMuralRichText key={field.label} as="p" className="font-semibold">
                    {field.label}
                  </CrmMuralRichText>
                );
              }

              return (
                <p key={`${field.label}-${field.value}`} className="leading-relaxed">
                  <CrmMuralRichText as="span" className="font-semibold">
                    {field.label}
                  </CrmMuralRichText>{' '}
                  <span className="text-foreground/90">
                    <CrmMuralDigitDisplay value={field.value} />
                  </span>
                </p>
              );
            })}
          </div>
          {!card.shippingFields.some((f) => /pedido/i.test(f.label)) && card.orderLines.length > 0 && (
            <div>
              <CrmMuralRichText as="p" className="mb-1 font-semibold">
                📮 *Pedido:*
              </CrmMuralRichText>
              {card.orderLines.map((line) => (
                <p
                  key={line.description}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span>{line.description}</span>
                  <CrmMuralDigitDisplay value={line.priceLabel} className="shrink-0 font-semibold" />
                </p>
              ))}
            </div>
          )}
          <p className="border-t border-neutral-200 pt-2 font-bold text-foreground">
            <CrmMuralRichText as="span">
              {card.totalLabel}
            </CrmMuralRichText>
          </p>
        </div>
      )}
    </article>
  );
}
