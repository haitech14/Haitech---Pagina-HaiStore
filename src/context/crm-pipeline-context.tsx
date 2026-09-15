import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useCompanySettings } from '@/hooks/use-company-settings';
import { apiFetch } from '@/lib/api';
import {
  computePipelineKpisFromLeads,
  computeResumenMetricsFromLeads,
  duplicatePipelineLead,
  type CrmResumenLeadMetrics,
} from '@/lib/crm-lead-form';
import { applyLeadStageChange } from '@/lib/crm-pipeline-stage-styles';
import {
  CRM_PIPELINE_UPDATED_EVENT,
  isPipelineLead,
  loadCrmPipelineLeads,
  mergePipelineLeads,
  normalizePipelineLead,
  saveCrmPipelineLeads,
} from '@/lib/crm-pipeline-storage';
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

function persistLeadToServer(lead: CrmPipelineLead) {
  void apiFetch(`/api/crm/pipeline-leads/${encodeURIComponent(lead.id)}`, {
    method: 'PATCH',
    body: JSON.stringify(lead),
  }).catch(() => {
    void apiFetch('/api/crm/pipeline-leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    }).catch(() => {
      /* El panel sigue con localStorage si el API no responde */
    });
  });
}

export function CrmPipelineProvider({ children }: { children: ReactNode }) {
  const { data: companySettings } = useCompanySettings();
  const usdToPenRate =
    companySettings?.usdToPenExchangeRate ?? DEFAULT_COMPANY_SETTINGS.usdToPenExchangeRate;

  const [leads, setLeads] = useState<CrmPipelineLead[]>(() => loadCrmPipelineLeads());
  const skipNextPersistRef = useRef(false);
  const leadsRef = useRef(leads);
  leadsRef.current = leads;

  const reloadFromStorage = useCallback(() => {
    skipNextPersistRef.current = true;
    setLeads(loadCrmPipelineLeads());
  }, []);

  useEffect(() => {
    const onUpdated = () => reloadFromStorage();
    window.addEventListener(CRM_PIPELINE_UPDATED_EVENT, onUpdated);
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.includes('crm-pipeline-leads')) {
        reloadFromStorage();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CRM_PIPELINE_UPDATED_EVENT, onUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [reloadFromStorage]);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromServer = async () => {
      try {
        const data = await apiFetch<{ leads: CrmPipelineLead[] }>('/api/crm/pipeline-leads');
        if (cancelled) return;
        const remote = (data.leads ?? []).filter(isPipelineLead).map(normalizePipelineLead);
        const merged = mergePipelineLeads(leadsRef.current, remote);
        if (JSON.stringify(merged) === JSON.stringify(leadsRef.current)) return;
        skipNextPersistRef.current = true;
        setLeads(merged);
        saveCrmPipelineLeads(merged);
      } catch {
        /* CRM local sigue disponible */
      }
    };

    void hydrateFromServer();
    const timer = window.setInterval(() => {
      void hydrateFromServer();
    }, 10_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    saveCrmPipelineLeads(leads);
    window.dispatchEvent(new Event(CRM_PIPELINE_UPDATED_EVENT));
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
    persistLeadToServer(lead);
  }, []);

  const deleteLead = useCallback((lead: CrmPipelineLead) => {
    setLeads((prev) => prev.filter((item) => item.id !== lead.id));
    void apiFetch(`/api/crm/pipeline-leads/${encodeURIComponent(lead.id)}`, {
      method: 'DELETE',
    }).catch(() => {
      /* El panel sigue con localStorage si el API no responde */
    });
  }, []);

  const duplicateLead = useCallback((lead: CrmPipelineLead) => {
    const copy = duplicatePipelineLead(lead);
    setLeads((prev) => [...prev, copy]);
    persistLeadToServer(copy);
  }, []);

  const moveLead = useCallback((leadId: string, stageId: CrmPipelineStageId) => {
    setLeads((prev) => {
      const next = prev.map((lead) => {
        if (lead.id !== leadId || lead.stageId === stageId) return lead;
        return { ...lead, ...applyLeadStageChange(lead, stageId) };
      });
      const moved = next.find((lead) => lead.id === leadId);
      if (moved) persistLeadToServer(moved);
      return next;
    });
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
