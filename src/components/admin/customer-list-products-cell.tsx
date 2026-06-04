import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';
import type { StoreCustomerWithRole } from '@/types/store';

interface CustomerListProductsCellProps {
  customer: StoreCustomerWithRole;
  products: InventoryProduct[];
  disabled?: boolean;
  onSave: (productIds: string[]) => void;
  isSaving?: boolean;
}

function normalizeProductIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string' && id.length > 0);
}

export function CustomerListProductsCell({
  customer,
  products,
  disabled,
  onSave,
  isSaving,
}: CustomerListProductsCellProps) {
  const savedIds = normalizeProductIds(customer.productos_interes);
  const [open, setOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>(savedIds);
  const [query, setQuery] = useState('');

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p.name])),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (!q) return sorted;
    return sorted.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const triggerLabel = useMemo(() => {
    if (savedIds.length === 0) return 'Seleccionar';
    if (savedIds.length === 1) {
      return productById.get(savedIds[0]!) ?? '1 producto';
    }
    return `${savedIds.length} productos`;
  }, [savedIds, productById]);

  const toggleId = (id: string, checked: boolean) => {
    setDraftIds((prev) =>
      checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id),
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraftIds(savedIds);
      setQuery('');
    }
    setOpen(next);
  };

  const handleApply = () => {
    const next = [...draftIds].sort();
    const prev = [...savedIds].sort();
    if (next.join(',') === prev.join(',')) {
      setOpen(false);
      return;
    }
    onSave(draftIds);
    setOpen(false);
  };

  if (disabled) {
    return (
      <span className="text-xs text-muted-foreground" title={triggerLabel}>
        {savedIds.length === 0 ? '—' : triggerLabel}
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 max-w-[14rem] justify-between gap-1 truncate text-xs font-normal"
          disabled={isSaving}
          aria-label={`Productos de interés de ${customer.full_name ?? customer.email}`}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(100vw-2rem,20rem)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2 border-b p-3">
          <p className="text-xs font-medium text-foreground">Productos de interés</p>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto…"
            className="h-9 text-xs"
            aria-label="Buscar producto"
          />
        </div>
        <ul
          className="max-h-52 overflow-y-auto p-2"
          role="listbox"
          aria-label="Lista de productos"
        >
          {filteredProducts.length === 0 ? (
            <li className="px-2 py-4 text-center text-xs text-muted-foreground">
              No hay productos que coincidan.
            </li>
          ) : (
            filteredProducts.map((product) => {
              const checked = draftIds.includes(product.id);
              return (
                <li key={product.id}>
                  <label
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/60',
                      checked && 'bg-muted/40',
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleId(product.id, value === true)}
                      aria-label={product.name}
                    />
                    <span className="line-clamp-2 flex-1">{product.name}</span>
                  </label>
                </li>
              );
            })
          )}
        </ul>
        <div className="flex justify-end gap-2 border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9"
            disabled={isSaving}
            onClick={handleApply}
          >
            Guardar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
