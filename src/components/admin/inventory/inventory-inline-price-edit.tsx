import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent } from 'react';

import { Input } from '@/components/ui/input';
import { penCharmToUsd, roundPenCharm99, usdToPenCharm, usdToPenPrecise } from '@/lib/pen-pricing';
import { cn } from '@/lib/utils';
import type { DisplayCurrency, DualPriceOrder } from '@/types/display-currency';

/** Debounce corto: conversión inmediata en UI; PATCH agrupado. */
const SAVE_DEBOUNCE_MS = 120;

export type InlinePricePrimaryCurrency = 'USD' | 'PEN';

interface InventoryInlinePriceEditProps {
  usd: number;
  exchangeRate: number;
  ariaLabel: string;
  onSave: (usd: number) => void | Promise<void>;
  onClose?: () => void;
  className?: string;
  /** Precio de compra: sin redondeo comercial en soles. */
  useCharm?: boolean;
  /** Moneda del selector global: ordena y enfoca el primer campo. */
  displayCurrency?: DisplayCurrency;
  dualPriceOrder?: DualPriceOrder;
}

function resolvePrimaryCurrency(
  displayCurrency: DisplayCurrency | undefined,
  dualPriceOrder: DualPriceOrder | undefined,
): InlinePricePrimaryCurrency {
  if (displayCurrency === 'PEN') return 'PEN';
  if (displayCurrency === 'USD') return 'USD';
  return dualPriceOrder === 'usd-pen' ? 'USD' : 'PEN';
}

