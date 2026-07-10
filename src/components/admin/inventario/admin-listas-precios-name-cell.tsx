import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { InventoryInlineField } from '@/components/admin/inventory/inventory-inline-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatInventoryProductName } from '@/lib/inventory-product-name';
import { buildProductPath } from '@/lib/product-slug';
import type { InventoryProduct } from '@/types/product';

interface AdminListasPreciosNameCellProps {
  product: InventoryProduct;
  name: string;
  subtitle?: string | null;
  activeFieldId: string | null;
  onActivate: (fieldId: string) => void;
  onClose: () => void;
  onPatch: (patch: Partial<InventoryProduct>) => Promise<void>;
}

function fieldKey(productId: string) {
  return `${productId}:name`;
}

export function AdminListasPreciosNameCell({
  product,
  name,
  subtitle,
  activeFieldId,
  onActivate,
  onClose,
  onPatch,
}: AdminListasPreciosNameCellProps) {
  const key = fieldKey(product.id);
  const storefrontPath = buildProductPath(product);

  const saveName = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === product.name) {
      onClose();
      return;
    }

    try {
      await onPatch({ name: trimmed });
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar el nombre del producto',
      );
    }
  };

  return (
    <div className="flex min-w-0 max-w-[460px] items-start gap-1">
      <div className="min-w-0 flex-1">
        <InventoryInlineField
          fieldId={key}
          activeFieldId={activeFieldId}
          onActivate={() => onActivate(key)}
          onClose={onClose}
          display={
            <div className="min-w-0 max-w-[420px]">
              <p
                className="line-clamp-2 text-sm font-semibold leading-snug text-foreground"
                title={formatInventoryProductName(name)}
              >
                {formatInventoryProductName(name)}
              </p>
              {subtitle ? (
                <p className="truncate text-xs text-muted-foreground" title={subtitle}>
                  {subtitle}
                </p>
              ) : null}
            </div>
          }
          edit={
            <Input
              className="h-8 text-xs"
              defaultValue={product.name}
              aria-label="Nombre del producto"
              autoFocus
              onBlur={(event) => void saveName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void saveName(event.currentTarget.value);
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  onClose();
                }
              }}
            />
          }
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
        asChild
      >
        <a
          href={storefrontPath}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver el producto"
          aria-label={`Ver el producto ${formatInventoryProductName(name)}`}
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </Button>
    </div>
  );
}
