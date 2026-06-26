import { useRef, useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Copy,
  FileText,
  MessageCircle,
  MoreHorizontal,
  Package,
  Pencil,
  Phone,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { downloadLeadProformaPdf } from '@/lib/crm-lead-proforma-pdf';
import { CRM_PIPELINE_DRAG_TYPE } from '@/lib/crm-pipeline-stage-styles';
import {
  buildLeadFollowUpWhatsAppMessage,
  formatLeadCelularDisplay,
  getLeadCelularDigits,
  getLeadContactDisplay,
  openLeadFollowUpWhatsApp,
} from '@/lib/crm-lead-whatsapp-message';
import { countPendingLeadTasks } from '@/lib/crm-lead-tasks';
import {
  formatLeadCreatedShort,
  formatLeadDealValueDual,
  formatLeadProductDisplay,
  priorityBadgeClass,
  priorityLabel,
} from '@/lib/crm-pipeline-utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { CrmPipelineLead } from '@/types/crm-pipeline';
import { cn } from '@/lib/utils';

interface CrmPipelineLeadCardProps {
  lead: CrmPipelineLead;
  usdToPenRate: number;
  onEdit: (lead: CrmPipelineLead) => void;
  onDuplicate: (lead: CrmPipelineLead) => void;
  onDelete: (lead: CrmPipelineLead) => void;
  onDragStart?: (leadId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export function CrmPipelineLeadCard({
  lead,
  usdToPenRate,
  onEdit,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: CrmPipelineLeadCardProps) {
  const didDragRef = useRef(false);
  const [proformaLoading, setProformaLoading] = useState(false);
  const { user } = useAuth();
  const { data: companySettings } = useCompanySettings();
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;

  const contactDisplay = getLeadContactDisplay(lead);
  const celularDisplay = formatLeadCelularDisplay(lead);
  const hasCelular = getLeadCelularDigits(lead).replace(/\D/g, '').length >= 9;
  const pendingTasks = countPendingLeadTasks(lead.tasks);

  const openEdit = () => onEdit(lead);

  const handleWhatsApp = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!hasCelular) {
      toast.error('Agrega un celular al lead para abrir WhatsApp', {
        description: 'Edita el lead y completa el teléfono tipo Celular.',
      });
      return;
    }
    const opened = openLeadFollowUpWhatsApp(lead, company, usdToPenRate);
    if (opened) {
      toast.success('WhatsApp abierto con mensaje de seguimiento');
      return;
    }
    void navigator.clipboard.writeText(buildLeadFollowUpWhatsAppMessage(lead, company, usdToPenRate));
    toast.success('Mensaje copiado al portapapeles');
  };

  const generateProformaPdf = async () => {
    setProformaLoading(true);
    try {
      const opts: { sellerEmail?: string; usdToPenRate: number } = { usdToPenRate };
      if (user?.email) opts.sellerEmail = user.email;
      const { documentNumber } = await downloadLeadProformaPdf(lead, company, opts);
      toast.success(`Proforma ${documentNumber} descargada`);
    } catch {
      toast.error('No se pudo generar la proforma PDF');
    } finally {
      setProformaLoading(false);
    }
  };

  const handleProformaPdf = (event: React.MouseEvent) => {
    event.stopPropagation();
    void generateProformaPdf();
  };

  return (
    <article
      draggable
      onDragStart={(event) => {
        didDragRef.current = true;
        event.dataTransfer.setData(CRM_PIPELINE_DRAG_TYPE, lead.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart?.(lead.id);
      }}
      onDragEnd={() => {
        onDragEnd?.();
        window.setTimeout(() => {
          didDragRef.current = false;
        }, 0);
      }}
      onClick={() => {
        if (didDragRef.current) return;
        openEdit();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openEdit();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'group cursor-pointer rounded-lg border border-border/80 bg-card p-3 shadow-sm transition-colors',
        'hover:border-primary/35 hover:bg-muted/30 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isDragging && 'opacity-50 ring-2 ring-primary/30',
      )}
      aria-label={`${lead.title}. ${lead.organization}. ${formatLeadDealValueDual(lead.valueAmount, lead.currency, usdToPenRate)}. Pulsa para editar.`}
      aria-grabbed={isDragging}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            lead.avatarClass,
          )}
          aria-hidden="true"
        >
          {lead.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
                {lead.title}
              </p>
              {lead.isDraft ? (
                <span className="mt-1 inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-900">
                  Borrador
                </span>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/10"
                aria-label={`Generar proforma PDF de ${lead.title}`}
                disabled={proformaLoading}
                onClick={handleProformaPdf}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <FileText className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'size-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700',
                  !hasCelular && 'opacity-40',
                )}
                aria-label={`Enviar seguimiento por WhatsApp a ${contactDisplay}`}
                onClick={handleWhatsApp}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                    aria-label={`Acciones de ${lead.title}`}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenuItem onSelect={openEdit}>
                    <Pencil className="size-4" aria-hidden="true" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={proformaLoading}
                    onSelect={() => {
                      void generateProformaPdf();
                    }}
                  >
                    <FileText className="size-4" aria-hidden="true" />
                    Generar proforma PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDuplicate(lead)}>
                    <Copy className="size-4" aria-hidden="true" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => onDelete(lead)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{lead.organization}</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
            {formatLeadDealValueDual(lead.valueAmount, lead.currency, usdToPenRate)}
          </p>
          <ul className="mt-1.5 space-y-0.5 text-[0.65rem] text-muted-foreground">
            <li className="flex items-start gap-1">
              <User className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">
                <span className="font-medium text-foreground/80">Contacto:</span>{' '}
                <span className="text-foreground">{contactDisplay}</span>
              </span>
            </li>
            <li className="flex items-start gap-1">
              <Phone className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1 tabular-nums">
                <span className="font-medium text-foreground/80">Celular:</span>{' '}
                <span className={cn('text-foreground', !hasCelular && 'text-muted-foreground')}>
                  {celularDisplay}
                </span>
              </span>
            </li>
            <li className="flex items-start gap-1">
              <Package className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">
                <span className="font-medium text-foreground/80">Producto:</span>{' '}
                {formatLeadProductDisplay(lead.productName, lead.lineItems)}
              </span>
            </li>
            <li className="flex items-start gap-1">
              <User className="mt-0.5 size-3 shrink-0 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
              <span className="line-clamp-1">
                <span className="font-medium text-foreground/80">Vendedor:</span>{' '}
                <span className="text-[hsl(var(--admin-accent))]">{lead.sellerName}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex rounded-md border px-2 py-0.5 text-[0.65rem] font-semibold uppercase',
            priorityBadgeClass(lead.priority),
          )}
        >
          {priorityLabel(lead.priority)}
        </span>
        <div className="flex flex-col items-end gap-0.5 text-[0.65rem] text-muted-foreground">
          {pendingTasks > 0 ? (
            <span className="inline-flex items-center gap-1 font-medium text-amber-700">
              <CheckSquare className="size-3 shrink-0" aria-hidden="true" />
              {pendingTasks} tarea{pendingTasks === 1 ? '' : 's'}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3 shrink-0" aria-hidden="true" />
            {formatLeadCreatedShort(lead.createdAt)}
          </span>
          <span>{lead.followUpLabel}</span>
        </div>
      </div>
    </article>
  );
}
