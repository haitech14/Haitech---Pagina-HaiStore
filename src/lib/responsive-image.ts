/** Quita extensión de imagen para construir rutas de variantes WebP. */
export function imageBasePath(imagePath: string): string {
  const path = imagePath.split('?')[0].split('#')[0];
  return path.replace(/\.(png|jpe?g|webp|avif)$/i, '');
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

/** Variantes WebP para imágenes de producto en cards (~220px). */
export function productCardImageSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrcSet: `${base}-256.webp 256w, ${base}-512.webp 512w`,
    fallbackSrc: imagePath,
    sizes: '(max-width: 640px) 45vw, 220px',
  };
}

/** Variantes WebP para ficha de producto (miniatura y vista principal). */
export function productDetailThumbnailSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrcSet: `${base}-256.webp 256w, ${base}-512.webp 512w`,
    fallbackSrc: imagePath,
    sizes: '80px',
  };
}

export function productDetailMainImageSources(imagePath: string) {
  const base = imageBasePath(imagePath);
  return {
    webpSrcSet: `${base}-512.webp 512w, ${base}-1024.webp 1024w, ${base}.webp ${1920}w`,
    fallbackSrc: imagePath,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 720px',
  };
}

/** True si la ruta admite variantes responsive generadas en build. */
export function supportsResponsiveProductImage(imagePath: string): boolean {
  if (!imagePath || imagePath.startsWith('data:')) return false;
  if (imagePath.includes('?')) return false;
  const path = imagePath.split('?')[0].split('#')[0];
  return (
    path.startsWith('/products/') ||
    path.startsWith('/categories/') ||
    path.startsWith('/promo-cards/')
  );
}
