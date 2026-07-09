import { Copy, Eye, MoreVertical, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminServicioRecord } from '@/types/admin-servicios';

interface AdminServiciosRowActionsProps {
  service: AdminServicioRecord;
  onEdit?: ((service: AdminServicioRecord) => void) | undefined;
  onDelete?: ((sourceId: string) => void) | undefined;
  onToggleArchive?: ((service: AdminServicioRecord) => void) | undefined;
}

export function AdminServiciosRowActions({
  service,
  onEdit,
  onDelete,
  onToggleArchive,
}: AdminServiciosRowActionsProps) {
  const handleCopySlug = async () => {
    try {
      await navigator.clipboard.writeText(service.slug);
      toast.success('Slug copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el slug');
    }
  };

  const handleDelete = () => {
    if (!window.confirm(`¿Eliminar «${service.name}» del catálogo?`)) return;
    onDelete?.(service.sourceId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`Acciones para ${service.name}`}
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit?.(service)}>
          <Eye className="size-4" aria-hidden="true" />
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEdit?.(service)}>
          <Pencil className="size-4" aria-hidden="true" />
          Editar servicio
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleCopySlug()}>
          <Copy className="size-4" aria-hidden="true" />
          Copiar slug
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onToggleArchive?.(service)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          {service.estado === 'archivado' ? 'Restaurar servicio' : 'Archivar servicio'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={handleDelete}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
