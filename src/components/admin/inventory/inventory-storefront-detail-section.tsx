import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowDownUp,
  LayoutGrid,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';

import { InventoryFormSection } from '@/components/admin/inventory/inventory-form-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateDefaultStorefrontDetail, isPrinterEquipment } from '@/lib/build-product-detail';
import {
  descriptionTextToHeroBullets,
  heroBulletsToDescriptionText,
  isStorefrontIconKey,
  normalizeStorefrontHeroBullets,
  resolveStorefrontIcon,
  STOREFRONT_ICON_KEYS,
  STOREFRONT_ICON_LABELS,
} from '@/lib/product-storefront-detail';
import { cn } from '@/lib/utils';
import type { InventoryProduct, Product } from '@/types/product';
import type { StoredHeroBullet } from '@/types/product-storefront';

interface InventoryStorefrontDetailSectionProps {
  form: InventoryProduct;
  onChange: (patch: Partial<InventoryProduct>) => void;
  /** Render without the outer card — for placing inside another section. */
  embedded?: boolean;
  /**
   * `horizontal` matches the mockup strip of icon + short label tiles.
   * `list` keeps the taller icon+texto editors.
   */
  variant?: 'horizontal' | 'list';
}

function inventoryProductAsCatalogProduct(form: InventoryProduct): Product {
  return {
    ...form,
    price: form.prices.public ?? 0,
    description: form.description ?? null,
  };
}

/** Editor-friendly bullets: keep blank draft rows (save path still normalizes them away). */
function coerceEditorHeroBullets(
  value: StoredHeroBullet[] | null | undefined,
): StoredHeroBullet[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is StoredHeroBullet => Boolean(item && typeof item === 'object'))
    .map((item) => {
      const icon = item.icon?.trim();
      return {
        icon: icon && isStorefrontIconKey(icon) ? icon : 'Printer',
        text: typeof item.text === 'string' ? item.text : '',
      };
    })
    .slice(0, 12);
}

function descriptionFromHeroBullets(bullets: StoredHeroBullet[]): string {
  return bullets
    .map((item) => item.text.trim())
    .filter(Boolean)
    .join('\n');
}

