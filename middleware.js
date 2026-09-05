import { injectSeoIntoHtml } from './shared/seo/inject-html.js';
import {
  ALL_SUBCATEGORIES_QUERY,
  isAllSubcategoriesParam,
  multifuncionalesCanonicalPath,
} from './shared/seo/category-query.js';
import {
  STORE_SHOWCASE_SLUGS,
  indexableRobots,
  isNoindexHtmlPath,
  isValidHtmlPath,
  looksLikeLegacyCmsPath,
  noindexRobots,
  vitrinaCanonicalPath,
} from './shared/seo/public-paths.js';

export const config = {
  matcher: ['/', '/:path*'],
};

/** @type {Map<string, { payload: unknown; loadedAt: number }>} */
const fragmentCache = new Map();
const FRAGMENT_TTL_MS = 5 * 60 * 1000;

/** @type {{ manifest: object | null; loadedAt: number }} */
let manifestState = { manifest: null, loadedAt: 0 };

const INDEXABLE = indexableRobots();
const NOINDEX = noindexRobots();

const NOINDEX_TITLES = {
  '/login': 'Iniciar sesión | Haitech',
  '/login/registro': 'Crear cuenta | Haitech',
  '/favoritos': 'Favoritos | Haitech',
  '/checkout': 'Checkout | Haitech',
  '/mi-cuenta': 'Mi cuenta | Haitech',
};

function wantsHtml(request) {
  const accept = request.headers.get('accept') ?? '';
  if (!accept || accept === '*/*') return true;
  return accept.includes('text/html') || accept.includes('application/xhtml');
}

function noindexSeo(pathname, request) {
  const title =
    NOINDEX_TITLES[pathname] ??
    (pathname.startsWith('/checkout')
      ? 'Checkout | Haitech'
      : pathname.startsWith('/admin') || pathname.startsWith('/panel')
        ? 'Administración | Haitech'
        : 'Haitech');
  return {
    title,
    description: 'Página privada de Haitech.',
    canonical: new URL(pathname, request.url).href.replace(/\/$/, '') || request.url,
    robots: NOINDEX,
  };
}

async function fetchJson(request, pathname) {
  const now = Date.now();
  const cached = fragmentCache.get(pathname);
  if (cached && now - cached.loadedAt < FRAGMENT_TTL_MS) {
    return cached.payload;
  }

  const url = new URL(pathname, request.url);
  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;

  const payload = await response.json();
  fragmentCache.set(pathname, { payload, loadedAt: now });
  return payload;
}

async function loadManifest(request) {
  const now = Date.now();
  if (manifestState.manifest && now - manifestState.loadedAt < FRAGMENT_TTL_MS) {
    return manifestState.manifest;
  }

  const manifest =
    (await fetchJson(request, '/catalog/seo-snapshot/manifest.json')) ??
    (await fetchJson(request, '/catalog/seo-snapshot.json'));

  if (manifest) {
    manifestState = { manifest, loadedAt: now };
  }
  return manifest;
}

function mergeCategorySeo(category, routeRef) {
  if (!category) return null;
  const merged = { ...category, robots: category.robots || INDEXABLE };
  if (routeRef.title) merged.title = routeRef.title;
  if (routeRef.description) merged.description = routeRef.description;
  if (routeRef.jsonLd) merged.jsonLd = routeRef.jsonLd;
  if (routeRef.canonical) merged.canonical = routeRef.canonical;
  return merged;
}

function withIndexableRobots(seo) {
  if (!seo || seo.redirectTo) return seo;
  return { ...seo, robots: seo.robots || INDEXABLE };
}

/**
 * Normaliza la URL de entrada: slash final, sub=all, landings y CMS legado.
 * @returns {string | null} pathname+search de destino relativo, o null si no hay redirect
 */
