import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { CrmPipelineColumn } from '@/components/admin/crm/crm-pipeline-column';
import { CrmPipelineKpiRow } from '@/components/admin/crm/crm-pipeline-kpi-row';
import { CrmPipelineToolbar } from '@/components/admin/crm/crm-pipeline-toolbar';
import { useCrmLeadDialog } from '@/context/crm-lead-dialog-context';
import { useCrmPipeline } from '@/context/crm-pipeline-context';
import { CRM_PIPELINE_STAGES } from '@/data/crm-pipeline-mock';
import { groupLeadsByStage } from '@/lib/crm-pipeline-utils';
import type { CrmPipelineLead, CrmPipelineStageId } from '@/types/crm-pipeline';

export function CrmPipelineBoard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { leads, kpis, deleteLead, duplicateLead, moveLead, usdToPenRate } = useCrmPipeline();
  const { openNewLead, openEditLead } = useCrmLeadDialog();

  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

  const leadsByStage = useMemo(() => groupLeadsByStage(leads), [leads]);

  const openCreateLead = useCallback(
    (stageId: CrmPipelineStageId = 'leads') => {
      openNewLead({ stageId });
    },
    [openNewLead],
  );

  useEffect(() => {
    if (searchParams.get('nuevo') !== '1') return;
    openCreateLead('leads');
    const next = new URLSearchParams(searchParams);
    next.delete('nuevo');
    setSearchParams(next, { replace: true });
  }, [openCreateLead, searchParams, setSearchParams]);

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
    </div>
  );
}
