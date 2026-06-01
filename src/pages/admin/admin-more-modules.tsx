import { Link } from 'react-router-dom';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminModuleLayout } from '@/components/admin/admin-module-layout';
import { AppearancePanel } from '@/components/admin/appearance-panel';
import { ShippingPanel } from '@/components/admin/shipping/shipping-panel';
import { TpvPanel } from '@/components/admin/tpv/tpv-panel';
import { Button } from '@/components/ui/button';
import { ADMIN_ROUTES } from '@/lib/admin-routes';

export function AdminTpvPage() {
  return (
    <AdminModuleLayout
      title="TPV — Punto de venta"
      description="Venta en tienda con carrito, datos del cliente y emisión de proforma, factura o boleta en PDF."
    >
      <TpvPanel />
    </AdminModuleLayout>
  );
}

export function AdminServiciosPage() {
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Gestión de servicio técnico, mantenimientos y órdenes de trabajo.
      </p>
      <AdminEmptyState
        title="Módulo de servicios"
        description="Aquí podrás programar visitas, asignar técnicos y hacer seguimiento de equipos en campo."
      />
      <Button asChild variant="outline" className="mt-4">
        <Link to={ADMIN_ROUTES.CUSTOMERS}>Ver clientes</Link>
      </Button>
    </div>
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
