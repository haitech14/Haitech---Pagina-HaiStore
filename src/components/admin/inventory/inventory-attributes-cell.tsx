import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import {
  areAttributesEqual,
  formatAttributeLabel,
  normalizeAttributes,
} from '@/lib/inventory-attributes';
import { cn } from '@/lib/utils';
import type { ProductAttribute } from '@/types/product';

import { InventoryAttributesEditor } from './inventory-attributes-editor';

interface InventoryAttributesCellProps {
  attributes: ProductAttribute[];
  onSave: (attributes: ProductAttribute[]) => void | Promise<void>;
  /** Catálogo de nombres compartido desde el panel (evita escanear todo el inventario por celda). */
  nameOptions?: string[];
  /** Productos del inventario solo para opciones de valor al abrir el editor. */
  catalogProducts?: readonly { attributes?: ProductAttribute[] }[];
}

const VISIBLE_COUNT = 2;
const TEXT_SAVE_MS = 350;

function isSelectPortalTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest('[data-radix-select-content]') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      target.closest('[role="listbox"]'),
  );
}

function AttributesPreview({ attributes }: { attributes: ProductAttribute[] }) {
  if (attributes.length === 0) {
    return <span className="text-xs text-muted-foreground">Sin atributos</span>;
  }

  const visible = attributes.slice(0, VISIBLE_COUNT);
  const rest = attributes.length - visible.length;

  return (
    <div className="flex w-full min-w-0 max-w-[11rem] flex-col gap-0.5">
      {visible.map((attribute) => {
        const label = formatAttributeLabel(attribute);
        return (
          <Badge
            key={attribute.id}
            variant="outline"
            className="h-5 max-w-full justify-start truncate px-1.5 text-[0.625rem] font-normal"
            title={label}
          >
            <span className="truncate">{label}</span>
          </Badge>
        );
      })}
      {rest > 0 && (
        <span className="text-[0.65rem] text-muted-foreground">+{rest} más</span>
      )}
    </div>
  );
}

export function InventoryAttributesCell({
  attributes,
  onSave,
  nameOptions: sharedNameOptions,
  catalogProducts = [],
}: InventoryAttributesCellProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(attributes);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const saveTimerRef = useRef<number | null>(null);
  const savedTimerRef = useRef<number | null>(null);
  const draftRef = useRef(draft);
  const wasOpenRef = useRef(false);
  const lastSavedRef = useRef(normalizeAttributes(attributes));
  const pendingSaveRef = useRef<ProductAttribute[] | null>(null);
  const savingRef = useRef(false);

  const normalized = useMemo(() => normalizeAttributes(attributes), [attributes]);

  const displayAttributes = useMemo(
    () => (open ? normalizeAttributes(draft) : normalized),
    [open, draft, normalized],
  );

  const nameOptions = useMemo(() => sharedNameOptions ?? [], [sharedNameOptions]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    lastSavedRef.current = normalized;
  }, [normalized]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(normalized);
    }
    wasOpenRef.current = open;
  }, [open, normalized]);

  useEffect(() => {
    if (!open) setDraft(normalized);
  }, [normalized, open]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
    };
  }, []);

  const persist = useCallback(
    async (next: ProductAttribute[]) => {
      pendingSaveRef.current = next;
      if (savingRef.current) return;

      savingRef.current = true;
      setSaveState('saving');
      let didSave = false;
      try {
        while (pendingSaveRef.current) {
          const candidate = normalizeAttributes(pendingSaveRef.current);
          pendingSaveRef.current = null;

          // Filas vacías (recién agregadas) no deben disparar PATCH que pise un guardado válido.
          if (areAttributesEqual(candidate, lastSavedRef.current)) {
            continue;
          }

          await onSave(candidate);
          lastSavedRef.current = candidate;
          didSave = true;
        }
        if (didSave) {
          setSaveState('saved');
          if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
          savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 1500);
        } else {
          setSaveState('idle');
        }
      } catch {
        setSaveState('error');
      } finally {
        savingRef.current = false;
        if (pendingSaveRef.current) {
          void persist(pendingSaveRef.current);
        }
      }
    },
    [onSave],
  );

  const scheduleSave = useCallback(
    (next: ProductAttribute[], immediate = false) => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      if (immediate) {
        void persist(next);
        return;
      }
      saveTimerRef.current = window.setTimeout(() => {
        void persist(next);
      }, TEXT_SAVE_MS);
    },
    [persist],
  );

  const handleDraftChange = (next: ProductAttribute[], immediate = false) => {
    setDraft(next);
    scheduleSave(next, immediate);
  };

  const flushSave = useCallback(async () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    await persist(draftRef.current);
  }, [persist]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && open) {
      void flushSave();
    }
    setOpen(nextOpen);
  };

  const preventSelectDismiss = (event: Event) => {
    if (isSelectPortalTarget(event.target)) {
      event.preventDefault();
    }
  };

  const saveHint =
    saveState === 'saving'
      ? 'Guardando…'
      : saveState === 'saved'
        ? 'Guardado'
        : saveState === 'error'
          ? 'Error al guardar'
          : null;

  return (
    <div className="group flex min-h-9 w-full min-w-0 max-w-[12rem] items-center gap-1">
      <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
        <PopoverAnchor asChild>
          <button
            type="button"
            className={cn(
              'min-h-9 min-w-0 flex-1 cursor-pointer rounded-sm text-left outline-none',
              'hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring',
            )}
            onClick={() => setOpen(true)}
            aria-label="Editar atributos"
          >
            <AttributesPreview attributes={displayAttributes} />
          </button>
        </PopoverAnchor>
        <PopoverContent
          className="z-[200] w-[min(100vw-2rem,22rem)] p-3"
          align="start"
          side="bottom"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerDownOutside={preventSelectDismiss}
          onFocusOutside={preventSelectDismiss}
          onInteractOutside={preventSelectDismiss}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Atributos del producto</p>
            {saveHint ? (
              <span
                className={cn(
                  'text-[0.65rem] font-medium',
                  saveState === 'error' ? 'text-destructive' : 'text-muted-foreground',
                )}
                role="status"
                aria-live="polite"
              >
                {saveHint}
              </span>
            ) : null}
          </div>
          <InventoryAttributesEditor
            attributes={draft}
            onChange={handleDraftChange}
            nameOptions={nameOptions}
            products={open ? catalogProducts : []}
            idPrefix="table-attr"
          />
          <div className="mt-3 flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-7 shrink-0 shadow-sm opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        onClick={() => setOpen(true)}
        aria-label="Editar atributos"
      >
        <Pencil className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
