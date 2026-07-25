import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Droplets, ShieldCheck, Wrench } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ProductDetailPurchaseAccordion } from '@/components/product-detail/product-detail-purchase-accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductDetailViewModel, ProductWarrantyOption } from '@/types/product-detail';

interface ProductQuickViewExtrasProps {
  detail: ProductDetailViewModel;
  detailHref: string;
  rentalMode: boolean;
  className?: string;
  onClose?: () => void;
  onRequestMaintenance?: () => void;
}

function WarrantyOptions({
  options,
  selectedId,
  onSelect,
}: {
  options: ProductWarrantyOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">Seleccionar garantía extendida</legend>
      <ul className="space-y-2">
        {options.map((option) => {
          const inputId = `qv-warranty-${option.id}`;
          return (
            <li key={option.id}>
              <label
                htmlFor={inputId}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
                  selectedId === option.id
                    ? 'border-red-600 bg-red-50'
                    : 'border-border bg-muted/20 hover:border-border/80',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    id={inputId}
                    name="qv-warranty-option"
                    value={option.id}
                    checked={selectedId === option.id}
                    onChange={() => onSelect(option.id)}
                    className="size-4 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  />
                  <span className="font-medium text-foreground">{option.label}</span>
                </span>
                {option.priceUsd != null ? (
                  <span className="shrink-0 font-semibold text-foreground">
                    + <DualPrice usd={option.priceUsd} className="inline font-semibold" />
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-muted-foreground">Sin costo</span>
                )}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/** Opciones compactas de Toner / Garantía extendida / Planes de mantenimiento en vista rápida. */
export function ProductQuickViewExtras({
  detail,
  detailHref,
  rentalMode,
  className,
  onClose,
  onRequestMaintenance,
}: ProductQuickViewExtrasProps) {
  const tonerPanelId = useId();
  const warrantyPanelId = useId();
  const maintenancePanelId = useId();
  const [tonerOpen, setTonerOpen] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(
    detail.warrantyOptions[0]?.id ?? 'none',
  );

  if (rentalMode) {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground',
          className,
        )}
        role="status"
      >
        <p className="flex items-center gap-2 font-medium text-foreground">
          <CalendarClock className="size-4 shrink-0 text-red-600" aria-hidden="true" />
          Modo alquiler activo
        </p>
        <p className="mt-1 text-xs leading-relaxed">
          {detail.rentalPlans.length > 0
            ? `Planes desde S/ ${Math.min(
                ...detail.rentalPlans.map((plan) => plan.monthlyPricePen),
              ).toLocaleString('es-PE')}/mes. Completa la solicitud en la ficha del producto.`
            : 'Consulta planes de alquiler mensuales en la ficha completa del equipo.'}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-2.5 h-9 w-full text-xs font-semibold"
          asChild
        >
          <Link to={detailHref} onClick={onClose}>
            Ver planes de alquiler
          </Link>
        </Button>
      </div>
    );
  }

  const showToner = detail.isPrinterEquipment;
  const showWarranty = detail.warrantyOptions.length > 0;
  const showMaintenance = detail.isPrinterEquipment;

  if (!showToner && !showWarranty && !showMaintenance) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {showToner ? (
        <ProductDetailPurchaseAccordion
          title="Toner"
          subtitle="Original o compatible para este equipo"
          expanded={tonerOpen}
          onToggle={() => setTonerOpen((value) => !value)}
          panelId={tonerPanelId}
        >
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Droplets className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>
                Agrega tóner original o compatible desde la ficha completa, con precios por
                rendimiento y suministro.
              </span>
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full text-xs font-semibold"
              asChild
            >
              <Link to={detailHref} onClick={onClose}>
                Ver opciones de toner
              </Link>
            </Button>
          </div>
        </ProductDetailPurchaseAccordion>
      ) : null}

      {showWarranty ? (
        <ProductDetailPurchaseAccordion
          title="Garantía extendida"
          subtitle="Protección adicional opcional"
          expanded={warrantyOpen}
          onToggle={() => setWarrantyOpen((value) => !value)}
          panelId={warrantyPanelId}
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
            Elige una cobertura adicional si la necesitas.
          </div>
          <WarrantyOptions
            options={detail.warrantyOptions}
            selectedId={selectedWarranty}
            onSelect={setSelectedWarranty}
          />
        </ProductDetailPurchaseAccordion>
      ) : null}

      {showMaintenance ? (
        <ProductDetailPurchaseAccordion
          title="Planes de mantenimiento"
          subtitle="Mantenimiento y suministros mensuales"
          expanded={maintenanceOpen}
          onToggle={() => setMaintenanceOpen((value) => !value)}
          panelId={maintenancePanelId}
        >
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Wrench className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>
                Planes con visitas técnicas y suministro de tóner según volumen de páginas.
              </span>
            </p>
            {onRequestMaintenance ? (
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full text-xs font-semibold"
                onClick={onRequestMaintenance}
              >
                Solicitar plan de mantenimiento
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full text-xs font-semibold"
                asChild
              >
                <Link to={detailHref} onClick={onClose}>
                  Ver planes de mantenimiento
                </Link>
              </Button>
            )}
          </div>
        </ProductDetailPurchaseAccordion>
      ) : null}
    </div>
  );
}
