import {
  getServiceLandingBySlug,
  SERVICE_LANDING_SLUGS,
  type ServiceLandingSlug,
} from '@/data/service-landings';

export const DEFAULT_SERVICE_HUB_SECTION: ServiceLandingSlug = 'alquiler';

export const SERVICE_HUB_TABS: readonly {
  slug: ServiceLandingSlug;
  label: string;
}[] = [
  { slug: 'alquiler', label: 'Alquiler' },
  { slug: 'servicio-tecnico', label: 'Soporte Técnico' },
  { slug: 'outsourcing', label: 'Outsourcing' },
  { slug: 'servicios-corporativos', label: 'Servicios Corporativos' },
] as const;

const SECTION_ALIASES: Record<string, ServiceLandingSlug> = {
  alquiler: 'alquiler',
  'servicio-tecnico': 'servicio-tecnico',
  soporte: 'servicio-tecnico',
  'soporte-tecnico': 'servicio-tecnico',
  outsourcing: 'outsourcing',
  'servicios-corporativos': 'servicios-corporativos',
  corporativos: 'servicios-corporativos',
};

/** Resuelve `?seccion=` del hub; sin valor o inválido → `null` (landing de marketing). */
export function tryParseServiceHubSection(
  value: string | null | undefined,
): ServiceLandingSlug | null {
  if (!value?.trim()) {
    return null;
  }
  const key = value.trim().toLowerCase();
  const resolved = SECTION_ALIASES[key];
  if (resolved) {
    return resolved;
  }
  if (SERVICE_LANDING_SLUGS.includes(key as ServiceLandingSlug)) {
    return key as ServiceLandingSlug;
  }
  return null;
}

/** Dentro del hub con `?seccion=`; sin valor válido cae a alquiler. */
export function parseServiceHubSection(value: string | null | undefined): ServiceLandingSlug {
  return tryParseServiceHubSection(value) ?? DEFAULT_SERVICE_HUB_SECTION;
}

/** Landing de marketing (`/servicios`). Con sección → catálogo filtrado. */
export function serviceHubPath(section?: ServiceLandingSlug): string {
  if (!section) {
    return '/servicios';
  }
  return `/servicios?seccion=${section}`;
}

export function serviceDetailPathFromLanding(landingSlug: string, cardId: string): string {
  return `/servicios/${landingSlug}-${cardId}`;
}

export function isServiceHubPath(pathname: string): boolean {
  return pathname === '/servicios';
}

export function getServiceHubConfig(section: ServiceLandingSlug) {
  return getServiceLandingBySlug(section);
}
