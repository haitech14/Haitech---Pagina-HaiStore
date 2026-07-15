import { useEffect, useState } from 'react';

import {
  penCharmToUsd,
  roundPenCharm99,
  usdToPenCharm,
  usdToPenPrecise,
} from '@/lib/pen-pricing';

interface UseLinkedPenUsdPriceOptions {
  usdValue: number;
  onUsdChange: (value: string) => void;
  exchangeRate: number;
  /** Venta: redondeo comercial en soles al confirmar. Compra: conversión exacta. */
  useCharm?: boolean;
}

export function useLinkedPenUsdPrice({
  usdValue,
  onUsdChange,
  exchangeRate,
  useCharm = true,
}: UseLinkedPenUsdPriceOptions) {
  const penFromUsd = useCharm
    ? usdToPenCharm(usdValue, exchangeRate)
    : usdToPenPrecise(usdValue, exchangeRate);

  const [penInput, setPenInput] = useState(
    Number.isFinite(penFromUsd) ? String(penFromUsd) : '',
  );
  const [penFocused, setPenFocused] = useState(false);

  useEffect(() => {
    if (penFocused) return;
    setPenInput(Number.isFinite(penFromUsd) ? String(penFromUsd) : '');
  }, [penFromUsd, penFocused]);

  const handlePenChange = (raw: string) => {
    setPenInput(raw);

    if (!raw.trim()) {
      onUsdChange('0');
      return;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    onUsdChange(String(penCharmToUsd(parsed, exchangeRate)));
  };

  const handlePenFocus = () => {
    setPenFocused(true);
  };

  const handlePenBlur = () => {
    setPenFocused(false);

    if (!penInput.trim()) {
      onUsdChange('0');
      setPenInput('0');
      return;
    }

    const parsed = Number(penInput);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    const pen = useCharm ? roundPenCharm99(parsed) : Math.round(parsed * 100) / 100;
    const usd = penCharmToUsd(pen, exchangeRate);
    setPenInput(String(pen));
    onUsdChange(String(usd));
  };

  return {
    penInput,
    handlePenChange,
    handlePenFocus,
    handlePenBlur,
  };
}
