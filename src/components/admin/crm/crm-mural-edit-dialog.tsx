import { useEffect, useState } from 'react';

import { CrmMuralEmojiField } from '@/components/admin/crm/crm-mural-emoji-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { muralCardDisplayTitle } from '@/lib/crm-mural-utils';
import { randomId } from '@/lib/random-id';
import type {
  CrmMuralAccountLine,
  CrmMuralCard,
  CrmMuralColumnId,
  CrmMuralFeatureItem,
  CrmMuralShipmentField,
  CrmMuralShipmentLine,
} from '@/types/crm-mural';

function parseFeatureLines(raw: string): CrmMuralFeatureItem[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({
      label: line.replace(/^[✓✅]\s*/, ''),
      highlight: line.includes('🎁') || line.toLowerCase().includes('sin costo'),
    }));
}

function parseAccountsText(raw: string): CrmMuralAccountLine[] {
  const blocks = raw.split(/\n\s*\n/).filter((b) => b.trim());
  return blocks.map((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const [bank, ...rest] = lines;
    return { bank: bank ?? 'Banco', lines: rest };
  });
}

function formatAccountsText(accounts: CrmMuralAccountLine[]): string {
  return accounts
    .map((a) => [a.bank, ...a.lines].join('\n'))
    .join('\n\n');
}

function parseShipmentFields(raw: string): CrmMuralShipmentField[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':');
      if (idx === -1) return { label: line, value: '' };
      return {
        label: line.slice(0, idx).trim(),
        value: line.slice(idx + 1).trim(),
      };
    });
}

function parseOrderLines(raw: string): CrmMuralShipmentLine[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+[—–-]\s+/);
      if (parts.length >= 2) {
        return {
          description: parts[0].trim(),
          priceLabel: parts.slice(1).join(' — ').trim(),
        };
      }
      return { description: line, priceLabel: '' };
    });
}

interface CrmMuralEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CrmMuralCard | null;
  defaultColumnId: CrmMuralColumnId;
  onSave: (card: CrmMuralCard, mode: 'create' | 'update') => void;
}

