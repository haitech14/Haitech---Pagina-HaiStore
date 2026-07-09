import { useState } from 'react';

import { AdminEditServicioDialog } from '@/components/admin/servicios/admin-edit-servicio-dialog';
import { AdminNewServicioDialog } from '@/components/admin/servicios/admin-new-servicio-dialog';
import { AdminServiciosKpis } from '@/components/admin/servicios/admin-servicios-kpis';
import { AdminServiciosPageHeader } from '@/components/admin/servicios/admin-servicios-page-header';
import { AdminServiciosTablePanel } from '@/components/admin/servicios/admin-servicios-table-panel';
import { AdminServiciosWidgets } from '@/components/admin/servicios/admin-servicios-widgets';
import { useAdminServicios } from '@/hooks/use-admin-servicios';
import type { AdminServicioRecord } from '@/types/admin-servicios';
import type { ServiceCatalogModalidad, ServiceCatalogTipo } from '@/types/service';

export function AdminServiciosDashboard() {
  const [headerSearch, setHeaderSearch] = useState('');
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newDefaults, setNewDefaults] = useState<{
    modalidad: ServiceCatalogModalidad;
    tipo: ServiceCatalogTipo;
  }>({ modalidad: 'presencial', tipo: 'unico' });
  const [editingRecord, setEditingRecord] = useState<AdminServicioRecord | null>(null);

  const {
    records,
    categories,
    kpis,
    categoryDistribution,
    requestUsage,
    topDemand,
    responsableOptions,
    isLoading,
    catalogUnavailable,
    catalogMigrationHint,
    requestsErrorMessage,
    refresh,
    createService,
    updateService,
    deleteService,
    toggleArchive,
    findPriceItem,
  } = useAdminServicios();

  const openNewService = (modalidad: ServiceCatalogModalidad, tipo: ServiceCatalogTipo) => {
    setNewDefaults({ modalidad, tipo });
    setNewDialogOpen(true);
  };

  return (
    <div className="space-y-3">
      <AdminServiciosPageHeader
        search={headerSearch}
        onSearchChange={setHeaderSearch}
        onNewService={() => openNewService('presencial', 'unico')}
        onNewPresencial={() => openNewService('presencial', 'unico')}
        onNewRemoto={() => openNewService('remoto', 'unico')}
        onNewPlan={() => openNewService('remoto', 'mensual')}
      />

      {catalogUnavailable && catalogMigrationHint ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="status">
          {catalogMigrationHint} Mostrando copia local del catálogo.
        </p>
      ) : null}

      {requestsErrorMessage ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="status">
          {requestsErrorMessage}. El catálogo sigue disponible; las métricas de solicitudes pueden estar incompletas.
        </p>
      ) : null}

      <AdminServiciosKpis kpis={kpis} isLoading={isLoading} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <AdminServiciosTablePanel
          headerSearch={headerSearch}
          services={records}
          responsableOptions={responsableOptions}
          isLoading={isLoading}
          onEdit={setEditingRecord}
          onDelete={deleteService}
          onToggleArchive={toggleArchive}
        />
        <AdminServiciosWidgets
          categoryDistribution={categoryDistribution}
          requestUsage={requestUsage}
          topDemand={topDemand}
          onRefresh={() => void refresh()}
        />
      </div>

      <AdminNewServicioDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        categories={categories}
        defaultModalidad={newDefaults.modalidad}
        defaultTipo={newDefaults.tipo}
        onSubmit={createService}
      />

      <AdminEditServicioDialog
        open={editingRecord != null}
        onOpenChange={(open) => {
          if (!open) setEditingRecord(null);
        }}
        record={editingRecord}
        priceItem={editingRecord ? findPriceItem(editingRecord.sourceId) ?? null : null}
        categories={categories}
        onSubmit={updateService}
      />
    </div>
  );
}
