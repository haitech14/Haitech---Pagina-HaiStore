import { useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  Filter,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPipelinePen } from '@/lib/crm-pipeline-utils';
import { cn } from '@/lib/utils';

interface CrmPipelineToolbarProps {
  openLeadsCount: number;
  pipelineValuePen: number;
  onNewLead: () => void;
}

export function CrmPipelineToolbar({
  openLeadsCount,
  pipelineValuePen,
  onNewLead,
}: CrmPipelineToolbarProps) {
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-10 gap-1 px-2 font-bold uppercase tracking-wide text-foreground"
            aria-haspopup="listbox"
          >
            Leads
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground"
            aria-label="Vista de estadísticas"
          >
            <BarChart3 className="size-5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground"
            aria-label="Opciones de vista"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
          <span className="inline-flex min-h-8 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800">
            Leads abiertos
          </span>
          <span className="text-xs font-medium text-muted-foreground">Búsqueda y filtro</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 gap-2"
          >
            <Filter className="size-4" aria-hidden="true" />
            Filtros
          </Button>
          <p className="text-xs tabular-nums text-muted-foreground" role="status">
            {openLeadsCount} leads: {formatPipelinePen(pipelineValuePen)}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label="Más acciones"
          >
            <MoreHorizontal className="size-5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="sm"
            className={cn(
              'min-h-10 gap-1.5 bg-amber-400 font-semibold uppercase tracking-wide text-amber-950 hover:bg-amber-300',
            )}
          >
            <Zap className="size-4" aria-hidden="true" />
            Automatiza
          </Button>
          <Button
            type="button"
            size="sm"
            className="min-h-10 gap-1.5 bg-blue-600 font-semibold uppercase tracking-wide text-white hover:bg-blue-500"
            onClick={onNewLead}
          >
            <Plus className="size-4" aria-hidden="true" />
            Nuevo lead
          </Button>
        </div>
      </div>

      <div className="relative max-w-3xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar leads, empresas o etiquetas…"
          className="min-h-11 pl-10"
          aria-label="Buscar leads"
        />
      </div>
    </div>
  );
}
