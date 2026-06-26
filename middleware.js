import { injectSeoIntoHtml } from './shared/seo/inject-html.js';

export const config = {
  matcher: ['/', '/tienda', '/tienda/producto/:path*', '/categoria/:path*'],
};

/** @type {Map<string, { payload: unknown; loadedAt: number }>} */
const fragmentCache = new Map();
const FRAGMENT_TTL_MS = 5 * 60 * 1000;

/** @type {{ manifest: object | null; loadedAt: number }} */
let manifestState = { manifest: null, loadedAt: 0 };

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

async function resolveSeo(pathname, search, request) {
  const manifest = await loadManifest(request);
  if (!manifest) return null;

  const routeKey = search ? `${pathname}?${search}` : pathname;
  const routeRef = manifest.routes?.[routeKey] ?? manifest.routes?.[pathname];
  if (!routeRef) return null;

  if (routeRef.redirectTo) {
    return { redirectTo: routeRef.redirectTo };
  }

  if (routeRef.type === 'home' || pathname === '/') {
    return fetchJson(request, '/catalog/seo-snapshot/home.json');
  }

  if (routeRef.type === 'category') {
    const categories = await fetchJson(request, '/catalog/seo-snapshot/categories.json');
    const category = categories?.[routeRef.slug];
    if (!category) return null;
    if (routeRef.title) {
      return { ...category, title: routeRef.title };
    }
    return category;
  }

  if (routeRef.type === 'product') {
    const product = await fetchJson(
      request,
      `/catalog/seo-snapshot/products/${routeRef.file}.json`,
    );
    if (!product) return null;
    if (routeRef.redirectTo) {
      return { ...product, redirectTo: routeRef.redirectTo };
    }
    return product;
  }

  if (manifest.sharded) {
    return null;
  }

  const legacy = manifest;
  if (legacy.routes?.[routeKey]) return legacy.routes[routeKey];
  if (legacy.routes?.[pathname]) return legacy.routes[pathname];

  const productMatch = pathname.match(/^\/tienda\/producto\/([^/]+)$/);
  if (productMatch) {
    const lookup = decodeURIComponent(productMatch[1]).toLowerCase();
    return legacy.productsByLookup?.[lookup] ?? null;
  }

  const categoryMatch = pathname.match(/^\/categoria\/([^/]+)$/);
  if (categoryMatch) {
    return legacy.categories?.[categoryMatch[1]] ?? null;
  }

  if (pathname === '/') return legacy.home ?? null;
  if (pathname === '/tienda') {
    return legacy.routes?.['/tienda'] ?? legacy.categories?.multifuncionales ?? null;
  }

  return null;
}

export default async function middleware(request) {
  const accept = request.headers.get('accept') ?? '';
  if (!accept.includes('text/html')) {
    return;
  }

  const url = new URL(request.url);
  const seo = await resolveSeo(url.pathname, url.searchParams.toString(), request);

  if (seo?.redirectTo) {
    return Response.redirect(new URL(seo.redirectTo, request.url), 301);
  }

  if (!seo) {
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
    },
  });
}
