import * as React from 'react';

import { getServiceBySlug } from '@/data/services-catalog';
import {
  buildServicesQuoteLineId,
  clearStoredServicesQuote,
  readStoredServicesQuote,
  writeStoredServicesQuote,
} from '@/lib/services-quote-storage';
import type { ServicePlanId, ServicesQuoteLine } from '@/types/services-catalog';

export interface SelectServiceInput {
  serviceSlug: string;
  planId: ServicePlanId;
  durationId: string;
  unitPricePen: number;
}

export interface ServicesQuoteLineView extends ServicesQuoteLine {
  title: string;
  image: string;
  planLabel: string;
  durationLabel: string;
  pricePeriod: string;
}

interface ServicesQuoteContextValue {
  selectedLine: ServicesQuoteLine | null;
  selectedLineView: ServicesQuoteLineView | null;
  selectedServiceSlug: string | null;
  subtotalPen: number;
  setSelectedService: (input: SelectServiceInput) => void;
  toggleServiceSelection: (input: SelectServiceInput) => void;
  clearSelection: () => void;
  isServiceSelected: (serviceSlug: string) => boolean;
}

const ServicesQuoteContext = React.createContext<ServicesQuoteContextValue | null>(null);

function resolveLineView(line: ServicesQuoteLine): ServicesQuoteLineView | null {
  const service = getServiceBySlug(line.serviceSlug);
  if (!service) return null;
  const plan = service.plans.find((p) => p.id === line.planId);
  const periodLabel =
    service.pricePeriod === 'mes'
      ? '/mes'
      : service.pricePeriod === 'evento'
        ? '/evento'
        : service.pricePeriod === 'servicio'
          ? ''
          : '/día';
  return {
    ...line,
    title: service.title,
    image: service.images[0] ?? '',
    planLabel: plan?.label ?? line.planId,
    durationLabel: line.durationId,
    pricePeriod: periodLabel,
  };
}

export function ServicesQuoteProvider({ children }: { children: React.ReactNode }) {
  const [selectedLine, setSelectedLine] = React.useState<ServicesQuoteLine | null>(() => {
    const stored = readStoredServicesQuote();
    return stored.length > 0 ? (stored[0] ?? null) : null;
  });

  React.useEffect(() => {
    writeStoredServicesQuote(selectedLine ? [selectedLine] : []);
  }, [selectedLine]);

  const selectedLineView = React.useMemo(
    () => (selectedLine ? resolveLineView(selectedLine) : null),
    [selectedLine],
  );

  const subtotalPen = selectedLine?.unitPricePen ?? 0;

  const buildLine = (input: SelectServiceInput): ServicesQuoteLine => ({
    lineId: buildServicesQuoteLineId(input.serviceSlug, input.planId, input.durationId),
    serviceSlug: input.serviceSlug,
    planId: input.planId,
    durationId: input.durationId,
    quantity: 1,
    unitPricePen: input.unitPricePen,
  });

  const setSelectedService = React.useCallback((input: SelectServiceInput) => {
    setSelectedLine(buildLine(input));
  }, []);

  const toggleServiceSelection = React.useCallback((input: SelectServiceInput) => {
    setSelectedLine((prev) => {
      if (prev?.serviceSlug === input.serviceSlug) {
        return null;
      }
      return buildLine(input);
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedLine(null);
    clearStoredServicesQuote();
  }, []);

  const isServiceSelected = React.useCallback(
    (serviceSlug: string) => selectedLine?.serviceSlug === serviceSlug,
    [selectedLine],
  );

  const value = React.useMemo<ServicesQuoteContextValue>(
    () => ({
      selectedLine,
      selectedLineView,
      selectedServiceSlug: selectedLine?.serviceSlug ?? null,
      subtotalPen,
      setSelectedService,
      toggleServiceSelection,
      clearSelection,
      isServiceSelected,
    }),
    [
      selectedLine,
      selectedLineView,
      subtotalPen,
      setSelectedService,
      toggleServiceSelection,
      clearSelection,
      isServiceSelected,
    ],
  );

  return <ServicesQuoteContext.Provider value={value}>{children}</ServicesQuoteContext.Provider>;
}

export function useServicesQuote(): ServicesQuoteContextValue {
  const ctx = React.useContext(ServicesQuoteContext);
  if (!ctx) {
    throw new Error('useServicesQuote debe usarse dentro de ServicesQuoteProvider');
  }
  return ctx;
}

export function useServicesQuoteOptional(): ServicesQuoteContextValue | null {
  return React.useContext(ServicesQuoteContext);
}
