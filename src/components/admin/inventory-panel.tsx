import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { PackagePlus, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminInventory, useInventoryMutations } from '@/hooks/use-products';
import { formatUsd } from '@/lib/utils';
import {
  createEmptyPrices,
  PRICE_ROLE_LABELS,
  PRICE_ROLES,
  type InventoryProduct,
  type ProductRolePrices,
} from '@/types/product';

function emptyProduct(): InventoryProduct {
  return {
    id: '',
    name: '',
    description: '',
    currency: 'USD',
    stock: 0,
    category: '',
    brand: '',
    image_url: null,
    created_at: new Date().toISOString(),
    prices: createEmptyPrices(),
  };
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: InventoryProduct | null;
}

function ProductFormDialog({ open, onOpenChange, initial }: ProductFormDialogProps) {
  const isEdit = Boolean(initial?.id);
  const { createProduct, updateProduct } = useInventoryMutations();
  const [form, setForm] = useState<InventoryProduct>(initial ?? emptyProduct());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial ?? emptyProduct());
      setError(null);
    }
  }, [open, initial]);

  const updateField = <K extends keyof InventoryProduct>(key: K, value: InventoryProduct[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePrice = (key: keyof ProductRolePrices, value: string) => {
    setForm((prev) => ({
      ...prev,
      prices: { ...prev.prices, [key]: Number(value) || 0 },
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (isEdit && initial) {
        await updateProduct.mutateAsync({ id: initial.id, payload: form });
      } else {
        await createProduct.mutateAsync(form);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto');
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            Define stock y precios por rol. El precio público es el predeterminado para visitantes.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="inv-name">Nombre</Label>
              <Input
                id="inv-name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="inv-description">Descripción</Label>
              <Input
                id="inv-description"
                value={form.description ?? ''}
                onChange={(event) => updateField('description', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-category">Categoría</Label>
              <Input
                id="inv-category"
                value={form.category ?? ''}
                onChange={(event) => updateField('category', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-brand">Marca</Label>
              <Input
                id="inv-brand"
                value={form.brand ?? ''}
                onChange={(event) => updateField('brand', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-stock">Stock</Label>
              <Input
                id="inv-stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(event) => updateField('stock', Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-image">URL imagen</Label>
              <Input
                id="inv-image"
                value={form.image_url ?? ''}
                onChange={(event) => updateField('image_url', event.target.value || null)}
              />
            </div>
          </div>

          <fieldset className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
            <legend className="px-1 text-sm font-medium sm:col-span-2 lg:col-span-3">
              Precios (USD) por rol
            </legend>
            {PRICE_ROLES.map((priceRole) => (
              <div key={priceRole} className="space-y-2">
                <Label htmlFor={`price-${priceRole}`}>{PRICE_ROLE_LABELS[priceRole]}</Label>
                <Input
                  id={`price-${priceRole}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.prices[priceRole]}
                  onChange={(event) => updatePrice(priceRole, event.target.value)}
                  required={priceRole === 'public'}
                />
              </div>
            ))}
          </fieldset>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-500" disabled={isSaving}>
              {isSaving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InventoryPanel() {
  const { data: products, isLoading, isError } = useAdminInventory();
  const { deleteProduct } = useInventoryMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryProduct | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (product: InventoryProduct) => {
    setEditing(product);
    setDialogOpen(true);
  };

  const handleDelete = async (product: InventoryProduct) => {
    if (!window.confirm(`¿Eliminar "${product.name}" del inventario?`)) return;
    await deleteProduct.mutateAsync(product.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Administra stock y precios por rol: público, mayorista y distribuidor.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-500">
          <PackagePlus aria-hidden="true" />
          Nuevo producto
        </Button>
      </header>

      {isError && (
        <p role="alert" className="text-destructive">
          No se pudo cargar el inventario. Verifica que el servidor admin esté en ejecución.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              {PRICE_ROLES.map((priceRole) => (
                <th key={priceRole} className="px-4 py-3 font-medium">
                  {PRICE_ROLE_LABELS[priceRole]}
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b">
                  <td colSpan={PRICE_ROLES.length + 4} className="px-4 py-4">
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))}

            {!isLoading &&
              products?.map((product) => (
                <tr key={product.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    {product.brand && (
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {product.category ? (
                      <Badge variant="secondary">{product.category}</Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
                      {product.stock}
                    </Badge>
                  </td>
                  {PRICE_ROLES.map((priceRole) => (
                    <td key={priceRole} className="px-4 py-3 text-xs">
                      {formatUsd(product.prices[priceRole])}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Editar ${product.name}`}
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Eliminar ${product.name}`}
                        onClick={() => void handleDelete(product)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing} />
    </div>
  );
}
