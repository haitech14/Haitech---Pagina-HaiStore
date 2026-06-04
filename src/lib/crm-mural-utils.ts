import { CRM_MURAL_COLUMNS } from '@/data/crm-mural-mock';
import type { CrmMuralCard, CrmMuralColumnId } from '@/types/crm-mural';

export const CRM_MURAL_DRAG_TYPE = 'application/x-haistore-crm-mural-card-id';

/** Columnas visibles en el lienzo (cuentas va anclada bajo Ventas). */
export const CRM_MURAL_BOARD_COLUMN_IDS = CRM_MURAL_COLUMNS.map((c) => c.id);

export function muralCardDisplayTitle(card: CrmMuralCard): string {
  switch (card.kind) {
    case 'text':
      return card.paragraphs[0]?.slice(0, 48) || 'Nota de texto';
    case 'accounts':
      return card.title ?? 'Número de cuenta';
    case 'product':
    case 'equipment':
      return card.title;
    case 'shipment':
      return card.dateLabel;
    default: {
      const _exhaustive: never = card;
      return _exhaustive;
    }
  }
}

export function muralCardToPlainText(card: CrmMuralCard): string {
  switch (card.kind) {
    case 'text':
      return card.paragraphs.join('\n\n');
    case 'accounts': {
      const blocks: string[] = [];
      if (card.title) blocks.push(card.title);
      for (const account of card.accounts) {
        blocks.push(account.bank, ...account.lines);
      }
      return blocks.join('\n');
    }
    case 'product': {
      const lines = [
        card.title,
        card.priceLabel,
        '',
        ...card.features.map((f) => `✅ ${f.label}`),
      ];
      if (card.footer) lines.push('', card.footer);
      return lines.join('\n');
    }
    case 'equipment':
      return [
        card.title,
        card.priceLabel,
        '',
        ...card.specs.map((s) => `✅ ${s.label}`),
      ].join('\n');
    case 'shipment': {
      const lines = [card.dateLabel, '', 'DATOS DE ENVÍO'];
      for (const field of card.shippingFields) {
        lines.push(`${field.label}: ${field.value}`);
      }
      lines.push('', 'PEDIDO');
      for (const line of card.orderLines) {
        lines.push(`${line.description} — ${line.priceLabel}`);
      }
      lines.push('', card.totalLabel);
      return lines.join('\n');
    }
    default: {
      const _exhaustive: never = card;
      return _exhaustive;
    }
  }
}

export async function copyMuralCardToClipboard(card: CrmMuralCard): Promise<void> {
  await navigator.clipboard.writeText(muralCardToPlainText(card));
}

export function duplicateMuralCard(card: CrmMuralCard): CrmMuralCard {
  return { ...card, id: crypto.randomUUID() };
}

export function createEmptyMuralTextCard(columnId: CrmMuralColumnId): CrmMuralCard {
  return {
    id: crypto.randomUUID(),
    columnId,
    kind: 'text',
    paragraphs: [''],
  };
}

export function groupMuralCardsByColumn(
  cards: CrmMuralCard[],
): Record<CrmMuralColumnId, CrmMuralCard[]> {
  const map = {} as Record<CrmMuralColumnId, CrmMuralCard[]>;
  for (const card of cards) {
    if (!map[card.columnId]) map[card.columnId] = [];
    map[card.columnId].push(card);
  }
  return map;
}

export function muralBoardCardsForColumn(
  cardsByColumn: Record<CrmMuralColumnId, CrmMuralCard[]>,
  columnId: CrmMuralColumnId,
): CrmMuralCard[] {
  return cardsByColumn[columnId] ?? [];
}

/** Tarjetas de «Número de cuenta» bajo la columna Ventas. */
export function muralPinnedAccountCards(
  cardsByColumn: Record<CrmMuralColumnId, CrmMuralCard[]>,
): CrmMuralCard[] {
  return cardsByColumn.cuentas ?? [];
}
