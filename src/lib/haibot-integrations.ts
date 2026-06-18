import { ADMIN_ROUTES } from '@/lib/admin-routes';

/** Pipeline CRM interno (HaiStore admin). */
export function getHaibotCrmPipelineUrl(): string {
  return ADMIN_ROUTES.CRM_PIPELINE;
}

/** Abre el pipeline con diálogo de nuevo lead. */
export function getHaibotCrmNewLeadUrl(): string {
  return `${ADMIN_ROUTES.CRM_PIPELINE}?nuevo=1`;
}

/** Resumen CRM / seguimiento comercial. */
export function getHaibotCrmResumenUrl(): string {
  return ADMIN_ROUTES.CRM_RESUMEN;
}

/**
 * URL externa del panel HaiSupport (opcional).
 * Configura `VITE_HAISUPPORT_APP_URL` en .env si la app está desplegada aparte.
 */
export function getHaiSupportAppUrl(): string | null {
  const url = import.meta.env.VITE_HAISUPPORT_APP_URL?.trim();
  return url || null;
}
