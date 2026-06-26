import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';

import { CrmAddLeadDialog } from '@/components/admin/crm/crm-add-lead-dialog';
import { useCrmPipeline } from '@/context/crm-pipeline-context';
import type { CrmNewLeadFormValues } from '@/types/crm-lead-form';
import type { CrmPipelineLead, CrmPipelineStageId } from '@/types/crm-pipeline';

export interface OpenCrmLeadDialogOptions {
  stageId?: CrmPipelineStageId;
  prefill?: Partial<CrmNewLeadFormValues>;
  editingLead?: CrmPipelineLead | null;
}

interface CrmLeadDialogContextValue {
  openNewLead: (options?: OpenCrmLeadDialogOptions) => void;
  openEditLead: (lead: CrmPipelineLead) => void;
}

const CrmLeadDialogContext = createContext<CrmLeadDialogContextValue | null>(null);

export function CrmLeadDialogProvider({ children }: { children: ReactNode }) {
  const { leads, saveLead } = useCrmPipeline();
  const [open, setOpen] = useState(false);
  const [defaultStageId, setDefaultStageId] = useState<CrmPipelineStageId>('leads');
  const [editingLead, setEditingLead] = useState<CrmPipelineLead | null>(null);
  const [initialPrefill, setInitialPrefill] = useState<Partial<CrmNewLeadFormValues> | null>(
    null,
  );

  const resetDialogState = useCallback(() => {
    setEditingLead(null);
    setInitialPrefill(null);
    setDefaultStageId('leads');
  }, []);

  const openNewLead = useCallback((options?: OpenCrmLeadDialogOptions) => {
    setEditingLead(options?.editingLead ?? null);
    setDefaultStageId(options?.stageId ?? options?.editingLead?.stageId ?? 'leads');
    setInitialPrefill(options?.prefill ?? null);
    setOpen(true);
  }, []);

  const openEditLead = useCallback(
    (lead: CrmPipelineLead) => {
      openNewLead({ editingLead: lead, stageId: lead.stageId });
    },
    [openNewLead],
  );

  const handleSaveLead = useCallback(
    (lead: CrmPipelineLead, mode: 'create' | 'update') => {
      saveLead({ ...lead, isDraft: false }, mode);
      resetDialogState();
      toast.success(mode === 'create' ? 'Lead creado' : 'Lead actualizado');
    },
    [resetDialogState, saveLead],
  );

  const handleSaveDraft = useCallback(
    (lead: CrmPipelineLead) => {
      const mode = leads.some((item) => item.id === lead.id) ? 'update' : 'create';
      saveLead(lead, mode);
      toast.message('Borrador guardado', {
        description: 'Puedes retomarlo desde el pipeline de CRM.',
      });
    },
    [leads, saveLead],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) resetDialogState();
    },
    [resetDialogState],
  );

  const value = useMemo(
    () => ({
      openNewLead,
      openEditLead,
    }),
    [openEditLead, openNewLead],
  );

  return (
    <CrmLeadDialogContext.Provider value={value}>
      {children}
      <CrmAddLeadDialog
        open={open}
        onOpenChange={handleOpenChange}
        defaultStageId={defaultStageId}
        editingLead={editingLead}
        initialPrefill={initialPrefill}
        onSave={handleSaveLead}
        onSaveDraft={handleSaveDraft}
      />
    </CrmLeadDialogContext.Provider>
  );
}

export function useCrmLeadDialog(): CrmLeadDialogContextValue {
  const ctx = useContext(CrmLeadDialogContext);
  if (!ctx) {
    throw new Error('useCrmLeadDialog debe usarse dentro de CrmLeadDialogProvider');
  }
  return ctx;
}

export function useCrmLeadDialogOptional(): CrmLeadDialogContextValue | null {
  return useContext(CrmLeadDialogContext);
}
