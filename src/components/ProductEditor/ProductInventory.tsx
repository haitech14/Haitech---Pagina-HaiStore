import { Package } from 'lucide-react';

import {
  PRODUCT_EDITOR_INPUT_CLASS,
  PRODUCT_EDITOR_LABEL_CLASS,
  ProductEditorCard,
} from '@/components/ProductEditor/product-editor-ui';

export interface ProductInventoryValues {
  stock: string;
  minStock: string;
  location: string;
}

interface ProductInventoryProps {
  values: ProductInventoryValues;
  onChange: (patch: Partial<ProductInventoryValues>) => void;
}

export function ProductInventory({ values, onChange }: ProductInventoryProps) {
  return (
    <ProductEditorCard
      title="Inventario"
      description="Stock y ubicación."
      icon={<Package className="size-4" aria-hidden="true" />}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-stock">
            Stock actual
          </label>
          <input
            id="pe-stock"
            className={PRODUCT_EDITOR_INPUT_CLASS}
            value={values.stock}
            onChange={(event) => onChange({ stock: event.target.value })}
          />
        </div>
        <div>
          <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-min-stock">
            Stock mínimo
          </label>
          <input
            id="pe-min-stock"
            className={PRODUCT_EDITOR_INPUT_CLASS}
            value={values.minStock}
            onChange={(event) => onChange({ minStock: event.target.value })}
          />
        </div>
        <div>
          <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-location">
            Ubicación
          </label>
          <select
            id="pe-location"
            className={PRODUCT_EDITOR_INPUT_CLASS}
            value={values.location}
            onChange={(event) => onChange({ location: event.target.value })}
          >
            <option>Almacén principal</option>
            <option>Operativo</option>
            <option>Santa Catalina</option>
          </select>
        </div>
      </div>
    </ProductEditorCard>
  );
}
