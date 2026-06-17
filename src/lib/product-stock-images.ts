/** Imágenes curadas por modelo (nombre/código). */
export const PRODUCT_MODEL_STOCK_IMAGES = [
  { pattern: /\bim\s*430\s*f\b/i, image: '/products/ricoh-im-430f.webp' },
  { pattern: /\bim\s*460\s*f\b/i, image: '/products/ricoh-im-430f.webp' },
  { pattern: /\bim\s*5000\b/i, image: '/categories/multifuncionales.png' },
  { pattern: /\bim\s*600\s*f\b/i, image: '/categories/multifuncionales.png' },
  { pattern: /\bim\s*c320\s*f\b/i, image: '/categories/multifuncionales.png' },
  { pattern: /\bm\s*c320\s*fw\b/i, image: '/categories/multifuncionales.png' },
  { pattern: /\bm\s*320\s*f\b/i, image: '/categories/multifuncionales.png' },
  { pattern: /\bmp\s*305\s*\+?\b/i, image: '/categories/multifuncionales.png' },
  { pattern: /\bp\s*c600\b/i, image: '/categories/impresoras.png' },
  { pattern: /\bim\s*c3000\b/i, image: '/categories/multifuncionales.png' },
  { pattern: /\bsp\s*330\s*dn\b/i, image: '/categories/impresoras.png' },
] as const;

export function sanitizeProductId(productId: string | undefined | null): string {
  return String(productId ?? 'product')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function publicProductMediaPath(productId: string | undefined | null, index = 0): string {
  const base = sanitizeProductId(productId);
  const suffix = index > 0 ? `-${index + 1}` : '';
  return `/products/${base}${suffix}.webp`;
}

type ProductStockImageSource = {
  id?: string;
  code?: string | null;
  name?: string;
  category?: string | null;
  brand?: string | null;
};

function isConsumableProductName(haystack: string): boolean {
  const normalized = haystack
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  return (
    /\b(toner|cartucho|cartridge|drum|tambor|fusor|fusing|rodillo|gabinete|repuesto|suministro|unidad de imagen)\b/.test(
      normalized,
    )
  );
}

export function resolveProductModelStockImage(product: ProductStockImageSource): string | null {
  const haystack = `${product.code ?? ''} ${product.name ?? ''} ${product.brand ?? ''}`.trim();
  if (!haystack) return null;

  if (isConsumableProductName(haystack)) return null;

  for (const entry of PRODUCT_MODEL_STOCK_IMAGES) {
    if (entry.pattern.test(haystack)) {
      return entry.image;
    }
  }

  return null;
}

export function resolveProductCategoryStockImage(product: ProductStockImageSource): string {
  const haystack = `${product.category ?? ''} ${product.name ?? ''} ${product.brand ?? ''}`.toLowerCase();

  if (product.category === 'Accesorios' || haystack.startsWith('accesorios ')) {
    return '/categories/accesorios-impresoras.png';
  }

  if (haystack.includes('multifuncional')) {
    if (haystack.includes('remanufactur') || haystack.includes('reacondicion')) {
      return '/promotions/promo-hero-multifuncionales.png';
    }
    return '/categories/multifuncionales.png';
  }

  if (haystack.includes('impresor')) {
    return '/categories/impresoras.png';
  }

  if (
    haystack.includes('toner') ||
    haystack.includes('tóner') ||
    haystack.includes('suministro') ||
    haystack.includes('repuesto')
  ) {
    return '/categories/toner-suministros.png';
  }

  if (haystack.includes('escáner') || haystack.includes('escaner')) {
    return '/categories/escaneres.png';
  }

  if (haystack.includes('plotter') || haystack.includes('formato ancho')) {
    return '/categories/formato-ancho.png';
  }

  if (haystack.includes('monitor')) {
    return '/categories/monitores.png';
  }

  if (haystack.includes('laptop') || haystack.includes('computadora')) {
    return '/categories/computadoras-laptop.png';
  }

  if (haystack.includes('alquiler')) {
    return '/categories/alquiler.png';
  }

  return '/promo-cards/b2b-printer.png';
}
