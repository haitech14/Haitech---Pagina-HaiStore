import { useMemo } from 'react';

import { useAdminInventory } from '@/hooks/use-products';
import { buildAttributeNameCatalog } from '@/lib/inventory-attributes';
import type { ProductAttribute } from '@/types/product';

import { InventoryAttributesEditor } from './inventory-attributes-editor';

interface InventoryAttributesFieldsetProps {
  attributes: ProductAttribute[];
  onChange: (attributes: ProductAttribute[]) => void;
  embedded?: boolean;
}

export function InventoryAttributesFieldset({
  attributes,
  onChange,
  embedded = false,
}: InventoryAttributesFieldsetProps) {
  const { data: products = [] } = useAdminInventory();

  const nameOptions = useMemo(() => buildAttributeNameCatalog(products), [products]);

  const content = (
    <div className={embedded ? undefined : 'mt-3'}>
      <InventoryAttributesEditor
        attributes={attributes}
        onChange={onChange}
        nameOptions={nameOptions}
        products={products}
        idPrefix="inv-attr"
        emptyLabel="Sin atributos registrados."
      />
    </div>
  );

  if (embedded) {
    return (
      <div id="inv-attributes-fieldset" className="outline-none" tabIndex={-1}>
        {content}
      </div>
    );
  }

  return (
    <fieldset id="inv-attributes-fieldset" className="rounded-lg border p-3 outline-none" tabIndex={-1}>
      <legend className="px-1 text-sm font-medium">Atributos</legend>
      <p className="mt-1 text-xs text-muted-foreground">
        Especificaciones del producto (color, velocidad, formato, etc.) visibles en inventario y
        ficha.
      </p>
      {content}
    </fieldset>
  );
}
