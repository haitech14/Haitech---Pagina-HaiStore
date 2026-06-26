import { NavLink, useLocation } from 'react-router-dom';

import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { HeaderForumButton } from '@/components/layout/header-forum-button';
import { HeaderForumPublishButton } from '@/components/layout/header-forum-publish-button';
import { HeaderQuoteWhatsAppButton } from '@/components/layout/header-quote-whatsapp-button';
import {
  MAIN_NAV_BAR_CLASS,
  MAIN_NAV_LINKS_ROW_CLASS,
  MAIN_NAV_ROW_CLASS,
  mainNavLinkClass,
} from '@/components/layout/main-nav-styles';
import { FORUM_HEADER_NAV } from '@/data/forum-home-layout';
// @ts-ignore módulo JS compartido sin declaración de tipos
import { MOST_VIEWED_OFFER_ATTR_KEY } from '../../../shared/catalog-most-viewed-offers.js';
import { storeMostViewedOffersPath } from '@/lib/category-path';
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
    id: 'alquiler',
    to: serviceHubPath('alquiler'),
    label: 'Alquiler',
    matchActive: ({ pathname, search }) => {
      if (pathname === '/alquiler') return true;
      if (pathname !== '/servicios') return false;
      const seccion = new URLSearchParams(search).get('seccion');
      return !seccion || seccion === 'alquiler';
    },
  },
  {
    id: 'servicios',
    to: serviceHubPath('servicio-tecnico'),
    label: 'Servicios',
    matchActive: ({ pathname, search }) => {
      if (pathname.startsWith('/servicio-tecnico')) return true;
      if (pathname.startsWith('/outsourcing')) return true;
      if (pathname.startsWith('/servicios-corporativos')) return true;
      if (pathname !== '/servicios') return false;
      const seccion = new URLSearchParams(search).get('seccion');
      return Boolean(seccion && seccion !== 'alquiler');
    },
  },
  {
    id: 'software',
    to: '/software',
    label: 'Software',
    matchActive: ({ pathname }) =>
      pathname === '/software' || pathname.startsWith('/software/'),
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

export const forumHeaderNavLinks: HeaderMainNavLink[] = FORUM_HEADER_NAV.map((item) => ({
  id: item.id,
  to: item.to,
  label: item.label,
  end: item.end,
  matchActive: (location: { pathname: string; search: string }) => item.matchActive(location),
}));

export function isForumPath(pathname: string): boolean {
  return pathname === '/foro' || pathname.startsWith('/foro/');
}

function prefetchCategoryFromNav(to: string) {
  const match = to.match(/^\/categoria\/([^/?#]+)/);
  if (!match?.[1]) return;
  void prefetchCategoryPage(queryClient, { slug: match[1] });
}

function CategoryNavLink({ item }: { item: HeaderMainNavLink }) {
  const location = useLocation();
  const prefetch = () => {
    prefetchCategoryFromNav(item.to);
  };

  return (
    <NavLink
      to={item.to}
      end={item.end ?? false}
      className={({ isActive }) =>
        mainNavLinkClass(item.matchActive ? item.matchActive(location) : isActive)
      }
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      {item.label}
    </NavLink>
  );
}

export function HeaderCategoryNav() {
  const { pathname } = useLocation();
  const forumMode = isForumPath(pathname);
  const navLinks = forumMode ? forumHeaderNavLinks : headerMainNavLinks;

  return (
    <nav aria-label={forumMode ? 'Menú del foro' : 'Menú principal'} className={MAIN_NAV_BAR_CLASS}>
      <div className={MAIN_NAV_ROW_CLASS}>
        <div className={MAIN_NAV_LINKS_ROW_CLASS}>
          {!forumMode ? <CategoriesMegaMenu triggerVariant="categories-button" /> : null}

          <ul className="flex min-w-0 items-center gap-5 sm:gap-6 lg:gap-7">
            {navLinks.map((item) => (
              <li key={item.id} className="flex shrink-0 items-center gap-2">
                <CategoryNavLink item={item} />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {forumMode ? (
            <HeaderForumPublishButton />
          ) : (
            <>
              <HeaderForumButton />
              <HeaderQuoteWhatsAppButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/** @deprecated Usar headerMainNavLinks */
export const mainNavItems = headerMainNavLinks;