function preliminaryRedirect(url) {
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  if (pathname.length > 1 && pathname.endsWith('/')) {
    const next = new URL(url);
    next.pathname = pathname.replace(/\/+$/, '') || '/';
    return `${next.pathname}${next.search}${next.hash}`;
  }

  if (pathname === '/qtc' || pathname.startsWith('/qtc/')) return '/';
  if (pathname === '/404') return '/';
  if (pathname === '/soluciones' || pathname.startsWith('/soluciones/')) return '/servicios';
  if (looksLikeLegacyCmsPath(pathname)) {
    if (/^\/(product|productos|shop|catalogo|catálogo)\b/i.test(pathname)) return '/tienda';
    return '/';
  }

  if (pathname === '/registro') return '/login/registro';
  if (pathname === '/categoria/software') return '/software';
  if (pathname === '/categoria/toner-compatibles') return '/categoria/toner-suministros';
  if (pathname === '/alquiler') return '/servicios?seccion=alquiler';
  if (pathname === '/servicio-tecnico') return '/servicios?seccion=servicio-tecnico';
  if (pathname === '/outsourcing') return '/servicios?seccion=outsourcing';
  if (pathname === '/servicios-corporativos') return '/servicios?seccion=servicios-corporativos';

  const sub = searchParams.get('sub');
  if (sub && sub !== ALL_SUBCATEGORIES_QUERY && isAllSubcategoriesParam(sub)) {
    const next = new URL(url);
    next.searchParams.set('sub', ALL_SUBCATEGORIES_QUERY);
    return `${next.pathname}${next.search}${next.hash}`;
  }

  if (pathname === '/categoria/multifuncionales' && !sub) {
    const next = new URL(url);
    next.searchParams.set('sub', ALL_SUBCATEGORIES_QUERY);
    return `${next.pathname}?${next.searchParams.toString()}${next.hash}`;
  }

  const productLegacy = pathname.match(/^\/tienda\/producto\/(.+)$/);
  if (productLegacy) {
    return `/tienda/${productLegacy[1]}${url.search}`;
  }

  return null;
}

function canonicalProductPathFromLookup(manifest, slug) {
  const lookup = String(slug ?? '').toLowerCase();
  const fileSlug = manifest?.productsByLookup?.[lookup];
  if (!fileSlug) return null;

  const routes = manifest.routes ?? {};
  for (const [pathname, ref] of Object.entries(routes)) {
    if (ref?.type === 'product' && ref.file === fileSlug && !ref.redirectTo) {
      return pathname;
    }
  }
  return `/tienda/${fileSlug}`;
}