export function InventoryStorefrontDetailSection({
  form,
  onChange,
  embedded = false,
  variant = 'horizontal',
}: InventoryStorefrontDetailSectionProps) {
  const isPrinter = isPrinterEquipment(inventoryProductAsCatalogProduct(form));
  const [toolsOpen, setToolsOpen] = useState(false);

  const heroBullets = useMemo(
    () => coerceEditorHeroBullets(form.storefront_hero_bullets),
    [form.storefront_hero_bullets],
  );

  /** Keep description as one line per bullet so the ficha and form stay in sync while typing. */
  const commitHeroBullets = useCallback(
    (next: StoredHeroBullet[]) => {
      const normalized = normalizeStorefrontHeroBullets(next);
      onChange({
        storefront_hero_bullets: normalized,
        description: heroBulletsToDescriptionText(normalized),
      });
    },
    [onChange],
  );

  const syncFromAttributes = useCallback(() => {
    const catalogProduct = inventoryProductAsCatalogProduct(form);
    const generated = generateDefaultStorefrontDetail(catalogProduct);
    commitHeroBullets(generated.heroBullets);
  }, [commitHeroBullets, form]);

  useEffect(() => {
    if (!isPrinter) return;
    const hasBullets = normalizeStorefrontHeroBullets(form.storefront_hero_bullets).length > 0;
    const hasDescription = Boolean(form.description?.trim());
    if (hasBullets || hasDescription) return;

    const generated = generateDefaultStorefrontDetail(inventoryProductAsCatalogProduct(form));
    if (generated.heroBullets.length === 0) return;

    commitHeroBullets(generated.heroBullets);
  }, [commitHeroBullets, form.id, isPrinter]);

  const updateHeroBullet = (index: number, patch: Partial<StoredHeroBullet>) => {
    const next = heroBullets.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange({
      storefront_hero_bullets: next,
      description: descriptionFromHeroBullets(next),
    });
  };

  const addHeroBullet = () => {
    onChange({
      storefront_hero_bullets: [
        ...heroBullets,
        { icon: 'Printer', text: '' },
      ],
    });
  };

  const removeHeroBullet = (index: number) => {
    const next = heroBullets.filter((_, i) => i !== index);
    onChange({
      storefront_hero_bullets: next,
      description: descriptionFromHeroBullets(next),
    });
  };

  const applyBulletsToDescription = () => {
    const text = descriptionFromHeroBullets(heroBullets);
    if (!text) return;
    onChange({ description: text });
  };

  const importBulletsFromDescription = () => {
    const imported = descriptionTextToHeroBullets(form.description, heroBullets);
    if (imported.length === 0) return;
    onChange({
      storefront_hero_bullets: imported,
      description: descriptionFromHeroBullets(imported),
    });
  };

  if (!isPrinter) {
    if (embedded) return null;
    return (
      <InventoryFormSection
        id="inv-storefront-detail"
        title="Ficha de tienda"
        icon={LayoutGrid}
        description="Disponible para equipos de impresión (multifuncionales, impresoras)."
      >
        <p className="text-sm text-muted-foreground">
          Selecciona una categoría de equipo de impresión para editar la lista de especificaciones
          del hero.
        </p>
      </InventoryFormSection>
    );
  }

  const tools = (
    <div className="flex flex-wrap gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-[0.7rem]"
        onClick={syncFromAttributes}
      >
        <RefreshCw className="mr-1 size-3" aria-hidden="true" />
        Sincronizar desde atributos
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-[0.7rem]"
        onClick={applyBulletsToDescription}
        disabled={heroBullets.length === 0}
      >
        <ArrowDownUp className="mr-1 size-3" aria-hidden="true" />
        Copiar → descripción
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-[0.7rem]"
        onClick={importBulletsFromDescription}
        disabled={!form.description?.trim()}
      >
        <ArrowDownUp className="mr-1 size-3" aria-hidden="true" />
        Importar ← descripción
      </Button>
    </div>
  );

  const horizontalContent = (
    <div id="inv-storefront-detail" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <LabelLike>Especificaciones destacadas</LabelLike>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[0.7rem] text-muted-foreground"
            onClick={() => setToolsOpen((open) => !open)}
          >
            Herramientas
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[0.7rem]"
            onClick={addHeroBullet}
          >
            <Plus className="mr-1 size-3" aria-hidden="true" />
            Añadir
          </Button>
        </div>
      </div>
      {toolsOpen ? tools : null}

      {heroBullets.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/70 bg-muted/20 px-2.5 py-3 text-xs text-muted-foreground">
          Sin especificaciones destacadas. Usa «Añadir» o sincroniza desde atributos.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {heroBullets.map((bullet, index) => {
            const Icon = resolveStorefrontIcon(bullet.icon);
            return (
              <li
                key={`bullet-${index}`}
                className="group relative flex min-w-0 items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-2 py-1.5"
              >
                <Select
                  value={bullet.icon}
                  onValueChange={(value) => updateHeroBullet(index, { icon: value })}
                >
                  <SelectTrigger
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-background p-0 text-slate-600',
                      '[&>svg:last-child]:hidden',
                    )}
                    aria-label={`Icono especificación ${index + 1}`}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                  </SelectTrigger>
                  <SelectContent>
                    {STOREFRONT_ICON_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {STOREFRONT_ICON_LABELS[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="h-7 min-w-0 flex-1 border-0 bg-transparent px-0 text-[0.7rem] leading-snug shadow-none focus-visible:ring-0"
                  value={bullet.text}
                  onChange={(event) => updateHeroBullet(index, { text: event.target.value })}
                  placeholder="Texto corto"
                  aria-label={`Texto especificación ${index + 1}`}
                />
                <button
                  type="button"
                  className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={`Quitar especificación ${index + 1}`}
                  onClick={() => removeHeroBullet(index)}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const listContent = (
    <div className="space-y-2.5">
      {tools}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <LabelLike>Especificaciones del hero (lista con iconos)</LabelLike>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[0.7rem]"
            onClick={addHeroBullet}
          >
            Añadir línea
          </Button>
        </div>
        {heroBullets.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/70 bg-muted/20 px-2.5 py-2 text-xs text-muted-foreground">
            Sin bullets personalizados. Usa «Sincronizar desde atributos» o importa desde la
            descripción.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {heroBullets.map((bullet, index) => {
              const Icon = resolveStorefrontIcon(bullet.icon);
              return (
                <li
                  key={`bullet-${index}`}
                  className="flex flex-col gap-1.5 rounded-md border border-border/70 bg-background px-2 py-1.5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-1.5 sm:w-32">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded border border-border/60 text-red-600">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <Select
                      value={bullet.icon}
                      onValueChange={(value) => updateHeroBullet(index, { icon: value })}
                    >
                      <SelectTrigger className="h-7 bg-background text-[0.7rem]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STOREFRONT_ICON_KEYS.map((key) => (
                          <SelectItem key={key} value={key}>
                            {STOREFRONT_ICON_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    className="h-7 flex-1 bg-background text-xs"
                    value={bullet.text}
                    onChange={(event) => updateHeroBullet(index, { text: event.target.value })}
                    placeholder="Ej. Imprime hasta 32 ppm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-[0.7rem] text-destructive hover:text-destructive"
                    onClick={() => removeHeroBullet(index)}
                  >
                    Quitar
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  const content = variant === 'horizontal' ? horizontalContent : listContent;

  if (embedded) {
    return content;
  }

  return (
    <InventoryFormSection
      id="inv-storefront-detail"
      title="Ficha de tienda"
      icon={LayoutGrid}
      description="Se sincronizan en vivo con la descripción (una línea por ítem)."
    >
      {content}
    </InventoryFormSection>
  );
}

function LabelLike({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-foreground">{children}</p>;
}
