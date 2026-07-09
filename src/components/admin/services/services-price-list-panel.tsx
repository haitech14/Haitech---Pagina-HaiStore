import { useMemo, useState } from 'react';
import { Plus, Tags, Trash2 } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { ServicePriceDraggableHeader } from '@/components/admin/services/service-price-draggable-header';
import { ServicePriceListCell } from '@/components/admin/services/service-price-list-cell';
import { Button } from '@/components/ui/button';
import { useServicePriceListColumnOrder } from '@/hooks/use-service-price-list-column-order';
import type { ServiceCatalogPatch } from '@/hooks/use-service-catalog';
import {
  createServicePriceItem,
  deleteServicePriceItem,
  updateServicePriceItem,
} from '@/lib/services-storage';
import { cn } from '@/lib/utils';
import type { ServiceCategory, ServicePriceItem } from '@/types/service';

interface ServicesPriceListPanelProps {
  categories: ServiceCategory[];
  items: ServicePriceItem[];
  onChange?: (items: ServicePriceItem[]) => void;
  onCreateItem?: (categoryId: string, name: string) => void | Promise<void>;
  onUpdateItem?: (id: string, patch: ServiceCatalogPatch) => void | Promise<void>;
  onDeleteItem?: (id: string) => void | Promise<void>;
  onSaved?: (message: string) => void;
}

export function ServicesPriceListPanel({
  categories,
  items,
  onChange,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onSaved,
}: ServicesPriceListPanelProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const { columnOrder, reorder } = useServicePriceListColumnOrder();
  const usesApi = Boolean(onCreateItem && onUpdateItem && onDeleteItem);

  const activeCategories = useMemo(
    () => categories.filter((cat) => cat.active),
    [categories],
  );

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [categories]);

  const handleAdd = () => {
    const categoryId = activeCategories[0]?.id ?? categories[0]?.id;
    if (!categoryId) return;

    if (usesApi && onCreateItem) {
      void Promise.resolve(onCreateItem(categoryId, 'Nuevo servicio')).then(() => {
        onSaved?.('Ítem agregado a la lista.');
      });
      return;
    }

    if (!onChange) return;
    const next = createServicePriceItem(categoryId, 'Nuevo servicio');
    onChange(next);
    onSaved?.('Ítem agregado a la lista.');
  };

  const handleDelete = (row: ServicePriceItem) => {
    if (!window.confirm(`¿Eliminar «${row.name}» de la lista de precios?`)) return;
    setBusyId(row.id);

    if (usesApi && onDeleteItem) {
      void Promise.resolve(onDeleteItem(row.id)).finally(() => {
        onSaved?.('Ítem eliminado.');
        setBusyId(null);
      });
      return;
    }

    if (!onChange) return;
    onChange(deleteServicePriceItem(row.id));
    onSaved?.('Ítem eliminado.');
    setBusyId(null);
  };

  const patchRow = (id: string, patch: ServiceCatalogPatch) => {
    if (usesApi && onUpdateItem) {
      void Promise.resolve(onUpdateItem(id, patch)).then(() => {
        onSaved?.('Lista de precios actualizada.');
      });
      return;
    }

    if (!onChange) return;
    onChange(updateServicePriceItem(id, patch));
    onSaved?.('Lista de precios actualizada.');
  };

  if (categories.length === 0) {
    return (
      <AdminEmptyState
        title="Sin categorías"
        description="Crea al menos una categoría en la subsección Categorías antes de armar la lista de precios."
        icon={<Tags className="size-5" aria-hidden="true" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Tarifas en soles (PEN) por lista de precio. Arrastra el encabezado de una columna para
          reordenarla. Pasa el cursor y usa el lápiz para editar.
        </p>
        <Button
          type="button"
          className="min-h-11 gap-2 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90"
          onClick={handleAdd}
        >
          <Plus className="size-4" aria-hidden="true" />
          Nuevo ítem
        </Button>
      </div>

      {items.length === 0 ? (
        <AdminEmptyState
          title="Lista de precios vacía"
          description="Agrega el primer servicio facturable con el botón Nuevo ítem."
          icon={<Tags className="size-5" aria-hidden="true" />}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                {columnOrder.map((columnId) => (
                  <ServicePriceDraggableHeader
                    key={columnId}
                    columnId={columnId}
                    onReorder={reorder}
                  />
                ))}
                <th className="px-3 py-3 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row.id}
                  className={cn('border-b last:border-0', !row.active && 'opacity-60')}
                >
                  {columnOrder.map((columnId) => (
                    <ServicePriceListCell
                      key={`${row.id}-${columnId}`}
                      row={row}
                      columnId={columnId}
                      categories={categories}
                      categoryName={categoryName}
                      activeFieldId={activeFieldId}
                      onActivate={setActiveFieldId}
                      onDeactivate={() => setActiveFieldId(null)}
                      onPatch={(patch) => patchRow(row.id, patch)}
                      showMobileCategory={columnId === 'name'}
                    />
                  ))}
                  <td className="px-3 py-2 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        type="button"
                        variant={row.active ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'min-h-9',
                          row.active && 'bg-[hsl(var(--admin-accent))]',
                        )}
                        onClick={() => patchRow(row.id, { active: !row.active })}
                      >
                        {row.active ? 'Activo' : 'Inactivo'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-9 text-destructive hover:bg-destructive/10"
                        disabled={busyId === row.id}
                        aria-label={`Eliminar ${row.name}`}
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {items.length} ítem{items.length === 1 ? '' : 's'} · En móvil, la categoría aparece bajo el
        nombre del servicio.
      </p>
    </div>
  );
}
