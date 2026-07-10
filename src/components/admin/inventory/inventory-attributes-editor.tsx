import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ATTRIBUTE_CUSTOM_OPTION,
  createEmptyAttribute,
  getAttributeValueOptions,
  mergeSelectOptions,
} from '@/lib/inventory-attributes';
import type { ProductAttribute } from '@/types/product';

interface InventoryAttributesEditorProps {
  attributes: ProductAttribute[];
  onChange: (attributes: ProductAttribute[], immediate?: boolean) => void;
  nameOptions: string[];
  products?: readonly { attributes?: ProductAttribute[] }[];
  idPrefix?: string;
  emptyLabel?: string;
}

export function InventoryAttributesEditor({
  attributes,
  onChange,
  nameOptions,
  products = [],
  idPrefix = 'attr',
  emptyLabel = 'Sin atributos.',
}: InventoryAttributesEditorProps) {
  const [customNameIds, setCustomNameIds] = useState<Set<string>>(() => new Set());
  const [customValueIds, setCustomValueIds] = useState<Set<string>>(() => new Set());

  const nameSelectOptions = useMemo(
    () => mergeSelectOptions(nameOptions, ''),
    [nameOptions],
  );

  const update = (id: string, patch: Partial<ProductAttribute>, immediate = false) => {
    const next = attributes.map((row) => (row.id === id ? { ...row, ...patch } : row));
    onChange(next, immediate);
  };

  const remove = (id: string) => {
    onChange(
      attributes.filter((row) => row.id !== id),
      true,
    );
    setCustomNameIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setCustomValueIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const add = () => {
    // No persistir de inmediato: la fila vacía se normaliza a [] y puede pisar un PATCH válido.
    onChange([...attributes, createEmptyAttribute()], false);
  };

  const showCustomName = (attribute: ProductAttribute) =>
    customNameIds.has(attribute.id) ||
    (Boolean(attribute.name.trim()) && !nameSelectOptions.includes(attribute.name.trim()));

  const showCustomValue = (attribute: ProductAttribute, valueOptions: string[]) =>
    customValueIds.has(attribute.id) ||
    (Boolean(attribute.value.trim()) && !valueOptions.includes(attribute.value.trim()));

  return (
    <div className="space-y-2">
      {attributes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {attributes.map((attribute, index) => {
            const nameId = `${idPrefix}-name-${attribute.id}`;
            const valueId = `${idPrefix}-value-${attribute.id}`;
            const valueOptions = mergeSelectOptions(
              getAttributeValueOptions(attribute.name, products),
              attribute.value,
            );
            const useCustomName = showCustomName(attribute);
            const useCustomValue = showCustomValue(attribute, valueOptions);

            return (
              <li
                key={attribute.id}
                className="grid gap-2 rounded-md border bg-muted/30 p-2 sm:grid-cols-[1fr_1fr_auto]"
              >
                <div className="space-y-1">
                  <Label htmlFor={nameId} className="text-xs">
                    Atributo {index + 1}
                  </Label>
                  {useCustomName ? (
                    <Input
                      id={nameId}
                      value={attribute.name}
                      onChange={(event) => update(attribute.id, { name: event.target.value })}
                      placeholder="Nombre del atributo"
                      className="h-9"
                      autoComplete="off"
                    />
                  ) : (
                    <Select
                      value={attribute.name}
                      onValueChange={(value) => {
                        if (value === ATTRIBUTE_CUSTOM_OPTION) {
                          setCustomNameIds((prev) => new Set(prev).add(attribute.id));
                          return;
                        }
                        setCustomNameIds((prev) => {
                          const next = new Set(prev);
                          next.delete(attribute.id);
                          return next;
                        });
                        const nextValueOptions = getAttributeValueOptions(value, products);
                        const keepValue = nextValueOptions.includes(attribute.value)
                          ? attribute.value
                          : '';
                        update(attribute.id, { name: value, value: keepValue }, true);
                      }}
                    >
                      <SelectTrigger id={nameId} className="h-9" aria-label={`Atributo ${index + 1}`}>
                        <SelectValue placeholder="Elegir atributo" />
                      </SelectTrigger>
                      <SelectContent>
                        {nameSelectOptions.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                        <SelectItem value={ATTRIBUTE_CUSTOM_OPTION}>Otro atributo…</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor={valueId} className="text-xs">
                    Valor
                  </Label>
                  {useCustomValue || valueOptions.length === 0 ? (
                    <Input
                      id={valueId}
                      value={attribute.value}
                      onChange={(event) => update(attribute.id, { value: event.target.value })}
                      placeholder="Valor del atributo"
                      className="h-9"
                      disabled={!attribute.name.trim()}
                    />
                  ) : (
                    <Select
                      value={attribute.value}
                      onValueChange={(value) => {
                        if (value === ATTRIBUTE_CUSTOM_OPTION) {
                          setCustomValueIds((prev) => new Set(prev).add(attribute.id));
                          return;
                        }
                        setCustomValueIds((prev) => {
                          const next = new Set(prev);
                          next.delete(attribute.id);
                          return next;
                        });
                        update(attribute.id, { value }, true);
                      }}
                      disabled={!attribute.name.trim()}
                    >
                      <SelectTrigger id={valueId} className="h-9" aria-label={`Valor ${index + 1}`}>
                        <SelectValue placeholder="Elegir valor" />
                      </SelectTrigger>
                      <SelectContent>
                        {valueOptions.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                        <SelectItem value={ATTRIBUTE_CUSTOM_OPTION}>Otro valor…</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
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

      <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5" onClick={add}>
        <Plus className="size-4" aria-hidden="true" />
        Agregar atributo
      </Button>
    </div>
  );
}
