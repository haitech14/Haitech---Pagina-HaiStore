import { PRODUCT_IMAGE_MAX_EDGE } from '@/lib/product-media-upload-limits';

/** Quita extensión de imagen para construir rutas de variantes WebP. */
const RESPONSIVE_WIDTH_SUFFIX_WITHOUT_EXT = /-(256|512|768|1024|1280|1920|2560)$/i;

export function imageBasePath(imagePath: string): string {
  const path = imagePath.split('?')[0].split('#')[0];
  const withoutExt = path.replace(/\.(png|jpe?g|webp|avif)$/i, '');
  if (
    withoutExt.startsWith('/products/') &&
    RESPONSIVE_WIDTH_SUFFIX_WITHOUT_EXT.test(withoutExt)
  ) {
    return withoutExt.replace(RESPONSIVE_WIDTH_SUFFIX_WITHOUT_EXT, '');
  }
  return withoutExt;
}

/** URL canónica de la imagen principal (máxima calidad disponible en build). */
export function productImageMasterUrl(imagePath: string): string {
  const base = imageBasePath(imagePath);
  const q = imageCacheQuery(imagePath);
  return `${base}.webp${q}`;
}

/** Variantes WebP del hero banner (fiestaspatriasbanner-768.webp, etc.). */
export function heroSingleAssetSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrcSet: `${base}-768.webp 768w, ${base}-1280.webp 1280w, ${base}-1920.webp 1920w`,
    fallbackSrc: imagePath,
    sizes: '(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1920px',
  };
}

/** Banners de categoría en fila (~1/3 del contenedor en desktop). */
export function categoryHeroBannerSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrcSet: `${base}-640.webp 640w, ${base}-960.webp 960w, ${base}.webp 1672w`,
    fallbackSrc: imagePath,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 420px',
  };
}

/** Variantes WebP para imágenes de categoría (círculos ~176px). */
export function categoryImageSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrcSet: `${base}-256.webp 256w, ${base}-512.webp 512w`,
    fallbackSrc: imagePath,
    sizes: '(max-width: 640px) 100px, 176px',
  };
}

/** Variantes WebP para logos de clientes. */
export function clientLogoSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrc: `${base}-200.webp`,
    fallbackSrc: imagePath,
  };
}

/** Variantes WebP para fotos de testimonios. */
export function recommendationImageSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrc: `${base}-400.webp`,
    fallbackSrc: imagePath,
  };
}

/** Variantes WebP para logos de marcas en marquee. */
export function brandLogoSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrc: `${base}-160.webp`,
    fallbackSrc: imagePath,
  };
}

/** Variantes WebP para promo cards. */
export function promoCardImageSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrcSet: `${base}-256.webp 256w, ${base}-512.webp 512w`,
    fallbackSrc: imagePath,
    sizes: '(max-width: 640px) 45vw, 280px',
  };
}

/** Conserva `?v=` (u otros query) para que srcset no ignore el cache-bust del inventario. */
function imageCacheQuery(imagePath: string): string {
  if (!imagePath.includes('?')) return '';
  const query = `?${imagePath.split('?')[1]?.split('#')[0] ?? ''}`;
  return query === '?' ? '' : query;
}

/** Variantes WebP para imágenes de producto en cards (~220px). */
export function productCardImageSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  const q = imageCacheQuery(imagePath);
  return {
    webpSrcSet: `${base}-256.webp${q} 256w, ${base}-512.webp${q} 512w`,
    fallbackSrc: imagePath,
    sizes: '(max-width: 640px) 45vw, 220px',
  };
}

/** Variantes WebP para ficha de producto (miniatura y vista principal). */
export function productDetailThumbnailSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  const q = imageCacheQuery(imagePath);
  return {
    webpSrcSet: `${base}-256.webp${q} 256w, ${base}-512.webp${q} 512w`,
    fallbackSrc: productImageMasterUrl(imagePath),
    sizes: '80px',
  };
}

export function productDetailMainImageSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  const q = imageCacheQuery(imagePath);
  const master = productImageMasterUrl(imagePath);
  // Prioriza la master (hasta PRODUCT_IMAGE_MAX_EDGE) en retina / Ampliar.
  return {
    webpSrcSet: `${base}-1024.webp${q} 1024w, ${master} ${PRODUCT_IMAGE_MAX_EDGE}w`,
    fallbackSrc: master,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 720px',
  };
}

/** Vista rápida: contenedor más estrecho, misma prioridad de calidad que ficha. */
export function productQuickViewMainImageSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  const q = imageCacheQuery(imagePath);
  const master = productImageMasterUrl(imagePath);
  return {
    webpSrcSet: `${base}-1024.webp${q} 1024w, ${master} ${PRODUCT_IMAGE_MAX_EDGE}w`,
    fallbackSrc: master,
    sizes: '(max-width: 1024px) 90vw, 520px',
  };
}

/** Pathname sin query/hash (permite `?v=` de cache-bust sin perder -256/-512). */
export function imagePathname(imagePath: string): string {
  return imagePath.split('?')[0].split('#')[0];
}

/** True si la ruta admite variantes responsive generadas en build. */
export function supportsResponsiveProductImage(imagePath: string): boolean {
  if (!imagePath || imagePath.startsWith('data:')) return false;
  const path = imagePathname(imagePath);
  return (
    path.startsWith('/products/') ||
    path.startsWith('/categories/') ||
    path.startsWith('/promo-cards/')
  );
}
