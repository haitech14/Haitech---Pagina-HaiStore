import { Copy, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminCatalogAttribute } from '@/types/admin-atributos';

interface AdminAtributosRowActionsProps {
  attribute: Pick<AdminCatalogAttribute, 'id' | 'name' | 'slug'>;
}

export function AdminAtributosRowActions({ attribute }: AdminAtributosRowActionsProps) {
  const handleCopySlug = async () => {
    try {
      await navigator.clipboard.writeText(attribute.slug);
      toast.success('Slug copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el slug');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`Acciones para ${attribute.name}`}
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="size-4" aria-hidden="true" />
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil className="size-4" aria-hidden="true" />
          Editar atributo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleCopySlug()}>
          <Copy className="size-4" aria-hidden="true" />
          Copiar slug
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Trash2 className="size-4" aria-hidden="true" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
