import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveWarehouses } from '@/hooks/use-warehouses';
import { DEFAULT_WAREHOUSES, normalizeWarehouses } from '@/lib/inventory-stock';
import { randomId } from '@/lib/random-id';
import type { InventoryWarehouse } from '@/types/product';

interface AdminWarehousesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: InventoryWarehouse[];
}

type DraftWarehouse = InventoryWarehouse;

export function AdminWarehousesDialog({
  open,
  onOpenChange,
  warehouses,
}: AdminWarehousesDialogProps) {
  const saveWarehouses = useSaveWarehouses();
  const [draft, setDraft] = useState<DraftWarehouse[]>(() =>
    normalizeWarehouses(warehouses),
  );

  useEffect(() => {
    if (open) {
      setDraft(normalizeWarehouses(warehouses));
    }
  }, [open, warehouses]);

  const updateRow = (id: string, patch: Partial<DraftWarehouse>) => {
    setDraft((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    setDraft((current) => [
      ...current,
      {
        id: randomId(),
        name: '',
        delivery_time: '24–48h',
      },
    ]);
  };

  const removeRow = (id: string) => {
    setDraft((current) => {
      if (current.length <= 1) {
        toast.error('Debe quedar al menos un almacén');
        return current;
      }
      return current.filter((row) => row.id !== id);
    });
  };

  const handleSave = async () => {
    const cleaned = draft
      .map((row) => ({
        ...row,
        name: row.name.trim(),
        delivery_time: row.delivery_time?.trim() || null,
      }))
      .filter((row) => row.name.length > 0);

    if (cleaned.length === 0) {
      toast.error('Indica al menos un almacén con nombre');
      return;
    }

    try {
      await saveWarehouses.mutateAsync(cleaned);
      toast.success('Almacenes guardados');
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudieron guardar los almacenes',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-4">
        <DialogHeader>
          <DialogTitle>Almacenes</DialogTitle>
          <DialogDescription>
            Registra cada almacén con su tiempo de entrega. Al asignar un producto, la
            cotización usará ese tiempo (p. ej. «Inmediata», «24–48h», «3–5 días»).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {draft.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,8rem)_auto] items-end gap-2"
            >
              <div className="space-y-1.5">
                <Label htmlFor={`wh-name-${row.id}`} className="text-xs">
                  Almacén
                </Label>
                <Input
                  id={`wh-name-${row.id}`}
                  value={row.name}
                  placeholder="Nombre del almacén"
                  className="h-9 text-sm"
                  onChange={(event) => updateRow(row.id, { name: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`wh-eta-${row.id}`} className="text-xs">
                  Tiempo de entrega
                </Label>
                <Input
                  id={`wh-eta-${row.id}`}
                  value={row.delivery_time ?? ''}
                  placeholder="Inmediata"
                  className="h-9 text-sm"
                  onChange={(event) =>
                    updateRow(row.id, { delivery_time: event.target.value })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground"
                onClick={() => removeRow(row.id)}
                aria-label={`Eliminar ${row.name || 'almacén'}`}
                disabled={draft.length <= 1}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
            <Plus className="size-3.5" aria-hidden="true" />
            Añadir almacén
          </Button>

          {draft.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Sin almacenes. Se usará «{DEFAULT_WAREHOUSES[0]?.name}».
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saveWarehouses.isPending}
          >
            {saveWarehouses.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
