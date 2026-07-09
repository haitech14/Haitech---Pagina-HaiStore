import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AdminModuleLayout } from '@/components/admin/admin-module-layout';
import { AdminServiciosDashboard } from '@/components/admin/servicios/admin-servicios-dashboard';
import { AppearancePanel } from '@/components/admin/appearance-panel';
import { RentalPlansPanel } from '@/components/admin/rentals/rental-plans-panel';
import { RentalRequestsPanel } from '@/components/admin/rentals/rental-requests-panel';
import {
  parseServicesTab,
  ServicesPanel,
} from '@/components/admin/services/services-panel';
import { ShippingPanel } from '@/components/admin/shipping/shipping-panel';
import { TpvPanel } from '@/components/admin/tpv/tpv-panel';
import { cn } from '@/lib/utils';

type AlquileresTab = 'planes' | 'solicitudes';

export function AdminTpvPage() {
  return (
    <AdminModuleLayout
      title="TPV — Punto de venta"
      description="Venta en tienda con carrito, datos del cliente y emisión de cotización, factura o boleta en PDF."
    >
      <TpvPanel />
    </AdminModuleLayout>
  );
}

export function AdminServiciosPage() {
  const [searchParams] = useSearchParams();
  const tab = parseServicesTab(searchParams);

  if (tab === 'categorias' || tab === 'precios') {
    return (
      <AdminModuleLayout
        title={tab === 'categorias' ? 'Categorías de servicio' : 'Lista de precios'}
        description="Taxonomía y tarifas del catálogo de servicios (sincronizado con HaiSupport)."
      >
        <ServicesPanel />
      </AdminModuleLayout>
    );
  }

  return <AdminServiciosDashboard />;
}

export function AdminAlquileresPage() {
  const [tab, setTab] = useState<AlquileresTab>('solicitudes');

  return (
    <AdminModuleLayout
      title="Alquileres y planes"
      description="Solicitudes de alquiler y planes mensuales sincronizados con HaiSupport."
    >
      <div
        className="mb-4 flex gap-1 rounded-lg border bg-muted/30 p-1 sm:inline-flex"
        role="tablist"
        aria-label="Sección de alquileres"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'solicitudes'}
          className={cn(
            'min-h-10 flex-1 rounded-md px-4 text-sm font-medium transition-colors sm:flex-none',
            tab === 'solicitudes'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => setTab('solicitudes')}
        >
          Solicitudes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'planes'}
          className={cn(
            'min-h-10 flex-1 rounded-md px-4 text-sm font-medium transition-colors sm:flex-none',
            tab === 'planes'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => setTab('planes')}
        >
          Planes
        </button>
      </div>

      {tab === 'solicitudes' ? <RentalRequestsPanel /> : <RentalPlansPanel />}
    </AdminModuleLayout>
  );
}

export function AdminEnviosPage() {
  return (
    <AdminModuleLayout
      title="Envíos y logística"
      description="Zonas de entrega, tarifas por courier y seguimiento de despachos activos."
    >
      <ShippingPanel />
    </AdminModuleLayout>
  );
}

export function AdminAparienciaPage() {
  return (
    <AdminModuleLayout
      title="Apariencia"
      description="Logo, colores y mensajes de marca para la tienda y documentos PDF."
    >
      <AppearancePanel />
    </AdminModuleLayout>
  );
}
