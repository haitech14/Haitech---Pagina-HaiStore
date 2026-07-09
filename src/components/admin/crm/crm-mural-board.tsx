import { useCallback, useEffect, useMemo, useState } from 'react';

import { CrmMuralColumnView } from '@/components/admin/crm/crm-mural-column';
import { CrmMuralEditDialog } from '@/components/admin/crm/crm-mural-edit-dialog';
import { CrmMuralSidebar } from '@/components/admin/crm/crm-mural-sidebar';
import { CrmMuralToolbar } from '@/components/admin/crm/crm-mural-toolbar';
import { CRM_MURAL_COLUMNS, CRM_MURAL_PINNED_ACCOUNTS_LABEL } from '@/data/crm-mural-mock';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { buildMuralCardsWithCompany } from '@/lib/crm-mural-company';
import {
  createEmptyMuralTextCard,
  duplicateMuralCard,
  groupMuralCardsByColumn,
  muralBoardCardsForColumn,
  muralPinnedAccountCards,
} from '@/lib/crm-mural-utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { CrmMuralCard, CrmMuralColumnId } from '@/types/crm-mural';

const MURAL_ZOOM = 0.7;

export function CrmMuralBoard() {
  const { data: companySettings } = useCompanySettings();
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;

  const [cards, setCards] = useState<CrmMuralCard[]>(() => buildMuralCardsWithCompany(company));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogColumnId, setDialogColumnId] = useState<CrmMuralColumnId>('ventas');
  const [editingCard, setEditingCard] = useState<CrmMuralCard | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  useEffect(() => {
    const accountsCard = buildMuralCardsWithCompany(company).find((card) => card.kind === 'accounts');
    if (!accountsCard || accountsCard.kind !== 'accounts') return;
    setCards((prev) => {
      const hasAccounts = prev.some((card) => card.kind === 'accounts');
      if (!hasAccounts) return [...prev, accountsCard];
      return prev.map((card) => (card.kind === 'accounts' ? accountsCard : card));
    });
  }, [company.bankAccountsText, company.legalName]);

  const cardsByColumn = useMemo(() => groupMuralCardsByColumn(cards), [cards]);

  const openEdit = useCallback((card: CrmMuralCard) => {
    setEditingCard(card);
    setDialogColumnId(card.columnId);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback((card: CrmMuralCard, mode: 'create' | 'update') => {
    setCards((prev) =>
      mode === 'update'
        ? prev.map((item) => (item.id === card.id ? card : item))
        : [...prev, card],
    );
    setEditingCard(null);
  }, []);

  const handleDuplicate = useCallback((card: CrmMuralCard) => {
    setCards((prev) => [...prev, duplicateMuralCard(card)]);
  }, []);

  const handleDelete = useCallback((card: CrmMuralCard) => {
    setCards((prev) => prev.filter((item) => item.id !== card.id));
  }, []);

  const moveCard = useCallback((cardId: string, columnId: CrmMuralColumnId) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId && card.columnId !== columnId
          ? { ...card, columnId }
          : card,
      ),
    );
  }, []);

  const handleQuickAdd = useCallback(
    (columnId: CrmMuralColumnId) => {
      const newCard = createEmptyMuralTextCard(columnId);
      setCards((prev) => [...prev, newCard]);
      openEdit(newCard);
    },
    [openEdit],
  );

  return (
    <div className="-mx-4 -mb-6 flex min-h-[calc(100dvh-4rem)] flex-col bg-neutral-100 sm:-mx-6">
      <div className="shrink-0 border-b border-neutral-200/80 bg-white px-4 py-2 sm:px-6">
        <CrmMuralToolbar zoomPercent={Math.round(MURAL_ZOOM * 100)} />
      </div>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
        <CrmMuralSidebar />
        <div
          className="mural-canvas-dots min-h-0 flex-1 overflow-auto p-4 sm:p-6"
          role="region"
          aria-label="Mural colaborativo NBN Tecnología"
        >
          <div
            className="origin-top-left"
            style={{
              zoom: MURAL_ZOOM,
            }}
          >
            <div className="flex min-w-max gap-5 pb-4">
              {CRM_MURAL_COLUMNS.map((column) => {
                const isVentas = column.id === 'ventas';
                const pinned = isVentas ? muralPinnedAccountCards(cardsByColumn) : [];

                return (
                  <CrmMuralColumnView
                    key={column.id}
                    column={column}
                    cards={muralBoardCardsForColumn(cardsByColumn, column.id)}
                    pinnedCards={pinned}
                    {...(isVentas
                      ? { pinnedSectionLabel: CRM_MURAL_PINNED_ACCOUNTS_LABEL }
                      : {})}
                    draggingCardId={draggingCardId}
                    onQuickAdd={handleQuickAdd}
                    onMoveCard={moveCard}
                    onEditCard={openEdit}
                    onDuplicateCard={handleDuplicate}
                    onDeleteCard={handleDelete}
                    onDragStart={setDraggingCardId}
                    onDragEnd={() => setDraggingCardId(null)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <CrmMuralEditDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCard(null);
        }}
        card={editingCard}
        defaultColumnId={dialogColumnId}
        onSave={handleSave}
      />
    </div>
  );
}
