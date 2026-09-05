/**
 * Inyecta metadatos SEO en el HTML estático de index.html (middleware / prerender).
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function upsertMetaTag(html, attrName, attrValue, content) {
  const pattern = new RegExp(
    `<meta\\s+${attrName}=["']${attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`,
    'i',
  );
  const tag = `<meta ${attrName}="${attrValue}" content="${escapeHtml(content)}" />`;
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertLinkTag(html, rel, href) {
  const pattern = new RegExp(`<link\\s+rel=["']${rel}["'][^>]*>`, 'i');
  const tag = `<link rel="${rel}" href="${escapeHtml(href)}" />`;
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertTitle(html, title) {
  const tag = `<title>${escapeHtml(title)}</title>`;
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertJsonLd(html, jsonLd) {
  const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  const scripts = blocks
    .filter(Boolean)
    .map(
      (block) =>
        `    <script type="application/ld+json">${JSON.stringify(block)}</script>`,
    )
    .join('\n');

  const withoutExisting = html.replace(
    /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/gi,
    '',
  );

  return withoutExisting.replace('</head>', `${scripts}\n  </head>`);
}

/**
 * @param {string} html
 * @param {{
 *   title: string,
 *   description: string,
 *   canonical: string,
 *   image?: string,
 *   imageAlt?: string,
 *   ogType?: string,
 *   robots?: string,
 *   jsonLd?: unknown | unknown[],
 * }} seo
 */
export function injectSeoIntoHtml(html, seo) {
  if (!seo) return html;

  let next = html;
  next = upsertTitle(next, seo.title);
  next = upsertMetaTag(next, 'name', 'description', seo.description);
  next = upsertLinkTag(next, 'canonical', seo.canonical);
  next = upsertMetaTag(next, 'property', 'og:title', seo.title);
  next = upsertMetaTag(next, 'property', 'og:description', seo.description);
  next = upsertMetaTag(next, 'property', 'og:url', seo.canonical);
  next = upsertMetaTag(next, 'property', 'og:type', seo.ogType ?? 'website');
  next = upsertMetaTag(next, 'property', 'og:locale', 'es_PE');
  next = upsertMetaTag(next, 'property', 'og:site_name', 'Haitech');

  if (seo.image) {
    next = upsertMetaTag(next, 'property', 'og:image', seo.image);
    if (seo.imageAlt) {
      next = upsertMetaTag(next, 'property', 'og:image:alt', seo.imageAlt);
    }
  }

  next = upsertMetaTag(next, 'name', 'twitter:card', 'summary_large_image');
  next = upsertMetaTag(next, 'name', 'twitter:title', seo.title);
  next = upsertMetaTag(next, 'name', 'twitter:description', seo.description);
  if (seo.image) {
    next = upsertMetaTag(next, 'name', 'twitter:image', seo.image);
  }

  if (seo.robots) {
    next = upsertMetaTag(next, 'name', 'robots', seo.robots);
  }

  if (seo.ogProduct) {
    const og = seo.ogProduct;
    if (og.priceAmount) {
      next = upsertMetaTag(next, 'property', 'product:price:amount', og.priceAmount);
    }
    if (og.priceCurrency) {
      next = upsertMetaTag(next, 'property', 'product:price:currency', og.priceCurrency);
    }
    if (og.priceAmountPen) {
      next = upsertMetaTag(next, 'property', 'product:pretax_price:amount', og.priceAmountPen);
    }
    if (og.availability) {
      next = upsertMetaTag(next, 'property', 'product:availability', og.availability);
    }
    if (og.brand) {
      next = upsertMetaTag(next, 'property', 'product:brand', og.brand);
    }
    if (og.retailerItemId) {
      next = upsertMetaTag(next, 'property', 'product:retailer_item_id', og.retailerItemId);
    }
  }

  if (seo.jsonLd) {
    next = upsertJsonLd(next, seo.jsonLd);
  }

  return next;
}
