import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Plus, Wrench } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { NewServiceDialog } from '@/components/admin/services/new-service-dialog';
import { ServiceCategoriesTaxonomy } from '@/components/admin/services/service-categories-taxonomy';

const ServicesPriceListPanel = lazy(() =>
  import('@/components/admin/services/services-price-list-panel').then((m) => ({
    default: m.ServicesPriceListPanel,
  })),
);
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  updateServiceCategory as updateLocalServiceCategory,
} from '@/lib/services-storage';
import { useServiceCatalog } from '@/hooks/use-service-catalog';
import {
  useServiceCategories,
  useServiceCategoryMutations,
  useServiceRequestMutations,
  useServiceRequests,
} from '@/hooks/use-service-requests';
import type { ServiceCategory } from '@/types/service';
import type { ServiceRequestStatus } from '@/types/haitech-domain';

export type ServicesTab = 'servicios' | 'categorias' | 'precios';

const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  pending: 'Pendiente',
  scheduled: 'Programado',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const STATUS_VARIANT: Record<
  ServiceRequestStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'secondary',
  scheduled: 'default',
  in_progress: 'default',
  completed: 'outline',
  cancelled: 'destructive',
};

const NEXT_STATUS: Partial<Record<ServiceRequestStatus, ServiceRequestStatus>> = {
  pending: 'scheduled',
  scheduled: 'in_progress',
  in_progress: 'completed',
};

