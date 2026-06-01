import type { Product } from '@/types/product';

/** URLs de imagen del inventario (principal + galería), sin duplicados. */
export function collectProductImageUrls(
  product: Pick<Product, 'image_url' | 'gallery'>,
): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const add = (url: string | null | undefined) => {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  };

  add(product.image_url);
  for (const url of product.gallery ?? []) {
    add(url);
  }

  return urls;
}
