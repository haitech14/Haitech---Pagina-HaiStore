import { NavLink } from 'react-router-dom';

import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { HeaderQuoteWhatsAppButton } from '@/components/layout/header-quote-whatsapp-button';
import {
  MAIN_NAV_BAR_CLASS,
  MAIN_NAV_LINKS_ROW_CLASS,
  MAIN_NAV_ROW_CLASS,
  mainNavLinkClass,
} from '@/components/layout/main-nav-styles';
// @ts-ignore módulo JS compartido sin declaración de tipos
import { MOST_VIEWED_OFFER_ATTR_KEY } from '../../../shared/catalog-most-viewed-offers.js';
import { categoryLandingPath, storeMostViewedOffersPath } from '@/lib/category-path';
import { prefetchCategoryPage } from '@/lib/prefetch-category-page';
import { serviceHubPath } from '@/lib/service-hub';
import { queryClient } from '@/providers';

export type HeaderMainNavLink = {
  id: string;
  to: string;
  label: string;
  end?: boolean;
  matchActive?: (location: { pathname: string; search: string }) => boolean;
  badge?: {
    label: string;
    to: string;
  };
};

export const headerMainNavLinks: HeaderMainNavLink[] = [
  {
    id: 'tienda',
    to: '/tienda',
    label: 'Tienda',
    matchActive: ({ pathname, search }) => {
      if (pathname !== '/tienda' && !pathname.startsWith('/tienda/producto/')) return false;
      const attrs = (new URLSearchParams(search).get('attrs') ?? '')
        .split('|')
        .map((entry) => entry.trim())
        .filter(Boolean);
      if (attrs.includes(MOST_VIEWED_OFFER_ATTR_KEY)) return false;
      return pathname === '/tienda' || pathname.startsWith('/tienda/producto/');
    },
  },
  {
    id: 'servicios',
    to: '/servicios',
    label: 'Servicios',
    matchActive: ({ pathname }) => pathname.startsWith('/servicios'),
  },
  {
    id: 'software',
    to: categoryLandingPath('software'),
    label: 'Software',
    matchActive: ({ pathname }) => pathname.startsWith('/categoria/software'),
  },
  {
    id: 'servicio-tecnico',
    to: serviceHubPath('servicio-tecnico'),
    label: 'Servicio Técnico',
    matchActive: ({ pathname, search }) => {
      if (pathname.startsWith('/servicio-tecnico')) return true;
      if (pathname !== '/servicios') return false;
      return new URLSearchParams(search).get('seccion') === 'servicio-tecnico';
    },
  },
  {
    id: 'ofertas',
    to: storeMostViewedOffersPath(),
    label: 'Ofertas',
    matchActive: ({ pathname, search }) => {
      if (pathname !== '/tienda' && !pathname.startsWith('/tienda/producto/')) return false;
      const attrs = (new URLSearchParams(search).get('attrs') ?? '')
        .split('|')
        .map((entry) => entry.trim())
        .filter(Boolean);
      return attrs.includes(MOST_VIEWED_OFFER_ATTR_KEY);
    },
  },
];

const PREFETCH_CATEGORY_SLUGS = new Set(['software']);

function prefetchCategoryFromNav(to: string) {
  const match = to.match(/^\/categoria\/([^/?#]+)/);
  if (!match?.[1] || !PREFETCH_CATEGORY_SLUGS.has(match[1])) return;
  void prefetchCategoryPage(queryClient, { slug: match[1] });
}

function navLinkProps(item: HeaderMainNavLink) {
  if (!item.matchActive) {
    return { to: item.to, end: item.end ?? false };
  }

  return {
    to: item.to,
    end: item.end ?? false,
    isActive: (_match: unknown, location: { pathname: string; search: string }) =>
      item.matchActive!(location),
  };
}

function CategoryNavLink({ item }: { item: HeaderMainNavLink }) {
  const prefetch = () => {
    prefetchCategoryFromNav(item.to);
  };

  return (
    <NavLink
      {...navLinkProps(item)}
      className={({ isActive }) => mainNavLinkClass(isActive)}
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      {item.label}
    </NavLink>
  );
}

export function HeaderCategoryNav() {
  return (
    <nav aria-label="Menú principal" className={MAIN_NAV_BAR_CLASS}>
      <div className={MAIN_NAV_ROW_CLASS}>
        <div className={MAIN_NAV_LINKS_ROW_CLASS}>
          <CategoriesMegaMenu triggerVariant="categories-button" />

          <ul className="flex min-w-0 items-center gap-5 sm:gap-6 lg:gap-7">
            {headerMainNavLinks.map((item) => (
              <li key={item.id} className="flex shrink-0 items-center gap-2">
                <CategoryNavLink item={item} />
              </li>
            ))}
          </ul>
        </div>

        <HeaderQuoteWhatsAppButton />
      </div>
    </nav>
  );
}

/** @deprecated Usar headerMainNavLinks */
export const mainNavItems = headerMainNavLinks;