function parseNumericInput(raw: string): number | null {
  const normalized = raw.trim().replace(/,/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function formatPenDraft(pen: number): string {
  if (!Number.isFinite(pen) || pen <= 0) return '';
  const rounded = Math.round(pen * 100) / 100;
  return String(rounded);
}

function formatUsdDraft(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return '';
  const rounded = Math.round(usd * 100) / 100;
  return String(rounded);
}

export function InventoryInlinePriceEdit({
  usd,
  exchangeRate,
  ariaLabel,
  onSave,
  onClose,
  className,
  useCharm = true,
  displayCurrency,
  dualPriceOrder,
}: InventoryInlinePriceEditProps) {
  const usdId = useId();
  const penId = useId();
  const primaryCurrency = resolvePrimaryCurrency(displayCurrency, dualPriceOrder);
  const penFirst = primaryCurrency === 'PEN';

  const penFromUsd = useCharm
    ? usdToPenCharm(usd, exchangeRate)
    : usdToPenPrecise(usd, exchangeRate);
  const [usdDraft, setUsdDraft] = useState(usd > 0 ? formatUsdDraft(usd) : '');
  const [penDraft, setPenDraft] = useState(penFromUsd > 0 ? formatPenDraft(penFromUsd) : '');
  const [isSaving, setIsSaving] = useState(false);

  const usdDraftRef = useRef(usdDraft);
  const penDraftRef = useRef(penDraft);
  const onSaveRef = useRef(onSave);
  const isDirtyRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const savingRef = useRef(false);
  const persistQueuedRef = useRef(false);
  const pendingCloseRef = useRef(false);
  const lastCommittedUsdRef = useRef(usd);

  onSaveRef.current = onSave;

  const setUsdDraftSync = (next: string) => {
    usdDraftRef.current = next;
    setUsdDraft(next);
  };

  const setPenDraftSync = (next: string) => {
    penDraftRef.current = next;
    setPenDraft(next);
  };

  useEffect(() => {
    if (isDirtyRef.current) return;
    if (Math.abs(usd - lastCommittedUsdRef.current) > 0.0001) {
      lastCommittedUsdRef.current = usd;
    }
    setUsdDraftSync(usd > 0 ? formatUsdDraft(usd) : '');
    const pen = useCharm
      ? usdToPenCharm(usd, exchangeRate)
      : usdToPenPrecise(usd, exchangeRate);
    setPenDraftSync(pen > 0 ? formatPenDraft(pen) : '');
  }, [usd, exchangeRate, useCharm]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (!isDirtyRef.current || savingRef.current) return;
      const nextUsd = Math.max(0, Number(usdDraftRef.current) || 0);
      if (Math.abs(nextUsd - lastCommittedUsdRef.current) < 0.0001) return;
      void onSaveRef.current(nextUsd);
    },
    [],
  );

  const readUsdValue = () => Math.max(0, Number(usdDraftRef.current) || 0);

  const persist = async (closeAfter = false) => {
    if (closeAfter) pendingCloseRef.current = true;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (savingRef.current) {
      persistQueuedRef.current = true;
      return;
    }

    const nextUsd = readUsdValue();
    const hasChange =
      isDirtyRef.current || Math.abs(nextUsd - lastCommittedUsdRef.current) >= 0.0001;

    if (!hasChange) {
      if (closeAfter) {
        pendingCloseRef.current = false;
        onClose?.();
      }
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    try {
      await onSaveRef.current(nextUsd);
      lastCommittedUsdRef.current = nextUsd;
      isDirtyRef.current = false;
    } catch {
      return;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }

    if (persistQueuedRef.current) {
      persistQueuedRef.current = false;
      void persist(pendingCloseRef.current);
      return;
    }

    if (Math.abs(readUsdValue() - lastCommittedUsdRef.current) >= 0.0001) {
      isDirtyRef.current = true;
      void persist(false);
      return;
    }

    if (pendingCloseRef.current) {
      pendingCloseRef.current = false;
      onClose?.();
    }
  };

  const scheduleSave = () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      void persist(false);
    }, SAVE_DEBOUNCE_MS);
  };

  const syncPenFromUsd = (parsedUsd: number) => {
    const pen = useCharm
      ? usdToPenCharm(parsedUsd, exchangeRate)
      : usdToPenPrecise(parsedUsd, exchangeRate);
    setPenDraftSync(pen > 0 ? formatPenDraft(pen) : '');
  };

  const syncUsdFromPen = (parsedPen: number) => {
    const nextUsd = penCharmToUsd(parsedPen, exchangeRate);
    setUsdDraftSync(nextUsd > 0 ? formatUsdDraft(nextUsd) : '');
  };

  const handleUsdChange = (raw: string) => {
    isDirtyRef.current = true;
    setUsdDraftSync(raw);
    const parsed = parseNumericInput(raw);
    if (parsed == null) {
      if (!raw.trim()) setPenDraftSync('');
      scheduleSave();
      return;
    }
    syncPenFromUsd(parsed);
    scheduleSave();
  };

  const handlePenChange = (raw: string) => {
    isDirtyRef.current = true;
    setPenDraftSync(raw);
    if (!raw.trim()) {
      setUsdDraftSync('');
      scheduleSave();
      return;
    }
    const parsed = parseNumericInput(raw);
    if (parsed == null) {
      scheduleSave();
      return;
    }
    syncUsdFromPen(parsed);
    scheduleSave();
  };

  const handlePenBlur = () => {
    const rawPen = penDraftRef.current;
    if (!rawPen.trim()) {
      void persist(true);
      return;
    }
    const parsed = parseNumericInput(rawPen);
    if (parsed == null) {
      void persist(true);
      return;
    }

    const pen = useCharm ? roundPenCharm99(parsed) : Math.round(parsed * 100) / 100;
    isDirtyRef.current = true;
    setPenDraftSync(formatPenDraft(pen));
    syncUsdFromPen(pen);
    void persist(true);
  };

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const next = event.relatedTarget;
    if (next && event.currentTarget.contains(next)) return;
    void persist(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void persist(true);
  };

  const priceInputClass =
    'h-7 w-full pl-5 pr-1 text-right text-[0.65rem] leading-none tabular-nums md:text-[0.65rem]';

  const usdField = (
    <div key="usd" className="relative w-full min-w-[4.25rem]">
      <span
        className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-[0.55rem] font-medium text-muted-foreground"
        aria-hidden="true"
      >
        $
      </span>
      <Input
        id={usdId}
        type="text"
        inputMode="decimal"
        value={usdDraft}
        onChange={(event) => handleUsdChange(event.target.value)}
        className={priceInputClass}
        autoFocus={!penFirst}
        aria-label={`${ariaLabel} en dólares`}
        aria-busy={isSaving}
      />
    </div>
  );

  const penField = (
    <div key="pen" className="relative w-full min-w-[4.25rem]">
      <span
        className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-[0.55rem] font-medium text-muted-foreground"
        aria-hidden="true"
      >
        S/
      </span>
      <Input
        id={penId}
        type="text"
        inputMode="decimal"
        value={penDraft}
        onChange={(event) => handlePenChange(event.target.value)}
        onBlur={handlePenBlur}
        className={cn(priceInputClass, 'pl-5')}
        autoFocus={penFirst}
        aria-label={`${ariaLabel} en soles`}
        aria-busy={isSaving}
      />
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      className={cn('inline-flex flex-col items-end gap-0.5', className)}
      aria-label={ariaLabel}
    >
      {penFirst ? (
        <>
          {penField}
          {usdField}
        </>
      ) : (
        <>
          {usdField}
          {penField}
        </>
      )}
    </form>
  );
}
