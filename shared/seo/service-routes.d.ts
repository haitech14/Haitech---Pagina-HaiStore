export interface ServiceSeoRoute {
  pathname: string;
  title: string;
  description: string;
  serviceName: string;
  serviceType: string;
}

export const SERVICE_HUB_SECTIONS: ServiceSeoRoute[];
export const SERVICE_DETAIL_ROUTES: ServiceSeoRoute[];
export const SERVICE_SEO_ROUTES: ServiceSeoRoute[];

export function findServiceSeoRoute(
  pathname: string,
  search?: string,
): ServiceSeoRoute | undefined;

export function buildServiceSeoRecord(
  route: ServiceSeoRoute,
  siteOrigin: string,
  buildAbsoluteUrlFn: (path: string, origin: string) => string,
): Record<string, unknown>;
