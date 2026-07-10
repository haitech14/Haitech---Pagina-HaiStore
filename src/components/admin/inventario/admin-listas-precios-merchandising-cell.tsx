import { useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { normalizeMerchandisingProductIds } from '@/lib/product-merchandising';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

export type MerchandisingRelationKind = 'cross_sell' | 'upsell';

interface AdminListasPreciosMerchandisingCellProps {
  product: InventoryProduct;
  products: InventoryProduct[];
  kind: MerchandisingRelationKind;
  onPatch: (patch: Partial<InventoryProduct>) => Promise<void>;
}

const KIND_META: Record<
  MerchandisingRelationKind,
  {
    field: 'cross_sell_product_ids' | 'upsell_product_ids';
    optionalField: 'cross_sell_optional_products' | 'upsell_optional_products';
    label: string;
    emptyLabel: string;
    ariaLabel: (name: string) => string;
  }
> = {
  cross_sell: {
    field: 'cross_sell_product_ids',
    optionalField: 'cross_sell_optional_products',
    label: 'Venta cruzada',
    emptyLabel: 'Sin venta cruzada',
    ariaLabel: (name) => `Venta cruzada de ${name}`,
  },
  upsell: {
    field: 'upsell_product_ids',
    optionalField: 'upsell_optional_products',
    label: 'Upsells',
    emptyLabel: 'Sin upsells',
    ariaLabel: (name) => `Upsells de ${name}`,
  },
};

function MerchandisingPreview({
  selectedIds,
  productById,
  optionalCount,
}: {
  selectedIds: string[];
  productById: Map<string, string>;
  optionalCount: number;
}) {
  const total = selectedIds.length + optionalCount;
  if (total === 0) {
    return <span className="text-[0.6875rem] text-muted-foreground">—</span>;
  }

  const firstId = selectedIds[0];
  const firstName = firstId ? (productById.get(firstId) ?? firstId) : null;
  const linkedRest = Math.max(0, selectedIds.length - (firstName ? 1 : 0));

  return (
    <div className="min-w-0" title={[...selectedIds.map((id) => productById.get(id) ?? id)].join(' · ')}>
      {firstName ? (
        <p className="truncate text-[0.6875rem] text-foreground">{firstName}</p>
      ) : (
        <Badge
          variant="outline"
          className="h-5 max-w-full justify-start truncate px-1.5 font-normal tabular-nums"
        >
          {optionalCount} opc.
        </Badge>
      )}
      {linkedRest > 0 || (firstName && optionalCount > 0) ? (
        <p className="text-[0.625rem] tabular-nums text-muted-foreground">
          {linkedRest > 0 ? `+${linkedRest} más` : null}
          {linkedRest > 0 && optionalCount > 0 ? ' · ' : null}
          {optionalCount > 0 ? `+${optionalCount} opc.` : null}
        </p>
      ) : null}
    </div>
  );
}

export function AdminListasPreciosMerchandisingCell({
  product,
  products,
  kind,
  onPatch,
}: AdminListasPreciosMerchandisingCellProps) {
  const meta = KIND_META[kind];
  const selectedIds = useMemo(
    () => normalizeMerchandisingProductIds(product[meta.field]),
    [meta.field, product],
  );
  const optionalCount = product[meta.optionalField]?.length ?? 0;

  const [open, setOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const productById = useMemo(
    () => new Map(products.map((entry) => [entry.id, entry.name])),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sorted = [...products]
      .filter((entry) => entry.id !== product.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (!normalizedQuery) return sorted;
    return sorted.filter((entry) => {
      const haystack = `${entry.name} ${entry.code ?? ''} ${entry.id}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [product.id, products, query]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraftIds(selectedIds);
      setQuery('');
    }
    setOpen(next);
  };

  const toggleId = (id: string, checked: boolean) => {
    setDraftIds((current) =>
      checked
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((entry) => entry !== id),
    );
  };

  const handleApply = async () => {
    const nextIds = normalizeMerchandisingProductIds(draftIds);
    const prev = selectedIds.join('\0');
    const next = nextIds.join('\0');
    if (prev === next) {
      setOpen(false);
      return;
    }

    setSaving(true);
    try {
      await onPatch({ [meta.field]: nextIds });
      toast.success(
        nextIds.length === 0
          ? `${meta.label} vaciado`
          : nextIds.length === 1
            ? `1 producto en ${meta.label.toLowerCase()}`
            : `${nextIds.length} productos en ${meta.label.toLowerCase()}`,
      );
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `No se pudo actualizar ${meta.label.toLowerCase()}`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={saving}
          role="combobox"
          aria-expanded={open}
          aria-label={meta.ariaLabel(product.name)}
          className={cn(
            'h-auto min-h-7 w-full min-w-[5.5rem] justify-between gap-1 px-1 py-0.5 text-left font-normal shadow-none hover:bg-muted/50',
          )}
        >
          <MerchandisingPreview
            selectedIds={selectedIds}
            productById={productById}
            optionalCount={optionalCount}
          />
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(100vw-2rem,22rem)] p-0"
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="space-y-2 border-b p-3">
          <p className="text-sm font-medium text-foreground">{meta.label}</p>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, código o ID…"
            className="h-8 text-xs"
            aria-label={`Buscar productos para ${meta.label}`}
          />
        </div>
        <ul className="max-h-56 overflow-y-auto p-2" role="listbox" aria-label={meta.label}>
          {filteredProducts.length === 0 ? (
            <li className="px-2 py-4 text-center text-xs text-muted-foreground">
              No hay productos que coincidan.
            </li>
          ) : (
            filteredProducts.map((entry) => {
              const checked = draftIds.includes(entry.id);
              return (
                <li key={entry.id}>
                  <label
                    className={cn(
                      'flex min-h-9 cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/60',
                      checked && 'bg-muted/40',
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleId(entry.id, value === true)}
                      aria-label={entry.name}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block font-medium text-foreground">
                        {entry.name}
                      </span>
                      <span className="mt-0.5 block text-[0.625rem] text-muted-foreground">
                        {entry.code || entry.id}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })
          )}
        </ul>
        {optionalCount > 0 ? (
          <p className="border-t px-3 py-2 text-[0.625rem] text-muted-foreground">
            {optionalCount} producto{optionalCount === 1 ? '' : 's'} opcional
            {optionalCount === 1 ? '' : 'es'} (editar en ficha del producto).
          </p>
        ) : null}
        <div className="flex justify-end gap-2 border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8"
            disabled={saving}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8"
            disabled={saving}
            onClick={() => void handleApply()}
          >
            {saving ? 'Guardando…' : 'Aplicar'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