async function resolveSeo(pathname, search, request) {
  const manifest = await loadManifest(request);
  if (!manifest) return null;

  const routeKey = search ? `${pathname}?${search}` : pathname;
  let routeRef = manifest.routes?.[routeKey];
  if (!routeRef) {
    const byPath = manifest.routes?.[pathname];
    if (byPath && !byPath.redirectTo) routeRef = byPath;
  }

  if (routeRef?.redirectTo) {
    return { redirectTo: routeRef.redirectTo };
  }

  if (routeRef?.type === 'home' || pathname === '/') {
    return withIndexableRobots(await fetchJson(request, '/catalog/seo-snapshot/home.json'));
  }

  if (routeRef?.type === 'store' || pathname === '/tienda') {
    return withIndexableRobots(await fetchJson(request, '/catalog/seo-snapshot/store.json'));
  }

  if (routeRef?.type === 'page') {
    const pages = await fetchJson(request, '/catalog/seo-snapshot/pages.json');
    return withIndexableRobots(pages?.[routeRef.pathname] ?? pages?.[pathname] ?? null);
  }

  if (routeRef?.type === 'category') {
    const categories = await fetchJson(request, '/catalog/seo-snapshot/categories.json');
    const category = categories?.[routeRef.slug];
    return withIndexableRobots(mergeCategorySeo(category, routeRef));
  }

  if (routeRef?.type === 'service') {
    const services = await fetchJson(request, '/catalog/seo-snapshot/services.json');
    return withIndexableRobots(
      services?.[routeRef.pathname] ?? services?.[routeKey] ?? null,
    );
  }

  if (routeRef?.type === 'product') {
    const product = await fetchJson(
      request,
      `/catalog/seo-snapshot/products/${routeRef.file}.json`,
    );
    if (!product) return null;
    if (routeRef.redirectTo) {
      return { redirectTo: routeRef.redirectTo };
    }
    return withIndexableRobots(product);
  }

  const productMatch = pathname.match(/^\/tienda\/([^/]+)$/);
  if (productMatch) {
    const slug = decodeURIComponent(productMatch[1]);
    const slugLower = slug.toLowerCase();

    if (STORE_SHOWCASE_SLUGS.has(slugLower)) {
      const canonicalPath = vitrinaCanonicalPath(slugLower);
      const store = await fetchJson(request, '/catalog/seo-snapshot/store.json');
      if (canonicalPath) {
        return withIndexableRobots({
          ...(store ?? {}),
          canonical: new URL(canonicalPath, request.url).toString().replace(/\/$/, ''),
        });
      }
      return withIndexableRobots(store);
    }

    const canonicalPath = canonicalProductPathFromLookup(manifest, slugLower);
    if (canonicalPath) {
      if (canonicalPath !== pathname) {
        return { redirectTo: canonicalPath };
      }
      const fileSlug = manifest.productsByLookup?.[slugLower];
      if (fileSlug) {
        const product = await fetchJson(
          request,
          `/catalog/seo-snapshot/products/${fileSlug}.json`,
        );
        return withIndexableRobots(product);
      }
    }

    return { redirectTo: '/tienda' };
  }

  if (pathname.startsWith('/categoria/')) {
    const slug = pathname.slice('/categoria/'.length).split('/').filter(Boolean)[0];
    if (!slug) return { redirectTo: '/tienda' };
    if (pathname.split('/').filter(Boolean).length > 2) {
      return { redirectTo: `/categoria/${slug}` };
    }
    if (slug === 'multifuncionales' && !search.includes('sub=')) {
      return { redirectTo: multifuncionalesCanonicalPath() };
    }
    return null;
  }

  if (pathname.startsWith('/software/') && pathname !== '/software') {
    const pages = await fetchJson(request, '/catalog/seo-snapshot/pages.json');
    const hub = pages?.['/software'];
    if (hub) {
      return withIndexableRobots({
        ...hub,
        canonical: new URL(pathname, request.url).toString().replace(/\/$/, ''),
      });
    }
  }

  if (manifest.sharded) {
    if (!isValidHtmlPath(pathname)) {
      return { redirectTo: '/tienda' };
    }
    return null;
  }

  const legacy = manifest;
  if (legacy.routes?.[routeKey]) return withIndexableRobots(legacy.routes[routeKey]);
  if (legacy.routes?.[pathname]) return withIndexableRobots(legacy.routes[pathname]);

  return null;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return;
  if (/\.[a-zA-Z0-9]{1,8}$/.test(url.pathname)) return;
  if (!wantsHtml(request)) return;
  const early = preliminaryRedirect(url);
  if (early) {
    return Response.redirect(new URL(early, request.url), 301);
  }

  const seo =
    (await resolveSeo(url.pathname, url.searchParams.toString(), request)) ??
    (isNoindexHtmlPath(url.pathname) ? noindexSeo(url.pathname, request) : null);

  if (seo?.redirectTo) {
    return Response.redirect(new URL(seo.redirectTo, request.url), 301);
  }

  if (!seo) {
    if (!isValidHtmlPath(url.pathname)) {
      return Response.redirect(new URL('/tienda', request.url), 301);
    }
    return;
  }

  const indexUrl = new URL('/index.html', request.url);
  const indexResponse = await fetch(indexUrl.toString(), {
    headers: { Accept: 'text/html' },
  });

  if (!indexResponse.ok) {
    return;
  }

  const html = injectSeoIntoHtml(await indexResponse.text(), seo);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Robots-Tag': seo.robots || INDEXABLE,
    },
  });
}
