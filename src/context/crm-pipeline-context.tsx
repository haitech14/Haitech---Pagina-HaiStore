import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  computePipelineKpisFromLeads,
  computeResumenMetricsFromLeads,
  duplicatePipelineLead,
  type CrmResumenLeadMetrics,
} from '@/lib/crm-lead-form';
import { applyLeadStageChange } from '@/lib/crm-pipeline-stage-styles';
import { loadCrmPipelineLeads, saveCrmPipelineLeads } from '@/lib/crm-pipeline-storage';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { CrmPipelineLead, CrmPipelineStageId } from '@/types/crm-pipeline';

interface CrmPipelineContextValue {
  leads: CrmPipelineLead[];
  usdToPenRate: number;
  kpis: ReturnType<typeof computePipelineKpisFromLeads>;
  resumenMetrics: CrmResumenLeadMetrics;
  saveLead: (lead: CrmPipelineLead, mode: 'create' | 'update') => void;
  deleteLead: (lead: CrmPipelineLead) => void;
  duplicateLead: (lead: CrmPipelineLead) => void;
  moveLead: (leadId: string, stageId: CrmPipelineStageId) => void;
}

const CrmPipelineContext = createContext<CrmPipelineContextValue | null>(null);

export function CrmPipelineProvider({ children }: { children: ReactNode }) {
  const { data: companySettings } = useCompanySettings();
  const usdToPenRate =
    companySettings?.usdToPenExchangeRate ?? DEFAULT_COMPANY_SETTINGS.usdToPenExchangeRate;

  const [leads, setLeads] = useState<CrmPipelineLead[]>(() => loadCrmPipelineLeads());

  useEffect(() => {
    saveCrmPipelineLeads(leads);
  }, [leads]);

  const kpis = useMemo(
    () => computePipelineKpisFromLeads(leads, usdToPenRate),
    [leads, usdToPenRate],
  );

  const resumenMetrics = useMemo(
    () => computeResumenMetricsFromLeads(leads, usdToPenRate),
    [leads, usdToPenRate],
  );

  const saveLead = useCallback((lead: CrmPipelineLead, mode: 'create' | 'update') => {
    setLeads((prev) => {
      if (mode === 'update') {
        const index = prev.findIndex((item) => item.id === lead.id);
        if (index === -1) return prev;
        return prev.map((item) => (item.id === lead.id ? lead : item));
      }
      if (prev.some((item) => item.id === lead.id)) {
        return prev.map((item) => (item.id === lead.id ? lead : item));
      }
      return [...prev, lead];
    });
  }, []);

  const deleteLead = useCallback((lead: CrmPipelineLead) => {
    setLeads((prev) => prev.filter((item) => item.id !== lead.id));
  }, []);

  const duplicateLead = useCallback((lead: CrmPipelineLead) => {
    setLeads((prev) => [...prev, duplicatePipelineLead(lead)]);
  }, []);

  const moveLead = useCallback((leadId: string, stageId: CrmPipelineStageId) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId || lead.stageId === stageId) return lead;
        return { ...lead, ...applyLeadStageChange(lead, stageId) };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      leads,
      usdToPenRate,
      kpis,
      resumenMetrics,
      saveLead,
      deleteLead,
      duplicateLead,
      moveLead,
    }),
    [
      leads,
      usdToPenRate,
      kpis,
      resumenMetrics,
      saveLead,
      deleteLead,
      duplicateLead,
      moveLead,
    ],
  );

  return (
    <CrmPipelineContext.Provider value={value}>{children}</CrmPipelineContext.Provider>
  );
}

export function useCrmPipeline(): CrmPipelineContextValue {
  const ctx = useContext(CrmPipelineContext);
  if (!ctx) {
    throw new Error('useCrmPipeline debe usarse dentro de CrmPipelineProvider');
  }
  return ctx;
}
