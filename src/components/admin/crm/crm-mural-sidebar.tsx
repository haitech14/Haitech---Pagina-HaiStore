import {
  Columns3,
  Image,
  LayoutGrid,
  Link2,
  MessageSquare,
  Minus,
  Pencil,
  StickyNote,
  Table2,
  Trash2,
  Upload,
  ListTodo,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MURAL_TOOLS: Array<{ id: string; label: string; icon: LucideIcon; active?: boolean }> = [
  { id: 'nota', label: 'Nota', icon: StickyNote },
  { id: 'enlace', label: 'Enlace', icon: Link2 },
  { id: 'todo', label: 'To-do', icon: ListTodo },
  { id: 'linea', label: 'Línea', icon: Minus },
  { id: 'tablero', label: 'Tablero', icon: LayoutGrid, active: true },
  { id: 'columna', label: 'Columna', icon: Columns3 },
  { id: 'comento', label: 'Comento', icon: MessageSquare },
  { id: 'tabla', label: 'Tabla', icon: Table2 },
  { id: 'imagen', label: 'Imagen', icon: Image },
  { id: 'subir', label: 'Subir', icon: Upload },
  { id: 'dibujar', label: 'Dibujar', icon: Pencil },
];

export function CrmMuralSidebar() {
  return (
    <aside
      className="hidden w-[3.25rem] shrink-0 flex-col items-center gap-0.5 border-r border-neutral-300 bg-white py-2 lg:flex"
      aria-label="Herramientas del mural"
    >
      {MURAL_TOOLS.map((tool) => {
        const Icon = tool.icon;
        return (
          <Button
            key={tool.id}
            type="button"
            variant="ghost"
            className={cn(
              'flex h-auto min-h-11 w-12 flex-col gap-0.5 px-1 py-1.5 text-[0.6rem] font-medium text-muted-foreground',
              tool.active && 'bg-muted text-foreground',
            )}
            aria-label={tool.label}
            aria-pressed={tool.active}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{tool.label}</span>
          </Button>
        );
      })}
      <div className="mt-auto pt-2">
        <Button
          type="button"
          variant="ghost"
          className="flex h-auto min-h-11 w-12 flex-col gap-0.5 px-1 py-1.5 text-[0.6rem] font-medium text-muted-foreground"
          aria-label="Papelera"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          <span>Papelera</span>
        </Button>
      </div>
    </aside>
  );
}
