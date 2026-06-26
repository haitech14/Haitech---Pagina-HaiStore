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

export function parseServiceHubSection(value: string | null | undefined): ServiceLandingSlug {
  if (!value?.trim()) {
    return DEFAULT_SERVICE_HUB_SECTION;
  }
  const key = value.trim().toLowerCase();
  const resolved = SECTION_ALIASES[key];
  if (resolved) {
    return resolved;
  }
  if (SERVICE_LANDING_SLUGS.includes(key as ServiceLandingSlug)) {
    return key as ServiceLandingSlug;
  }
  return DEFAULT_SERVICE_HUB_SECTION;
}

export function serviceHubPath(section?: ServiceLandingSlug): string {
  const slug = section ?? DEFAULT_SERVICE_HUB_SECTION;
  return `/servicios?seccion=${slug}`;
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
