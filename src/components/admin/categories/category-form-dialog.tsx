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
import { categoryFieldsFromName } from '@/lib/category-form-utils';
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

interface FieldTouchedState {
  slug: boolean;
  inventoryLabels: boolean;
  tagline: boolean;
  image: boolean;
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

function touchedFromInitial(initial?: Partial<StoreCategory>): FieldTouchedState {
  return {
    slug: Boolean(initial?.slug?.trim()),
    inventoryLabels: Boolean((initial?.inventoryLabels ?? []).length),
    tagline: Boolean(initial?.tagline?.trim()),
    image: Boolean(initial?.image?.trim()),
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
  const [touched, setTouched] = useState<FieldTouchedState>(() => touchedFromInitial(initial));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(toFormValues(initial, parentId));
      setTouched(touchedFromInitial(initial));
      setError(null);
    }
  }, [open, initial, parentId]);

  const handleNameChange = (name: string) => {
    const derived = categoryFieldsFromName(name);

    setForm((prev) => ({
      ...prev,
      name,
      slug: touched.slug ? prev.slug : derived.slug,
      inventoryLabels: touched.inventoryLabels ? prev.inventoryLabels : derived.inventoryLabels,
      tagline: touched.tagline ? prev.tagline : derived.tagline,
      image: touched.image ? prev.image : derived.image,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const derived = categoryFieldsFromName(form.name);
    const payload: CategoryFormValues = {
      ...form,
      slug: form.slug.trim() || derived.slug,
      inventoryLabels: form.inventoryLabels.trim() || derived.inventoryLabels,
      tagline: form.tagline.trim() || derived.tagline,
      image: form.image.trim() || derived.image,
    };

    try {
      await onSubmit(payload);
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
              onChange={(event) => handleNameChange(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-slug">Slug (URL)</Label>
            <Input
              id="cat-slug"
              value={form.slug}
              onChange={(event) => {
                setTouched((prev) => ({ ...prev, slug: true }));
                setForm((prev) => ({ ...prev, slug: event.target.value }));
              }}
              placeholder="multifuncionales"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-labels">Etiquetas de inventario</Label>
            <Input
              id="cat-labels"
              value={form.inventoryLabels}
              onChange={(event) => {
                setTouched((prev) => ({ ...prev, inventoryLabels: true }));
                setForm((prev) => ({ ...prev, inventoryLabels: event.target.value }));
              }}
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
              onChange={(event) => {
                setTouched((prev) => ({ ...prev, tagline: true }));
                setForm((prev) => ({ ...prev, tagline: event.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-image">Imagen (URL)</Label>
            <Input
              id="cat-image"
              value={form.image}
              onChange={(event) => {
                setTouched((prev) => ({ ...prev, image: true }));
                setForm((prev) => ({ ...prev, image: event.target.value }));
              }}
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