export function CrmMuralEditDialog({
  open,
  onOpenChange,
  card,
  defaultColumnId,
  onSave,
}: CrmMuralEditDialogProps) {
  const [draft, setDraft] = useState<CrmMuralCard | null>(null);
  const [textBody, setTextBody] = useState('');
  const [accountsTitle, setAccountsTitle] = useState('');
  const [accountsBody, setAccountsBody] = useState('');
  const [featuresBody, setFeaturesBody] = useState('');
  const [shippingBody, setShippingBody] = useState('');
  const [orderBody, setOrderBody] = useState('');
  const [productFooter, setProductFooter] = useState('');

  useEffect(() => {
    if (!open) return;
    const base =
      card ??
      ({
        id: randomId(),
        columnId: defaultColumnId,
        kind: 'text',
        paragraphs: [''],
      } satisfies CrmMuralCard);
    setDraft(base);
    if (base.kind === 'text') {
      setTextBody(base.paragraphs.join('\n\n'));
    } else if (base.kind === 'accounts') {
      setAccountsTitle(base.title ?? '');
      setAccountsBody(formatAccountsText(base.accounts));
    } else if (base.kind === 'product') {
      setFeaturesBody(base.features.map((f) => f.label).join('\n'));
      setProductFooter(base.footer ?? '');
    } else if (base.kind === 'equipment') {
      setFeaturesBody(base.specs.map((s) => s.label).join('\n'));
    } else if (base.kind === 'shipment') {
      setShippingBody(
        base.shippingFields.map((f) => `${f.label}: ${f.value}`).join('\n'),
      );
      setOrderBody(
        base.orderLines.map((l) => `${l.description} — ${l.priceLabel}`).join('\n'),
      );
    }
  }, [open, card, defaultColumnId]);

  const isEdit = card != null;

  const handleSubmit = () => {
    if (!draft) return;
    let saved: CrmMuralCard = draft;

    if (draft.kind === 'text') {
      const paragraphs = textBody
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      saved = { ...draft, paragraphs: paragraphs.length > 0 ? paragraphs : [''] };
    } else if (draft.kind === 'accounts') {
      const titleTrim = accountsTitle.trim();
      saved = {
        ...draft,
        accounts: parseAccountsText(accountsBody),
        ...(titleTrim ? { title: titleTrim } : {}),
      };
    } else if (draft.kind === 'product') {
      const next: typeof draft = {
        ...draft,
        features: parseFeatureLines(featuresBody),
      };
      const footer = productFooter.trim();
      if (footer) next.footer = footer;
      else delete next.footer;
      saved = next;
    } else if (draft.kind === 'equipment') {
      saved = { ...draft, specs: parseFeatureLines(featuresBody) };
    } else if (draft.kind === 'shipment') {
      saved = {
        ...draft,
        shippingFields: parseShipmentFields(shippingBody),
        orderLines: parseOrderLines(orderBody),
      };
    }

    onSave(saved, isEdit ? 'update' : 'create');
    onOpenChange(false);
  };

  const patchDraft = (partial: Partial<CrmMuralCard>) => {
    setDraft((prev) => (prev ? ({ ...prev, ...partial } as CrmMuralCard) : prev));
  };

  if (!draft) return null;

  const title = isEdit
    ? `Modificar: ${muralCardDisplayTitle(draft)}`
    : 'Nueva nota';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto text-emoji">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Escribe o inserta emoticones con el botón «Emoticones». También puedes pegarlos con
            Ctrl+V. Separa párrafos con una línea en blanco.
          </DialogDescription>
        </DialogHeader>

        {draft.kind === 'text' && (
          <CrmMuralEmojiField
            id="mural-text-body"
            label="Contenido"
            value={textBody}
            onChange={setTextBody}
            multiline
            className="min-h-[12rem]"
            placeholder={'¡Hola! 👋\n\nTu mensaje de ventas...'}
          />
        )}

        {draft.kind === 'accounts' && (
          <div className="space-y-3">
            <CrmMuralEmojiField
              id="mural-accounts-title"
              label="Título"
              value={accountsTitle}
              onChange={setAccountsTitle}
            />
            <CrmMuralEmojiField
              id="mural-accounts-body"
              label="Cuentas"
              value={accountsBody}
              onChange={setAccountsBody}
              multiline
              className="min-h-[10rem]"
              placeholder={'BCP — Soles\nCta: ...\n\nBBVA — Soles\n...'}
            />
          </div>
        )}

        {(draft.kind === 'product' || draft.kind === 'equipment') && (
          <div className="space-y-3">
            <CrmMuralEmojiField
              id="mural-item-title"
              label="Título"
              value={draft.title}
              onChange={(titleValue) => patchDraft({ title: titleValue })}
            />
            <CrmMuralEmojiField
              id="mural-item-price"
              label="Precio"
              value={draft.priceLabel}
              onChange={(priceLabel) => patchDraft({ priceLabel })}
              hint="Ej.: $900 o S/ 4,000"
            />
            <CrmMuralEmojiField
              id="mural-item-features"
              label={draft.kind === 'product' ? 'Características' : 'Especificaciones'}
              value={featuresBody}
              onChange={setFeaturesBody}
              multiline
              placeholder={'Copia\nInstalación sin costo 🎁'}
            />
            {draft.kind === 'product' && (
              <CrmMuralEmojiField
                id="mural-item-footer"
                label="Pie de nota (opcional)"
                value={productFooter}
                onChange={setProductFooter}
              />
            )}
          </div>
        )}

        {draft.kind === 'shipment' && (
          <div className="space-y-3">
            <CrmMuralEmojiField
              id="mural-ship-date"
              label="Fecha / título"
              value={draft.dateLabel}
              onChange={(dateLabel) => patchDraft({ dateLabel })}
            />
            <CrmMuralEmojiField
              id="mural-ship-fields"
              label="Datos de envío"
              value={shippingBody}
              onChange={setShippingBody}
              multiline
              className="min-h-[6rem]"
              placeholder="RUC: 20123456789"
            />
            <CrmMuralEmojiField
              id="mural-ship-order"
              label="Líneas del pedido"
              value={orderBody}
              onChange={setOrderBody}
              multiline
              placeholder="Producto — S/ 1,000"
            />
            <CrmMuralEmojiField
              id="mural-ship-total"
              label="Total"
              value={draft.totalLabel}
              onChange={(totalLabel) => patchDraft({ totalLabel })}
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {isEdit ? 'Guardar cambios' : 'Crear nota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
