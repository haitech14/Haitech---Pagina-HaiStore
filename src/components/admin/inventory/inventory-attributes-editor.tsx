import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createEmptyAttribute } from '@/lib/inventory-attributes';
import type { ProductAttribute } from '@/types/product';

interface InventoryAttributesEditorProps {
  attributes: ProductAttribute[];
  onChange: (attributes: ProductAttribute[]) => void;
  nameOptions: string[];
  idPrefix?: string;
}

export function InventoryAttributesEditor({
  attributes,
  onChange,
  nameOptions,
  idPrefix = 'attr',
}: InventoryAttributesEditorProps) {
  const listId = `${idPrefix}-names`;

  const update = (id: string, patch: Partial<ProductAttribute>) => {
    onChange(attributes.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const remove = (id: string) => {
    onChange(attributes.filter((row) => row.id !== id));
  };

  const add = () => {
    onChange([...attributes, createEmptyAttribute()]);
  };

  return (
    <div className="space-y-2">
      {attributes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin atributos.</p>
      ) : (
        <ul className="space-y-2">
          {attributes.map((attribute, index) => {
            const nameId = `${idPrefix}-name-${attribute.id}`;
            const valueId = `${idPrefix}-value-${attribute.id}`;
            return (
              <li
                key={attribute.id}
                className="grid gap-2 rounded-md border bg-muted/30 p-2 sm:grid-cols-[1fr_1fr_auto]"
              >
                <div className="space-y-1">
                  <Label htmlFor={nameId} className="text-xs">
                    Atributo {index + 1}
                  </Label>
                  <Input
                    id={nameId}
                    list={listId}
                    value={attribute.name}
                    onChange={(event) => update(attribute.id, { name: event.target.value })}
                    placeholder="Ej. Color, Velocidad…"
                    className="h-9"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={valueId} className="text-xs">
                    Valor
                  </Label>
                  <Input
                    id={valueId}
                    value={attribute.value}
                    onChange={(event) => update(attribute.id, { value: event.target.value })}
                    placeholder="Ej. Láser color, 40 ppm"
                    className="h-9"
                  />
                </div>
                <div className="flex items-end sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-destructive hover:text-destructive"
                    aria-label={`Quitar atributo ${attribute.name || index + 1}`}
                    onClick={() => remove(attribute.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <datalist id={listId}>
        {nameOptions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={add}>
        <Plus className="size-4" aria-hidden="true" />
        Agregar atributo
      </Button>
    </div>
  );
}
