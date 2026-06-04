import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { CrmAddLeadDialog } from '@/components/admin/crm/crm-add-lead-dialog';
import { CrmPipelineColumn } from '@/components/admin/crm/crm-pipeline-column';
import { CrmPipelineKpiRow } from '@/components/admin/crm/crm-pipeline-kpi-row';
import { CrmPipelineToolbar } from '@/components/admin/crm/crm-pipeline-toolbar';
import { useCrmPipeline } from '@/context/crm-pipeline-context';
import { CRM_PIPELINE_STAGES } from '@/data/crm-pipeline-mock';
import { groupLeadsByStage } from '@/lib/crm-pipeline-utils';
import type { CrmPipelineLead, CrmPipelineStageId } from '@/types/crm-pipeline';

export function CrmPipelineBoard() {
  const { leads, kpis, saveLead, deleteLead, duplicateLead, moveLead, usdToPenRate } =
    useCrmPipeline();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStageId, setDialogStageId] = useState<CrmPipelineStageId>('leads');
  const [editingLead, setEditingLead] = useState<CrmPipelineLead | null>(null);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

  const leadsByStage = useMemo(() => groupLeadsByStage(leads), [leads]);

  const openCreateLead = useCallback((stageId: CrmPipelineStageId = 'leads') => {
    setEditingLead(null);
    setDialogStageId(stageId);
    setDialogOpen(true);
  }, []);

  const openEditLead = useCallback((lead: CrmPipelineLead) => {
    setEditingLead(lead);
    setDialogStageId(lead.stageId);
    setDialogOpen(true);
  }, []);

  const handleSaveLead = useCallback(
    (lead: CrmPipelineLead, mode: 'create' | 'update') => {
      saveLead(lead, mode);
      setEditingLead(null);
      toast.success(mode === 'create' ? 'Lead creado' : 'Lead actualizado');
    },
    [saveLead],
  );

  const handleDeleteLead = useCallback(
    (lead: CrmPipelineLead) => {
      deleteLead(lead);
      toast.success('Lead eliminado');
    },
    [deleteLead],
  );

  const handleDuplicateLead = useCallback(
    (lead: CrmPipelineLead) => {
      duplicateLead(lead);
      toast.success('Lead duplicado');
    },
    [duplicateLead],
  );

  return (
    <div className="flex flex-col gap-4">
      <CrmPipelineToolbar
        openLeadsCount={kpis.openLeads}
        pipelineValuePen={kpis.pipelineValuePen}
        onNewLead={() => openCreateLead('leads')}
      />
      <CrmPipelineKpiRow kpis={kpis} />
      <div
        className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="Tablero Kanban de leads"
      >
        {CRM_PIPELINE_STAGES.map((stage) => (
          <CrmPipelineColumn
            key={stage.id}
            stage={stage}
            leads={leadsByStage[stage.id] ?? []}
            draggingLeadId={draggingLeadId}
            usdToPenRate={usdToPenRate}
            onQuickAdd={openCreateLead}
            onMoveLead={moveLead}
            onEditLead={openEditLead}
            onDuplicateLead={handleDuplicateLead}
            onDeleteLead={handleDeleteLead}
            onDragStart={setDraggingLeadId}
            onDragEnd={() => setDraggingLeadId(null)}
          />
        ))}
      </div>

      <CrmAddLeadDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingLead(null);
        }}
        defaultStageId={dialogStageId}
        editingLead={editingLead}
        onSave={handleSaveLead}
      />
    </div>
  );
}
