import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { ShipmentCustomerSearch } from '@/components/admin/shipping/shipment-customer-search';
import { ShipmentLineItemsEditor } from '@/components/admin/shipping/shipment-line-items-editor';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  calcShipmentTotals,
  emptyShipmentForm,
  formToShipmentInput,
  parseLineItems,
  shipmentToForm,
  validateShipmentForm,
} from '@/lib/shipment-form';
import { peekShipmentOrderRef } from '@/lib/shipment-order-serial';
import {
  createShipment,
  generateShipmentTrackingCode,
  updateShipment,
} from '@/lib/shipping-storage';
import type {
  ShipmentRecord,
  ShippingCarrier,
  ShippingRate,
  ShippingZone,
  ShippingZoneId,
} from '@/types/shipping';

interface NewShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editShipment?: ShipmentRecord | null;
  zones: ShippingZone[];
  carriers: ShippingCarrier[];
  rates: ShippingRate[];
  onSaved: (shipments: ShipmentRecord[], record: ShipmentRecord) => void;
}

function rateForZoneCarrier(
  rates: ShippingRate[],
  zoneId: ShippingZoneId,
  carrierId: string,
): ShippingRate | undefined {
  return rates.find((r) => r.active && r.zoneId === zoneId && r.carrierId === carrierId);
}

