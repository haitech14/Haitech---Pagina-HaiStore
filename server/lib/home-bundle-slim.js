/** Campos mínimos para tarjetas de producto en el snapshot de la home. */
function pricingMetaFromProduct(product) {
  const publicPrice = Number(product.prices?.public ?? product.price ?? 0);
  const compareAt = product.compare_at_price_usd;
  const meta = {};

  if (product.is_new === true) {
    meta.isNew = true;
  }
  if (compareAt != null && compareAt > publicPrice) {
    meta.oldPrice = compareAt;
    meta.discount = Math.round((1 - publicPrice / compareAt) * 100);
  }

  return meta;
}

export function slimHomeBundleProduct(product) {
  const prices = product.prices ?? { public: product.price ?? 0 };
  const publicPrice = Number(prices.public ?? product.price ?? 0);
  const attributes = Array.isArray(product.attributes)
    ? product.attributes.filter(
        (attr) =>
          attr?.name &&
          attr?.value &&
          !/instalación|storefront|cross.?sell|descripción larga/i.test(String(attr.name)),
      )
    : [];

  return {
    id: product.id,
    slug: product.slug ?? null,
    name: product.name,
    code: product.code ?? null,
    description: null,
    price: publicPrice,
    prices: { public: publicPrice },
    currency: product.currency ?? 'USD',
    image_url: product.image_url ?? null,
    gallery: [],
    stock: Number(product.stock ?? 0),
    category: product.category ?? null,
    brand: product.brand ?? null,
    attributes: attributes.slice(0, 8),
    sort_order: Number.isFinite(Number(product.sort_order)) ? Number(product.sort_order) : 0,
    is_featured: product.is_featured === true,
    view_count: Number(product.view_count ?? 0),
    price_role: 'public',
    created_at: product.created_at ?? new Date(0).toISOString(),
    ...pricingMetaFromProduct(product),
  };
}

export function slimHomeBundleFeaturedProduct(product) {
  const slim = slimHomeBundleProduct(product);
  const featured = {
    id: slim.id,
    name: slim.name,
    category: slim.category ?? '',
    brand: slim.brand,
    code: slim.code,
    ...(slim.attributes.length ? { attributes: slim.attributes } : {}),
    price: slim.price,
    image: slim.image_url,
    stock: slim.stock,
    rating: 5,
    reviews: 0,
  };

  if (slim.isNew) featured.isNew = true;
  if (slim.oldPrice != null) featured.oldPrice = slim.oldPrice;
  if (slim.discount != null) featured.discount = slim.discount;

  return featured;
}

function isFeaturedShape(product) {
  return Boolean(product && typeof product === 'object' && 'image' in product && !('image_url' in product));
}

export function slimHomeBundlePayload(bundle) {
  return {
    featured: bundle.featured.map((product) =>
      isFeaturedShape(product) ? product : slimHomeBundleProduct(product),
    ),
    sections: bundle.sections.map((section) => ({
      id: section.id,
      productsByCondition: Object.fromEntries(
        Object.entries(section.productsByCondition ?? {}).map(([condition, items]) => [
          condition,
          (items ?? []).map((item) =>
            isFeaturedShape(item) ? item : slimHomeBundleFeaturedProduct(item),
          ),
        ]),
      ),
    })),
  };
}
