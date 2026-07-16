export interface StaticSeoRoute {
  pathname: string;
  title: string;
  description: string;
  pageName: string;
  jsonLdKind: 'faq' | 'webpage';
}

export const STATIC_SEO_ROUTES: StaticSeoRoute[];

export function findStaticSeoRoute(pathname: string): StaticSeoRoute | null;

export function buildStaticSeoRecord(
  route: StaticSeoRoute,
  siteOrigin: string,
  buildAbsoluteUrlFn: (pathname: string, siteOrigin: string) => string,
): Record<string, unknown>;