export function NewShipmentDialog({
  open,
  onOpenChange,
  editShipment,
  zones,
  carriers,
  rates,
  onSaved,
}: NewShipmentDialogProps) {
  const isEdit = Boolean(editShipment);
  const [form, setForm] = useState(() => emptyShipmentForm());
  const [error, setError] = useState<string | null>(null);

  const activeZones = useMemo(() => zones.filter((z) => z.active), [zones]);
  const activeCarriers = useMemo(() => carriers.filter((c) => c.active), [carriers]);

  const matchedRate = useMemo(
    () => rateForZoneCarrier(rates, form.zoneId, form.carrierId),
    [rates, form.zoneId, form.carrierId],
  );

  const lineItems = useMemo(() => parseLineItems(form.lineItems), [form.lineItems]);
  const exchangeRate = Number(form.exchangeRate) || 3.859;
  const shippingCostPen = Number(form.shippingCostPen) || 0;
  const totals = useMemo(
    () => calcShipmentTotals(lineItems, exchangeRate, shippingCostPen),
    [lineItems, exchangeRate, shippingCostPen],
  );

  useEffect(() => {
    if (!open) return;
    if (editShipment) {
      setForm(shipmentToForm(editShipment));
    } else {
      const base = emptyShipmentForm();
      const rate = rateForZoneCarrier(rates, base.zoneId, base.carrierId);
      setForm({
        ...base,
        shippingCostPen: String(rate?.basePricePen ?? 0),
      });
    }
    setError(null);
  }, [open, editShipment, rates]);

  const handleZoneOrCarrierChange = (patch: Partial<typeof form>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      const rate = rateForZoneCarrier(rates, next.zoneId, next.carrierId);
      if (rate && (patch.zoneId !== undefined || patch.carrierId !== undefined)) {
        next.shippingCostPen = String(rate.basePricePen);
      }
      if (patch.carrierId) {
        next.trackingCode = generateShipmentTrackingCode(patch.carrierId);
      }
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateShipmentForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const input = formToShipmentInput(form, zones);

    if (isEdit && editShipment) {
      const next = updateShipment(editShipment.id, input);
      const record = next.find((row) => row.id === editShipment.id)!;
      onSaved(next, record);
    } else {
      const next = createShipment(input);
      onSaved(next, next[0]!);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar envío' : 'Nuevo envío'}</DialogTitle>
          <DialogDescription>
            Completa los datos de envío y el pedido. Al guardar podrás copiar el mensaje, generar PDF
            o guía de remisión.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shipment-date">Fecha</Label>
              <Input
                id="shipment-date"
                type="date"
                value={form.shipmentDate}
                onChange={(e) => setForm((prev) => ({ ...prev, shipmentDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipment-order">N.º pedido</Label>
              <Input
                id="shipment-order"
                value={form.orderRef}
                placeholder={peekShipmentOrderRef()}
                onChange={(e) => setForm((prev) => ({ ...prev, orderRef: e.target.value }))}
              />
            </div>
          </div>

          <fieldset className="space-y-3 rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">🙋‍♀️ Datos de envío</legend>
            <ShipmentCustomerSearch form={form} onFormChange={setForm} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="shipment-ruc">RUC</Label>
                <Input
                  id="shipment-ruc"
                  value={form.taxId}
                  onChange={(e) => setForm((prev) => ({ ...prev, taxId: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shipment-dni">DNI</Label>
                <Input
                  id="shipment-dni"
                  value={form.customerDni}
                  onChange={(e) => setForm((prev) => ({ ...prev, customerDni: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipment-address">Dirección</Label>
              <Input
                id="shipment-address"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="shipment-destino">Destino</Label>
                <Input
                  id="shipment-destino"
                  value={form.destination}
                  onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
                  placeholder="Ej. Huancayo"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shipment-distrito">Distrito</Label>
                <Input
                  id="shipment-distrito"
                  value={form.district}
                  onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="shipment-atencion">Atención</Label>
                <Input
                  id="shipment-atencion"
                  value={form.attention}
                  onChange={(e) => setForm((prev) => ({ ...prev, attention: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shipment-cel">Celular</Label>
                <Input
                  id="shipment-cel"
                  value={form.customerPhone}
                  inputMode="tel"
                  onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                />
              </div>
            </div>
          </fieldset>

          <ShipmentLineItemsEditor
            items={form.lineItems}
            onChange={(lineItems) => setForm((prev) => ({ ...prev, lineItems }))}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="shipment-tc">TC (USD → PEN)</Label>
              <Input
                id="shipment-tc"
                type="number"
                min={0}
                step={0.001}
                value={form.exchangeRate}
                onChange={(e) => setForm((prev) => ({ ...prev, exchangeRate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipment-cost">Envío (S/)</Label>
              <Input
                id="shipment-cost"
                type="number"
                min={0}
                step={0.01}
                value={form.shippingCostPen}
                onChange={(e) => setForm((prev) => ({ ...prev, shippingCostPen: e.target.value }))}
              />
            </div>
            <div className="flex flex-col justify-end rounded-md bg-muted/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total estimado</span>
              <span className="font-bold">
                ${totals.productsUsd} → S/ {totals.totalPen}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shipment-zone">Zona</Label>
              <Select
                value={form.zoneId}
                onValueChange={(zoneId) =>
                  handleZoneOrCarrierChange({ zoneId: zoneId as ShippingZoneId })
                }
              >
                <SelectTrigger id="shipment-zone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipment-carrier">Agencia / courier</Label>
              <Select
                value={form.carrierId}
                onValueChange={(carrierId) => handleZoneOrCarrierChange({ carrierId })}
              >
                <SelectTrigger id="shipment-carrier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeCarriers.map((carrier) => (
                    <SelectItem key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {matchedRate && (
                <p className="text-xs text-muted-foreground">{matchedRate.label}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shipment-agency-detail">Modalidad agencia</Label>
              <Input
                id="shipment-agency-detail"
                value={form.agencyDetail}
                onChange={(e) => setForm((prev) => ({ ...prev, agencyDetail: e.target.value }))}
                placeholder="Ej. A Domicilio"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipment-tracking">Seguimiento</Label>
              <Input
                id="shipment-tracking"
                value={form.trackingCode}
                onChange={(e) => setForm((prev) => ({ ...prev, trackingCode: e.target.value }))}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90"
            >
              <Plus className="size-4" aria-hidden="true" />
              {isEdit ? 'Guardar cambios' : 'Registrar envío'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
