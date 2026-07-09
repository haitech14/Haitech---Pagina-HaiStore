import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

export function AdminVariantesRowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Acciones de variante"
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => toast.info('Edición de variante próximamente.')}>
          Editar variante
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info('Ajuste de stock próximamente.')}>
          Ajustar stock
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-rose-600 focus:text-rose-600"
          onSelect={() => toast.info('Desactivar variante próximamente.')}
        >
          Desactivar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminProductOptionsRowActions({ parentName }: { parentName: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Acciones de opción de producto"
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() =>
            toast.info(`Editar opciones de «${parentName}» desde el editor de inventario.`)
          }
        >
          Editar en inventario
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info('Vista previa en tienda próximamente.')}>
          Vista previa en tienda
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
