import { ProductAttributeBadges } from '@/components/product-attribute-badges';
import type { Product } from '@/types/product';

interface ProductDetailAttributeBadgesProps {
  product: Product;
}

export function ProductDetailAttributeBadges({ product }: ProductDetailAttributeBadgesProps) {
  return <ProductAttributeBadges product={product} />;
}
