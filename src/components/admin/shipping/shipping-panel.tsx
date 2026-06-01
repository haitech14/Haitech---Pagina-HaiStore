import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Truck } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  loadShipments,
  loadShippingCarriers,
  loadShippingRates,
  loadShippingZones,
  saveShippingRates,
  saveShippingZones,
  updateShipmentStatus,
} from '@/lib/shipping-storage';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';
import type { ShipmentRecord, ShipmentStatus, ShippingRate, ShippingZone } from '@/types/shipping';

type ShippingTab = 'zones' | 'rates' | 'shipments';

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending_pickup: 'Por recoger',
  in_transit: 'En tránsito',
  out_for_delivery: 'En reparto',
  delivered: 'Entregado',
  failed: 'Fallido',
};

const STATUS_VARIANT: Record<
  ShipmentStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending_pickup: 'secondary',
  in_transit: 'default',
  out_for_delivery: 'default',
  delivered: 'outline',
  failed: 'destructive',
};

const NEXT_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  pending_pickup: 'in_transit',
  in_transit: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

function formatPen(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ShippingPanel() {
  const [tab, setTab] = useState<ShippingTab>('shipments');
  const [zones, setZones] = useState<ShippingZone[]>(() => loadShippingZones());
  const [rates, setRates] = useState<ShippingRate[]>(() => loadShippingRates());
  const [carriers] = useState(() => loadShippingCarriers());
  const [shipments, setShipments] = useState<ShipmentRecord[]>(() => loadShipments());
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const carrierName = useMemo(() => {
    const map = new Map(carriers.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? id;
  }, [carriers]);

  const zoneName = useMemo(() => {
    const map = new Map(zones.map((z) => [z.id, z.name]));
    return (id: (typeof zones)[number]['id']) => map.get(id) ?? id;
  }, [zones]);

  useEffect(() => {
    if (!savedHint) return;
    const t = window.setTimeout(() => setSavedHint(null), 2500);
    return () => window.clearTimeout(t);
  }, [savedHint]);

  const toggleZone = (id: ShippingZone['id']) => {
    const next = zones.map((z) => (z.id === id ? { ...z, active: !z.active } : z));
    setZones(next);
    saveShippingZones(next);
    setSavedHint('Zonas actualizadas.');
  };

  const updateRatePrice = (id: string, basePricePen: number) => {
    const next = rates.map((r) => (r.id === id ? { ...r, basePricePen } : r));
    setRates(next);
    saveShippingRates(next);
    setSavedHint('Tarifas guardadas.');
  };

  const advanceShipment = (id: string) => {
    const row = shipments.find((s) => s.id === id);
    if (!row) return;
    const nextStatus = NEXT_STATUS[row.status];
    if (!nextStatus) return;
    setShipments(updateShipmentStatus(id, nextStatus));
  };

  const tabClass = (value: ShippingTab) =>
    cn(
      'min-h-11 flex-1 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
      tab === value
        ? 'bg-[hsl(var(--admin-accent))] text-white'
        : 'bg-muted/60 text-foreground hover:bg-muted',
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 rounded-xl border bg-card p-1 sm:max-w-lg">
          <button type="button" className={tabClass('shipments')} onClick={() => setTab('shipments')}>
            Envíos activos
          </button>
          <button type="button" className={tabClass('rates')} onClick={() => setTab('rates')}>
            Tarifas
          </button>
          <button type="button" className={tabClass('zones')} onClick={() => setTab('zones')}>
            Zonas
          </button>
        </div>
        {savedHint && (
          <p role="status" className="text-sm text-green-700">
            {savedHint}
          </p>
        )}
      </div>

      {tab === 'zones' && (
        <div className="grid gap-3 md:grid-cols-2">
          {zones.map((zone) => (
            <article
              key={zone.id}
              className={cn(
                'rounded-xl border bg-card p-4',
                !zone.active && 'opacity-60',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold">{zone.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{zone.description}</p>
                    <p className="mt-2 text-xs font-medium text-foreground">
                      ETA: {zone.etaBusinessDays}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={zone.active ? 'default' : 'outline'}
                  size="sm"
                  className={zone.active ? 'bg-[hsl(var(--admin-accent))]' : undefined}
                  onClick={() => toggleZone(zone.id)}
                >
                  {zone.active ? 'Activa' : 'Inactiva'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'rates' && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Zona</th>
                <th className="px-4 py-3 text-left font-medium">Courier</th>
                <th className="px-4 py-3 text-left font-medium">Servicio</th>
                <th className="px-4 py-3 text-right font-medium">Precio base</th>
                <th className="px-4 py-3 text-right font-medium">Gratis desde</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{zoneName(rate.zoneId)}</td>
                  <td className="px-4 py-3">{carrierName(rate.carrierId)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rate.label}</td>
                  <td className="px-4 py-3 text-right">
                    <Label htmlFor={`rate-${rate.id}`} className="sr-only">
                      Precio {rate.label}
                    </Label>
                    <Input
                      id={`rate-${rate.id}`}
                      type="number"
                      min={0}
                      step={1}
                      className="ml-auto w-24 text-right"
                      value={rate.basePricePen}
                      onChange={(e) =>
                        updateRatePrice(rate.id, Number(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {rate.freeFromPen != null ? formatPen(rate.freeFromPen) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'shipments' && (
        <>
          {shipments.length === 0 ? (
            <AdminEmptyState
              title="Sin envíos registrados"
              description="Los despachos aparecerán aquí cuando se marquen pedidos como enviados."
              icon={<Package className="size-5" aria-hidden="true" />}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Pedido</th>
                    <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium">Destino</th>
                    <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">Courier</th>
                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Costo</th>
                    <th className="px-4 py-3 text-right font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{row.orderRef}</td>
                      <td className="hidden px-4 py-3 md:table-cell">{row.customerName}</td>
                      <td className="px-4 py-3">
                        <span className="block">{row.district}</span>
                        <span className="text-xs text-muted-foreground">{row.etaLabel}</span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="flex items-center gap-1">
                          <Truck className="size-3.5" aria-hidden="true" />
                          {carrierName(row.carrierId)}
                        </span>
                        <span className="text-xs text-muted-foreground">{row.trackingCode}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABELS[row.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.shippingCostPen === 0 ? (
                          <Badge variant="secondary">Gratis</Badge>
                        ) : (
                          formatPen(row.shippingCostPen)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {NEXT_STATUS[row.status] ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => advanceShipment(row.id)}
                          >
                            → {STATUS_LABELS[NEXT_STATUS[row.status]!]}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to={ADMIN_ROUTES.VENTAS}>Ver todas las ventas</Link>
            </Button>
          </div>

          <aside className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Propuesta logística HaiStore</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Envío gratis en Lima desde el umbral configurado por tarifa.</li>
              <li>Motorizado propio para entregas urgentes en Lima y Callao.</li>
              <li>Couriers Olva, Shalom y Urbano para provincias según peso.</li>
            </ul>
          </aside>
        </>
      )}
    </div>
  );
}
