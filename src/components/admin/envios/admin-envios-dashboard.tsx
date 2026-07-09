import { useMemo, useState } from 'react';

import { AdminEnviosKpis } from '@/components/admin/envios/admin-envios-kpis';
import { AdminEnviosPageHeader } from '@/components/admin/envios/admin-envios-page-header';
import { AdminEnviosTablePanel } from '@/components/admin/envios/admin-envios-table-panel';
import { AdminEnviosWidgets } from '@/components/admin/envios/admin-envios-widgets';
import { NewShipmentDialog } from '@/components/admin/shipping/new-shipment-dialog';
import { ShipmentSuccessDialog } from '@/components/admin/shipping/shipment-success-dialog';
import { useAdminDateRange } from '@/context/admin-date-range-context';
import { useAdminEnviosList } from '@/hooks/use-admin-envios';
import { computeEnviosTabCounts, defaultEnviosRange } from '@/lib/admin-envios-utils';
import type { ShipmentRecord } from '@/types/shipping';

export function AdminEnviosDashboard() {
  const { range, setRange } = useAdminDateRange();
  const effectiveRange = range.from && range.to ? range : defaultEnviosRange();
  const {
    shipments,
    refresh,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDuplicate,
    handleAdvanceStatus,
  } = useAdminEnviosList();

  const [newShipmentOpen, setNewShipmentOpen] = useState(false);
  const [editShipment, setEditShipment] = useState<ShipmentRecord | null>(null);
  const [successShipment, setSuccessShipment] = useState<ShipmentRecord | null>(null);

  const incidentCount = useMemo(() => {
    const counts = computeEnviosTabCounts(shipments, effectiveRange);
    return counts.incidencias;
  }, [shipments, effectiveRange]);

  return (
    <div className="space-y-3">
      <AdminEnviosPageHeader
        incidentCount={incidentCount}
        onNewShipment={() => {
          setEditShipment(null);
          setNewShipmentOpen(true);
        }}
      />

      <AdminEnviosKpis shipments={shipments} range={effectiveRange} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <AdminEnviosTablePanel
          shipments={shipments}
          range={effectiveRange}
          onRangeChange={setRange}
          onRefresh={refresh}
          onEdit={(shipment) => {
            setEditShipment(shipment);
            setNewShipmentOpen(true);
          }}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onAdvanceStatus={handleAdvanceStatus}
        />
        <AdminEnviosWidgets shipments={shipments} range={effectiveRange} onRefresh={refresh} />
      </div>

      <NewShipmentDialog
        open={newShipmentOpen}
        onOpenChange={(open) => {
          setNewShipmentOpen(open);
          if (!open) setEditShipment(null);
        }}
        editShipment={editShipment}
        onSaved={(shipment) => {
          if (editShipment) {
            handleUpdate(editShipment.id, shipment);
          } else {
            handleCreate(shipment);
          }
          setSuccessShipment({
            ...shipment,
            id: editShipment?.id ?? `shp-${Date.now()}`,
            status: editShipment?.status ?? 'pending_pickup',
            createdAt: editShipment?.createdAt ?? new Date().toISOString(),
            trackingCode: editShipment?.trackingCode ?? shipment.trackingCode,
            orderRef: editShipment?.orderRef ?? shipment.orderRef,
          });
          refresh();
        }}
      />

      <ShipmentSuccessDialog
        shipment={successShipment}
        onOpenChange={(open) => {
          if (!open) setSuccessShipment(null);
        }}
      />
    </div>
  );
}
