import { useEffect, useState, type FormEvent } from 'react';

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
import type { StoreCategory } from '@/types/store-category';

export interface CategoryFormValues {
  name: string;
  slug: string;
  tagline: string;
  image: string;
  inventoryLabels: string;
  parentId: string | null;
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initial?: Partial<StoreCategory>;
  parentId?: string | null;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  isSaving: boolean;
}

function toFormValues(
  initial?: Partial<StoreCategory>,
  parentId?: string | null,
): CategoryFormValues {
  return {
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    tagline: initial?.tagline ?? '',
    image: initial?.image ?? '',
    inventoryLabels: (initial?.inventoryLabels ?? []).join(', '),
    parentId: initial?.parentId ?? parentId ?? null,
  };
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  title,
  description,
  initial,
  parentId,
  onSubmit,
  isSaving,
}: CategoryFormDialogProps) {
  const [form, setForm] = useState<CategoryFormValues>(() => toFormValues(initial, parentId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(toFormValues(initial, parentId));
      setError(null);
    }
  }, [open, initial, parentId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la categoría');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nombre</Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-slug">Slug (URL)</Label>
            <Input
              id="cat-slug"
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="multifuncionales"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-labels">Etiquetas de inventario</Label>
            <Input
              id="cat-labels"
              value={form.inventoryLabels}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, inventoryLabels: event.target.value }))
              }
              placeholder="Multifuncionales, Impresoras láser"
            />
            <p className="text-xs text-muted-foreground">
              Nombres de categoría en productos del inventario, separados por coma.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-tagline">Descripción corta</Label>
            <Input
              id="cat-tagline"
              value={form.tagline}
              onChange={(event) => setForm((prev) => ({ ...prev, tagline: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-image">Imagen (URL)</Label>
            <Input
              id="cat-image"
              value={form.image}
              onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
              placeholder="/categories/multifuncionales.png"
            />
          </div>

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
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
