import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ADMIN_MARCA_CATEGORY_SUGGESTIONS,
  ADMIN_MARCA_COUNTRY_OPTIONS,
  ADMIN_MARCA_MANAGER_OPTIONS,
  ADMIN_MARCA_ORIGIN_OPTIONS,
  createEmptyMarcaFormValues,
  findCountryOption,
  marcaRecordToFormValues,
  slugifyMarca,
  type AdminMarcaFormValues,
} from '@/lib/admin-marca-form';
import { cn } from '@/lib/utils';
import type { AdminMarcaRecord } from '@/types/admin-marcas';

interface AdminMarcaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: AdminMarcaRecord | null;
  onSubmit: (values: AdminMarcaFormValues) => Promise<void>;
  isSaving?: boolean;
}

function LogoPreview({ form }: { form: AdminMarcaFormValues }) {
  const name = form.name.trim();

  if (form.logo.trim()) {
    return (
      <img
        src={form.logo.trim()}
        alt=""
        className="size-14 rounded-lg border border-border/60 bg-white object-contain p-1"
      />
    );
  }

  return (
    <span
      className="flex size-14 items-center justify-center rounded-lg text-sm font-bold text-white"
      style={{ backgroundColor: '#111827' }}
      aria-hidden="true"
    >
      {name ? name.slice(0, 2).toUpperCase() : <ImageIcon className="size-5 opacity-70" />}
    </span>
  );
}

export function AdminMarcaFormDialog({
  open,
  onOpenChange,
  initial = null,
  onSubmit,
  isSaving = false,
}: AdminMarcaFormDialogProps) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<AdminMarcaFormValues>(() =>
    initial ? marcaRecordToFormValues(initial) : createEmptyMarcaFormValues(),
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(initial ? marcaRecordToFormValues(initial) : createEmptyMarcaFormValues());
    setSlugTouched(Boolean(initial?.slug));
    setError(null);
  }, [open, initial]);

  const title = isEdit ? 'Editar marca' : 'Nueva marca';
  const description = isEdit
    ? 'Actualiza la información de la marca en tu catálogo.'
    : 'Registra una marca o fabricante para asociarla a productos del catálogo.';

  const categoryHint = useMemo(() => ADMIN_MARCA_CATEGORY_SUGGESTIONS.join(', '), []);

  const updateForm = <K extends keyof AdminMarcaFormValues>(
    key: K,
    value: AdminMarcaFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugifyMarca(name),
    }));
  };

  const handleCountryChange = (countryLabel: string) => {
    const country = findCountryOption(countryLabel);
    if (!country) return;
    setForm((prev) => ({
      ...prev,
      country: country.label,
      countryCode: country.code,
      origin: country.origin,
    }));
  };

  const handleManagerChange = (managerName: string) => {
    const manager = ADMIN_MARCA_MANAGER_OPTIONS.find((item) => item.name === managerName);
    setForm((prev) => ({
      ...prev,
      managerName,
      managerRole: manager?.role ?? prev.managerRole,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();
    if (!name) {
      setError('El nombre de la marca es obligatorio.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        name,
        slug: form.slug.trim() || slugifyMarca(name),
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la marca.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,52rem)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id="admin-marca-form"
          className="grid max-h-[calc(92vh-8.5rem)] gap-4 overflow-y-auto px-5 py-4"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <section className="grid gap-4 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:items-start">
            <LogoPreview form={form} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="marca-name">Nombre de la marca</Label>
                <Input
                  id="marca-name"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Ej. Nexon, HP, Ricoh"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca-slug">Slug (URL)</Label>
                <Input
                  id="marca-slug"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateForm('slug', event.target.value);
                  }}
                  placeholder="nexon"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca-logo">Logo (URL)</Label>
                <Input
                  id="marca-logo"
                  value={form.logo}
                  onChange={(event) => updateForm('logo', event.target.value)}
                  placeholder="/brands/mi-marca.png"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-4 rounded-lg border border-border/60 bg-muted/20 p-4 sm:grid-cols-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">
              Origen y catálogo
            </p>

            <div className="space-y-2">
              <Label htmlFor="marca-country">País de origen</Label>
              <Select value={form.country} onValueChange={handleCountryChange}>
                <SelectTrigger id="marca-country" aria-label="País de origen">
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_MARCA_COUNTRY_OPTIONS.map((country) => (
                    <SelectItem key={country.code} value={country.label}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca-origin">Región</Label>
              <Select value={form.origin} onValueChange={(value) => updateForm('origin', value)}>
                <SelectTrigger id="marca-origin" aria-label="Región de origen">
                  <SelectValue placeholder="Seleccionar región" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_MARCA_ORIGIN_OPTIONS.map((origin) => (
                    <SelectItem key={origin} value={origin}>
                      {origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="marca-categories">Categorías asociadas</Label>
              <Textarea
                id="marca-categories"
                value={form.categories}
                onChange={(event) => updateForm('categories', event.target.value)}
                placeholder="Computación, Periféricos, Gaming"
                rows={2}
                className="min-h-[4.5rem] resize-y text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Separa con comas. Sugerencias: {categoryHint}.
              </p>
            </div>
          </section>

          <section className="grid gap-4 rounded-lg border border-border/60 bg-muted/20 p-4 sm:grid-cols-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">
              Gestión
            </p>

            <div className="space-y-2">
              <Label htmlFor="marca-manager">Gestor responsable</Label>
              <Select value={form.managerName} onValueChange={handleManagerChange}>
                <SelectTrigger id="marca-manager" aria-label="Gestor responsable">
                  <SelectValue placeholder="Seleccionar gestor" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_MARCA_MANAGER_OPTIONS.map((manager) => (
                    <SelectItem key={manager.name} value={manager.name}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca-manager-role">Cargo</Label>
              <Input
                id="marca-manager-role"
                value={form.managerRole}
                onChange={(event) => updateForm('managerRole', event.target.value)}
                placeholder="Gerente de Compras"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca-status">Estado</Label>
              <Select
                value={form.status}
                onValueChange={(value) => updateForm('status', value as AdminMarcaFormValues['status'])}
              >
                <SelectTrigger id="marca-status" aria-label="Estado de la marca">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="inactiva">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label
              htmlFor="marca-featured"
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5',
                form.featured && 'border-[hsl(var(--admin-accent))]/40 bg-[hsl(var(--admin-accent))]/5',
              )}
            >
              <Checkbox
                id="marca-featured"
                checked={form.featured}
                onCheckedChange={(checked) => updateForm('featured', checked === true)}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">Marca destacada</span>
                <span className="block text-xs text-muted-foreground">
                  Aparece en secciones promocionales del catálogo.
                </span>
              </span>
            </label>
          </section>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>

        <DialogFooter className="border-t bg-muted/10 px-5 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="admin-marca-form"
            className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-hover))]"
            disabled={isSaving}
          >
            {isSaving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear marca'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
