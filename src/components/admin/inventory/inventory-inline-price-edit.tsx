import { useEffect, useId, useState, type FocusEvent, type FormEvent } from 'react';

import { Input } from '@/components/ui/input';
import { penCharmToUsd, roundPenCharm99, usdToPenCharm } from '@/lib/pen-pricing';
import { cn } from '@/lib/utils';

interface InventoryInlinePriceEditProps {
  usd: number;
  exchangeRate: number;
  ariaLabel: string;
  onSave: (usd: number) => void | Promise<void>;
  className?: string;
}

export function InventoryInlinePriceEdit({
  usd,
  exchangeRate,
  ariaLabel,
  onSave,
  className,
}: InventoryInlinePriceEditProps) {
  const usdId = useId();
  const penId = useId();
  const penFromUsd = usdToPenCharm(usd, exchangeRate);
  const [usdDraft, setUsdDraft] = useState(usd > 0 ? String(usd) : '');
  const [penDraft, setPenDraft] = useState(penFromUsd > 0 ? String(penFromUsd) : '');

  useEffect(() => {
    setUsdDraft(usd > 0 ? String(usd) : '');
    const pen = usdToPenCharm(usd, exchangeRate);
    setPenDraft(pen > 0 ? String(pen) : '');
  }, [usd, exchangeRate]);

  const commit = () => {
    void onSave(Math.max(0, Number(usdDraft) || 0));
  };

  const handleUsdChange = (raw: string) => {
    setUsdDraft(raw);
    const parsed = Number(raw);
    if (!raw.trim() || !Number.isFinite(parsed) || parsed < 0) {
      if (!raw.trim()) setPenDraft('');
      return;
    }
    const pen = usdToPenCharm(parsed, exchangeRate);
    setPenDraft(pen > 0 ? String(pen) : '');
  };

  const handlePenChange = (raw: string) => {
    setPenDraft(raw);
    const parsed = Number(raw);
    if (!raw.trim() || !Number.isFinite(parsed) || parsed < 0) {
      if (!raw.trim()) setUsdDraft('');
      return;
    }
    const charm = roundPenCharm99(parsed);
    setPenDraft(String(charm));
    const nextUsd = penCharmToUsd(charm, exchangeRate);
    setUsdDraft(nextUsd > 0 ? String(nextUsd) : '');
  };

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const next = event.relatedTarget;
    if (next && event.currentTarget.contains(next)) return;
    commit();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    commit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      className={cn('inline-flex flex-col items-end gap-1', className)}
      aria-label={ariaLabel}
    >
      <div className="relative w-full min-w-[4.75rem]">
        <span
          className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-[0.6rem] font-medium text-muted-foreground"
          aria-hidden="true"
        >
          $
        </span>
        <Input
          id={usdId}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={usdDraft}
          onChange={(event) => handleUsdChange(event.target.value)}
          className="h-8 w-full pl-4 pr-1 text-right text-xs tabular-nums"
          autoFocus
          aria-label={`${ariaLabel} en dólares`}
        />
      </div>
      <div className="relative w-full min-w-[4.75rem]">
        <span
          className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-[0.6rem] font-medium text-muted-foreground"
          aria-hidden="true"
        >
          S/
        </span>
        <Input
          id={penId}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={penDraft}
          onChange={(event) => handlePenChange(event.target.value)}
          className="h-8 w-full pl-6 pr-1 text-right text-xs tabular-nums"
          aria-label={`${ariaLabel} en soles`}
        />
      </div>
    </form>
  );
}
