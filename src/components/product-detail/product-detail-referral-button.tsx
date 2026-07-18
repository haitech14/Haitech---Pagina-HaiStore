import { useMemo, useState } from 'react';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { clipboardPriceFieldsFromDisplay, useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { copyProductTextToClipboard } from '@/lib/copy-product-to-clipboard';
import { inferColor } from '@/lib/category-catalog-filters';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import { buildProductClipboardPayload } from '@/lib/product-clipboard-text';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailReferralButtonProps {
  product: Product;
  className?: string;
}

export function ProductDetailReferralButton({
  product,
  className,
}: ProductDetailReferralButtonProps) {
  const [copying, setCopying] = useState(false);
  const detailPath = useMemo(() => productPath(product), [product]);
  const { title } = useMemo(() => getProductCardTitleContent(product), [product]);
  const condition = resolveProductCardBadgeLabel(product);
  const isColorProduct = inferColor(product) === 'Color';
  const displayPrice = useCatalogDisplayPrice(product);
  const code = product.code?.trim() || null;

  const handleClick = async () => {
    if (copying) return;
    setCopying(true);
    try {
      const payload = buildProductClipboardPayload({
        title,
        stock: product.stock,
        ...clipboardPriceFieldsFromDisplay(displayPrice),
        productId: product.id,
        productPath: detailPath,
        isColorProduct,
        ...(code != null ? { code } : {}),
        ...(condition != null ? { condition } : {}),
        ...(product.category != null ? { category: product.category } : {}),
        ...(product.volume_role_prices != null
          ? { volumeRolePrices: product.volume_role_prices }
          : {}),
        ...(product.delivery_time != null ? { deliveryTime: product.delivery_time } : {}),
      });

      const ok = await copyProductTextToClipboard({
        plain: payload.plain,
        html: payload.html,
      });

      if (ok) {
        toast.success('Datos de referido copiados 📋');
        return;
      }
      toast.error('No se pudo copiar el referido');
    } finally {
      setCopying(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        'h-9 shrink-0 gap-1.5 border-border text-foreground hover:bg-muted/50 focus-visible:ring-red-600',
        className,
      )}
      disabled={copying}
      onClick={() => {
        void handleClick();
      }}
      title="Copiar datos del producto para compartir como referido"
      aria-label="Copiar referido del producto"
    >
      <Share2 className="size-3.5" aria-hidden="true" />
      {copying ? 'Copiando…' : 'Referido'}
    </Button>
  );
}
