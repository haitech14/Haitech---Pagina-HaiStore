import { useMemo, useState } from 'react';
import { ChevronsUpDown, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { normalizeMerchandisingProductIds } from '@/lib/product-merchandising';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

import type { MerchandisingCatalogEntry } from './admin-listas-precios-merchandising-cell';

interface AdminInventarioVariantsCellProps {
  product: InventoryProduct;
  catalog: MerchandisingCatalogEntry[];
  productById: Map<string, string>;
  onPatch: (patch: Partial<InventoryProduct>) => Promise<void>;
}

function VariantsPreview({
  selectedIds,
  productById,
}: {
  selectedIds: string[];
  productById: Map<string, string>;
}) {
  if (selectedIds.length === 0) {
    return <span className="text-[0.6875rem] text-muted-foreground">—</span>;
  }

  const firstId = selectedIds[0];
  const firstName = productById.get(firstId) ?? firstId;
  const rest = selectedIds.length - 1;

  return (
    <div
      className="min-w-0"
      title={selectedIds.map((id) => productById.get(id) ?? id).join(' · ')}
    >
      <p className="truncate text-[0.6875rem] text-foreground">{firstName}</p>
      {rest > 0 ? (
        <p className="text-[0.625rem] tabular-nums text-muted-foreground">+{rest} más</p>
      ) : (
        <p className="text-[0.625rem] tabular-nums text-muted-foreground">
          {selectedIds.length} variante{selectedIds.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}

export function AdminInventarioVariantsCell({
  product,
  catalog,
  productById,
  onPatch,
}: AdminInventarioVariantsCellProps) {
  const selectedIds = useMemo(
    () => normalizeMerchandisingProductIds(product.variant_product_ids),
    [product.variant_product_ids],
  );

  const [open, setOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!open) return [];
    const normalizedQuery = query.trim().toLowerCase();
    const withoutSelf = catalog.filter((entry) => entry.id !== product.id);
    if (!normalizedQuery) return withoutSelf;
    return withoutSelf.filter((entry) => {
      const haystack = `${entry.name} ${entry.code ?? ''} ${entry.id}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [catalog, open, product.id, query]);

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
    if (selectedIds.join('\0') === nextIds.join('\0')) {
      setOpen(false);
      return;
    }

    setSaving(true);
    try {
      await onPatch({ variant_product_ids: nextIds });
      toast.success(
        nextIds.length === 0
          ? 'Variantes vaciadas'
          : nextIds.length === 1
            ? '1 variante vinculada'
            : `${nextIds.length} variantes vinculadas`,
      );
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudieron actualizar las variantes',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group flex min-h-7 min-w-0 items-center gap-1">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            role="combobox"
            aria-expanded={open}
            aria-label={`Variantes de ${product.name}`}
            className={cn(
              'h-auto min-h-5 w-full min-w-[4.5rem] justify-between gap-1 px-1 py-0.5 text-left text-[0.6875rem] leading-tight font-normal shadow-none hover:bg-muted/50',
            )}
          >
            <VariantsPreview selectedIds={selectedIds} productById={productById} />
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(100vw-2rem,22rem)] p-0"
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="space-y-2 border-b p-3">
            <p className="text-sm font-medium text-foreground">Variantes</p>
            <p className="text-[0.65rem] text-muted-foreground">
              Vincula otros productos del inventario como variantes de este.
            </p>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, código o ID…"
              className="h-8 text-xs"
              aria-label="Buscar productos para variantes"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-2" role="listbox" aria-label="Variantes">
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
                        <span className="block truncate font-medium text-foreground">
                          {entry.name}
                        </span>
                        {entry.code ? (
                          <span className="block truncate text-[0.65rem] text-muted-foreground">
                            {entry.code}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
          <div className="flex items-center justify-between gap-2 border-t p-2">
            <p className="text-[0.65rem] text-muted-foreground">
              {draftIds.length === 0
                ? 'Sin variantes'
                : `${draftIds.length} seleccionado${draftIds.length === 1 ? '' : 's'}`}
            </p>
            <Button type="button" size="sm" disabled={saving} onClick={() => void handleApply()}>
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-7 shrink-0 shadow-sm opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        onClick={() => handleOpenChange(true)}
        aria-label="Editar variantes"
      >
        <Pencil className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
