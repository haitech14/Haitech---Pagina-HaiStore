import { useState } from 'react';
import { Plus } from 'lucide-react';

import { CrmPipelineLeadCard } from '@/components/admin/crm/crm-pipeline-lead-card';
import { Button } from '@/components/ui/button';
import { CRM_PIPELINE_DRAG_TYPE } from '@/lib/crm-pipeline-stage-styles';
import { formatPipelinePen, stageSummary } from '@/lib/crm-pipeline-utils';
import type { CrmPipelineLead, CrmPipelineStage, CrmPipelineStageId } from '@/types/crm-pipeline';
import { cn } from '@/lib/utils';

interface CrmPipelineColumnProps {
  stage: CrmPipelineStage;
  leads: CrmPipelineLead[];
  draggingLeadId: string | null;
  usdToPenRate: number;
  onQuickAdd?: (stageId: CrmPipelineStageId) => void;
  onMoveLead: (leadId: string, stageId: CrmPipelineStageId) => void;
  onEditLead: (lead: CrmPipelineLead) => void;
  onDuplicateLead: (lead: CrmPipelineLead) => void;
  onDeleteLead: (lead: CrmPipelineLead) => void;
  onDragStart: (leadId: string) => void;
  onDragEnd: () => void;
}

export function CrmPipelineColumn({
  stage,
  leads,
  draggingLeadId,
  usdToPenRate,
  onQuickAdd,
  onMoveLead,
  onEditLead,
  onDuplicateLead,
  onDeleteLead,
  onDragStart,
  onDragEnd,
}: CrmPipelineColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  const summary = stageSummary(leads, usdToPenRate);

  const handleDragOver = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(CRM_PIPELINE_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const leadId = event.dataTransfer.getData(CRM_PIPELINE_DRAG_TYPE);
    if (leadId) onMoveLead(leadId, stage.id);
  };

  return (
    <section
      className={cn(
        'flex w-[min(100%,17.5rem)] shrink-0 flex-col sm:w-72',
        dragOver && 'rounded-lg ring-2 ring-inset ring-primary/25',
      )}
      aria-label={`Etapa ${stage.label}`}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className={cn('mb-2 h-1 rounded-full', stage.accentClass)} aria-hidden="true" />
      <header className="mb-3 space-y-1 px-0.5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">
          {stage.label}
        </h2>
        <p className="text-[0.65rem] leading-snug text-muted-foreground">
          {summary.label} · {formatPipelinePen(summary.totalPen)}
        </p>
      </header>
      <div className="flex min-h-[8rem] flex-1 flex-col gap-2">
        {leads.map((lead) => (
          <CrmPipelineLeadCard
            key={lead.id}
            lead={lead}
            usdToPenRate={usdToPenRate}
            isDragging={draggingLeadId === lead.id}
            onEdit={onEditLead}
            onDuplicate={onDuplicateLead}
            onDelete={onDeleteLead}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          className="min-h-10 w-full border-dashed text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => onQuickAdd?.(stage.id)}
        >
          <Plus className="mr-1.5 size-4" aria-hidden="true" />
          Lead rápido
        </Button>
      </div>
    </section>
  );
}
