import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { MerchandisingOptionalProduct } from '@/types/product';
// @ts-expect-error módulo JS compartido sin declaración de tipos
import { createMerchandisingOptionalProductId } from '../../../../shared/merchandising-optional-product.js';

interface InventoryOptionalMerchandisingProductsProps {
  label: string;
  description: string;
  items: MerchandisingOptionalProduct[];
  onChange: (items: MerchandisingOptionalProduct[]) => void;
}

function emptyOptionalProduct(): MerchandisingOptionalProduct {
  return {
    id: createMerchandisingOptionalProductId(),
    name: '',
    description: null,
    price_usd: 0,
    image_url: null,
    code: null,
  };
}

export function InventoryOptionalMerchandisingProducts({
  label,
  description,
  items,
  onChange,
}: InventoryOptionalMerchandisingProductsProps) {
  const updateItem = (id: string, patch: Partial<MerchandisingOptionalProduct>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/10 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Sin productos opcionales. Añade accesorios o servicios que no requieran ficha en inventario.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="space-y-3 rounded-md border border-border/60 bg-background p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">Opcional {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-destructive hover:text-destructive"
                  aria-label={`Eliminar opcional ${index + 1}`}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`optional-name-${item.id}`}>Nombre</Label>
                  <Input
                    id={`optional-name-${item.id}`}
                    value={item.name}
                    onChange={(event) => updateItem(item.id, { name: event.target.value })}
                    placeholder="Ej. Instalación en sitio"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`optional-code-${item.id}`}>Código / SKU</Label>
                  <Input
                    id={`optional-code-${item.id}`}
                    value={item.code ?? ''}
                    onChange={(event) =>
                      updateItem(item.id, { code: event.target.value.trim() || null })
                    }
                    placeholder="Opcional"
                    className="h-9 font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`optional-price-${item.id}`}>Precio público (USD)</Label>
                  <Input
                    id={`optional-price-${item.id}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.price_usd > 0 ? item.price_usd : ''}
                    onChange={(event) =>
                      updateItem(item.id, {
                        price_usd: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                    placeholder="0.00"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`optional-image-${item.id}`}>Imagen (URL)</Label>
                  <Input
                    id={`optional-image-${item.id}`}
                    value={item.image_url ?? ''}
                    onChange={(event) =>
                      updateItem(item.id, { image_url: event.target.value.trim() || null })
                    }
                    placeholder="/categories/repuestos.png o https://…"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`optional-desc-${item.id}`}>Descripción breve</Label>
                  <Textarea
                    id={`optional-desc-${item.id}`}
                    value={item.description ?? ''}
                    onChange={(event) =>
                      updateItem(item.id, {
                        description: event.target.value.trim() || null,
                      })
                    }
                    rows={2}
                    className={cn('min-h-[4.5rem] resize-y text-sm')}
                    placeholder="Texto en la tarjeta del carrusel"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={() => onChange([...items, emptyOptionalProduct()])}
      >
        <Plus className="size-3.5" aria-hidden="true" />
        Añadir producto opcional
      </Button>
    </div>
  );
}
