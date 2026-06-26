import * as React from 'react';

import { getSoftwareBySlug } from '@/data/software-catalog';
import {
  buildSoftwareQuoteLineId,
  clearStoredSoftwareQuote,
  readStoredSoftwareQuote,
  writeStoredSoftwareQuote,
} from '@/lib/software-quote-storage';
import type { SoftwarePlanId, SoftwareQuoteLine } from '@/types/software-catalog';

export interface SelectSoftwareInput {
  softwareSlug: string;
  planId: SoftwarePlanId;
  durationId: string;
  unitPricePen: number;
}

export interface SoftwareQuoteLineView extends SoftwareQuoteLine {
  title: string;
  image: string;
  planLabel: string;
  durationLabel: string;
  pricePeriod: string;
}

interface SoftwareQuoteContextValue {
  selectedLine: SoftwareQuoteLine | null;
  selectedLineView: SoftwareQuoteLineView | null;
  selectedSoftwareSlug: string | null;
  subtotalPen: number;
  setSelectedSoftware: (input: SelectSoftwareInput) => void;
  toggleSoftwareSelection: (input: SelectSoftwareInput) => void;
  clearSelection: () => void;
  isSoftwareSelected: (softwareSlug: string) => boolean;
}

const SoftwareQuoteContext = React.createContext<SoftwareQuoteContextValue | null>(null);

function resolveLineView(line: SoftwareQuoteLine): SoftwareQuoteLineView | null {
  const software = getSoftwareBySlug(line.softwareSlug);
  if (!software) return null;
  const plan = software.plans.find((p) => p.id === line.planId);
  const periodLabel =
    software.pricePeriod === 'mes'
      ? '/mes'
      : software.pricePeriod === 'usuario'
        ? '/usuario'
        : '/licencia';
  return {
    ...line,
    title: software.title,
    image: software.images[0] ?? '',
    planLabel: plan?.label ?? line.planId,
    durationLabel: line.durationId,
    pricePeriod: periodLabel,
  };
}

export function SoftwareQuoteProvider({ children }: { children: React.ReactNode }) {
  const [selectedLine, setSelectedLine] = React.useState<SoftwareQuoteLine | null>(() => {
    const stored = readStoredSoftwareQuote();
    return stored.length > 0 ? (stored[0] ?? null) : null;
  });

  React.useEffect(() => {
    writeStoredSoftwareQuote(selectedLine ? [selectedLine] : []);
  }, [selectedLine]);

  const selectedLineView = React.useMemo(
    () => (selectedLine ? resolveLineView(selectedLine) : null),
    [selectedLine],
  );

  const subtotalPen = selectedLine?.unitPricePen ?? 0;

  const buildLine = (input: SelectSoftwareInput): SoftwareQuoteLine => ({
    lineId: buildSoftwareQuoteLineId(input.softwareSlug, input.planId, input.durationId),
    softwareSlug: input.softwareSlug,
    planId: input.planId,
    durationId: input.durationId,
    quantity: 1,
    unitPricePen: input.unitPricePen,
  });

  const setSelectedSoftware = React.useCallback((input: SelectSoftwareInput) => {
    setSelectedLine(buildLine(input));
  }, []);

  const toggleSoftwareSelection = React.useCallback((input: SelectSoftwareInput) => {
    setSelectedLine((prev) => {
      if (prev?.softwareSlug === input.softwareSlug) {
        return null;
      }
      return buildLine(input);
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedLine(null);
    clearStoredSoftwareQuote();
  }, []);

  const isSoftwareSelected = React.useCallback(
    (softwareSlug: string) => selectedLine?.softwareSlug === softwareSlug,
    [selectedLine],
  );

  const value = React.useMemo<SoftwareQuoteContextValue>(
    () => ({
      selectedLine,
      selectedLineView,
      selectedSoftwareSlug: selectedLine?.softwareSlug ?? null,
      subtotalPen,
      setSelectedSoftware,
      toggleSoftwareSelection,
      clearSelection,
      isSoftwareSelected,
    }),
    [
      selectedLine,
      selectedLineView,
      subtotalPen,
      setSelectedSoftware,
      toggleSoftwareSelection,
      clearSelection,
      isSoftwareSelected,
    ],
  );

  return <SoftwareQuoteContext.Provider value={value}>{children}</SoftwareQuoteContext.Provider>;
}

export function useSoftwareQuote(): SoftwareQuoteContextValue {
  const ctx = React.useContext(SoftwareQuoteContext);
  if (!ctx) {
    throw new Error('useSoftwareQuote debe usarse dentro de SoftwareQuoteProvider');
  }
  return ctx;
}

export function useSoftwareQuoteOptional(): SoftwareQuoteContextValue | null {
  return React.useContext(SoftwareQuoteContext);
}