export function parseServicesTab(searchParams: URLSearchParams): ServicesTab {
  const tab = searchParams.get('tab');
  if (tab === 'categorias' || tab === 'precios') return tab;
  return 'servicios';
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAgendaDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export function ServicesPanel() {
  const [searchParams] = useSearchParams();
  const tab = parseServicesTab(searchParams);
  const { data: orders = [], isLoading: ordersLoading } = useServiceRequests();
  const { data: apiCategories = [] } = useServiceCategories();
  const { updateCategory } = useServiceCategoryMutations();
  const { updateRequest, deleteRequest } = useServiceRequestMutations();
  const {
    items: priceList,
    unavailable: catalogUnavailable,
    migrationHint: catalogMigrationHint,
    createItem,
    updateItem,
    deleteItem,
  } = useServiceCatalog();
  const [localCategories, setLocalCategories] = useState<ServiceCategory[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [savedHint, setSavedHint] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const usesApiCategories = apiCategories.length > 0;

  const categories: ServiceCategory[] = useMemo(() => {
    if (apiCategories.length > 0) {
      return apiCategories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        active: c.active,
        sortOrder: c.sortOrder,
      }));
    }
    return localCategories;
  }, [apiCategories, localCategories]);

  useEffect(() => {
    if (apiCategories.length === 0 && localCategories.length === 0) {
      void import('@/data/services-defaults').then((m) => {
        setLocalCategories(m.DEFAULT_SERVICE_CATEGORIES);
      });
    }
  }, [apiCategories.length, localCategories.length]);

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? id;
  }, [categories]);

  const agendaOrders = useMemo(
    () =>
      [...orders]
        .filter((o) => o.status !== 'cancelled' && o.status !== 'completed')
        .sort(
          (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        ),
    [orders],
  );

  useEffect(() => {
    if (!savedHint) return;
    const t = window.setTimeout(() => setSavedHint(null), 2500);
    return () => window.clearTimeout(t);
  }, [savedHint]);

  const advanceStatus = async (id: string, current: ServiceRequestStatus) => {
    const next = NEXT_STATUS[current];
    if (!next) return;
    setBusyId(id);
    try {
      await updateRequest.mutateAsync({ id, payload: { status: next } });
      setSavedHint('Estado actualizado.');
    } catch {
      toast.error('No se pudo actualizar el estado');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`¿Eliminar la solicitud ${code}?`)) return;
    setBusyId(id);
    try {
      await deleteRequest.mutateAsync(id);
      setSavedHint('Solicitud eliminada.');
    } catch {
      toast.error('No se pudo eliminar');
    } finally {
      setBusyId(null);
    }
  };

  const toggleCategory = async (id: string) => {
    const row = categories.find((c) => c.id === id);
    if (!row) return;
    if (usesApiCategories) {
      try {
        await updateCategory.mutateAsync({ id, payload: { active: !row.active } });
        setSavedHint('Categoría actualizada.');
      } catch {
        toast.error('No se pudo actualizar la categoría');
      }
      return;
    }
    const next = updateLocalServiceCategory(id, { active: !row.active });
    setLocalCategories(next);
    setSavedHint('Categoría actualizada (local).');
  };

  const patchCategoryField = async (
    id: string,
    field: 'name' | 'description',
    value: string,
  ) => {
    if (usesApiCategories) {
      try {
        await updateCategory.mutateAsync({ id, payload: { [field]: value } });
        setSavedHint('Categoría actualizada.');
      } catch {
        toast.error('No se pudo actualizar la categoría');
      }
      return;
    }
    const next = updateLocalServiceCategory(id, { [field]: value });
    setLocalCategories(next);
  };

  return (
    <div className="space-y-4">
      {(tab === 'servicios' || savedHint) && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {tab === 'servicios' && (
            <Button
              type="button"
              className="min-h-11 gap-2 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90"
              onClick={() => setNewOpen(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nuevo
            </Button>
          )}
          {savedHint && (
            <p role="status" className="text-sm text-green-700">
              {savedHint}
            </p>
          )}
        </div>
      )}

      <NewServiceDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        categories={apiCategories.length ? apiCategories : categories.map((c, i) => ({ ...c, sortOrder: i }))}
        onCreated={() => setSavedHint('Solicitud de servicio registrada.')}
      />

      {tab === 'servicios' && (
        <div className="space-y-3">
          {ordersLoading ? (
            <p className="text-sm text-muted-foreground" role="status">
              Cargando solicitudes…
            </p>
          ) : null}
          {agendaOrders.length > 0 && (
            <section aria-labelledby="services-agenda-heading" className="space-y-3">
              <h2 id="services-agenda-heading" className="text-base font-semibold text-balance">
                Próximas visitas
              </h2>
              <ul className="space-y-2">
                {agendaOrders.slice(0, 5).map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-2 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex gap-3">
                      <CalendarClock
                        className="mt-0.5 size-5 shrink-0 text-[hsl(var(--admin-accent))]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold capitalize">{formatAgendaDate(row.scheduledAt)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(row.scheduledAt)} · {row.code} ·{' '}
                          {categoryName(row.categoryId)}
                        </p>
                        <p className="mt-1 text-sm">
                          <span className="font-medium">{row.customerSnapshot.nombre}</span>
                          {row.technician ? ` · ${row.technician}` : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANT[row.status]} className="w-fit shrink-0">
                      {STATUS_LABELS[row.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {orders.length === 0 && !ordersLoading ? (
            <AdminEmptyState
              title="Sin solicitudes de servicio"
              description="Crea la primera solicitud con el botón Nuevo."
              icon={<Wrench className="size-5" aria-hidden="true" />}
            />
          ) : orders.length > 0 ? (
            <div className="overflow-hidden rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Código</th>
                    <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium">Categoría</th>
                    <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
                      Programado
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{row.code}</td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {row.customerSnapshot.nombre}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.categoryLabel || categoryName(row.categoryId)}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {formatDateTime(row.scheduledAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[row.status]}>
                          {STATUS_LABELS[row.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {NEXT_STATUS[row.status] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="min-h-9"
                              disabled={busyId === row.id}
                              onClick={() => void advanceStatus(row.id, row.status)}
                            >
                              → {STATUS_LABELS[NEXT_STATUS[row.status]!]}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="min-h-9 text-destructive hover:text-destructive"
                            disabled={busyId === row.id}
                            onClick={() => void handleDelete(row.id, row.code)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {tab === 'categorias' && (
        <div className="space-y-3">
          <p className="max-w-2xl text-sm text-muted-foreground">
            Categorías de servicio ordenadas por código. Los precios por rol se gestionan en la
            pestaña Lista de precios.
          </p>
          <ServiceCategoriesTaxonomy
            categories={categories}
            onToggleCategory={(id) => void toggleCategory(id)}
            onPatchCategoryField={(id, field, value) => {
              void patchCategoryField(id, field, value);
            }}
          />
        </div>
      )}

      {tab === 'precios' && (
        <Suspense
          fallback={
            <div className="flex min-h-[12rem] items-center justify-center" role="status">
              <span className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <span className="sr-only">Cargando lista de precios…</span>
            </div>
          }
        >
          {catalogUnavailable && catalogMigrationHint ? (
            <p
              className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
              role="status"
            >
              {catalogMigrationHint} Mostrando copia local hasta aplicar la migración.
            </p>
          ) : null}
          <ServicesPriceListPanel
            categories={categories}
            items={priceList}
            onCreateItem={(categoryId, name) => {
              void createItem.mutateAsync({ name, categoryId, estado: 'activo' });
            }}
            onUpdateItem={(id, patch) => {
              void updateItem.mutateAsync({ id, patch });
            }}
            onDeleteItem={(id) => {
              void deleteItem.mutateAsync(id);
            }}
            onSaved={setSavedHint}
          />
        </Suspense>
      )}
    </div>
  );
}
