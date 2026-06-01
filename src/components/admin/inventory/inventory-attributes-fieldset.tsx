import { useMemo } from 'react';

import { useAdminInventory } from '@/hooks/use-products';
import { buildAttributeNameCatalog } from '@/lib/inventory-attributes';
import type { ProductAttribute } from '@/types/product';

import { InventoryAttributesEditor } from './inventory-attributes-editor';

interface InventoryAttributesFieldsetProps {
  attributes: ProductAttribute[];
  onChange: (attributes: ProductAttribute[]) => void;
}

export function InventoryAttributesFieldset({
  attributes,
  onChange,
}: InventoryAttributesFieldsetProps) {
  const { data: products = [] } = useAdminInventory();

  const nameOptions = useMemo(() => {
    const catalog = buildAttributeNameCatalog(products);
    for (const row of attributes) {
      const name = row.name?.trim();
      if (name && !catalog.includes(name)) catalog.push(name);
    }
    return catalog.sort((a, b) => a.localeCompare(b, 'es'));
  }, [products, attributes]);

  return (
    <fieldset className="rounded-lg border p-3">
      <legend className="px-1 text-sm font-medium">Atributos</legend>
      <p className="mt-1 text-xs text-muted-foreground">
        Especificaciones del producto (color, velocidad, formato, etc.) visibles en inventario y
        ficha.
      </p>
      <div className="mt-3">
        <InventoryAttributesEditor
          attributes={attributes}
          onChange={onChange}
          nameOptions={nameOptions}
          idPrefix="inv-attr"
        />
      </div>
    </fieldset>
  );
}
