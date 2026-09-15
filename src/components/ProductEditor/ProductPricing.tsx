import { CircleDollarSign } from 'lucide-react';

import {
  PRODUCT_EDITOR_INPUT_CLASS,
  PRODUCT_EDITOR_LABEL_CLASS,
  ProductEditorCard,
} from '@/components/ProductEditor/product-editor-ui';

export interface ProductPricingValues {
  supplier: string;
  purchaseUsd: string;
  costPen: string;
  marginPercent: string;
}

export interface ProductSalePriceRow {
  id: string;
  customerType: string;
  currency: string;
  price: string;
  margin: string;
}

interface ProductPricingProps {
  values: ProductPricingValues;
  salePrices: ProductSalePriceRow[];
  onChange: (patch: Partial<ProductPricingValues>) => void;
}

export function ProductPricing({ values, salePrices, onChange }: ProductPricingProps) {
  return (
    <div className="space-y-5">
      <ProductEditorCard
        title="Proveedor y costos"
        description="Costos base y margen objetivo."
        icon={<CircleDollarSign className="size-4" aria-hidden="true" />}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-supplier">
              Proveedor principal
            </label>
            <select
              id="pe-supplier"
              className={PRODUCT_EDITOR_INPUT_CLASS}
              value={values.supplier}
              onChange={(event) => onChange({ supplier: event.target.value })}
            >
              <option>Ricoh del Perú S.A.</option>
              <option>Haitech</option>
              <option>Otro proveedor</option>
            </select>
          </div>
          <div>
            <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-purchase">
              Precio de compra (USD)
            </label>
            <input
              id="pe-purchase"
              className={PRODUCT_EDITOR_INPUT_CLASS}
              value={values.purchaseUsd}
              onChange={(event) => onChange({ purchaseUsd: event.target.value })}
            />
          </div>
          <div>
            <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-cost-pen">
              Costo en PEN (referencial)
            </label>
            <input
              id="pe-cost-pen"
              readOnly
              className={`${PRODUCT_EDITOR_INPUT_CLASS} bg-[#F8FAFC] text-[#6B7280]`}
              value={values.costPen}
            />
          </div>
          <div>
            <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-margin">
              Margen deseado (%)
            </label>
            <div className="relative">
              <input
                id="pe-margin"
                className={`${PRODUCT_EDITOR_INPUT_CLASS} pr-8`}
                value={values.marginPercent}
                onChange={(event) => onChange({ marginPercent: event.target.value })}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">
                %
              </span>
            </div>
          </div>
        </div>
      </ProductEditorCard>

      <ProductEditorCard
        title="Precios de venta"
        description="Listas por tipo de cliente."
        icon={<CircleDollarSign className="size-4" aria-hidden="true" />}
      >
        <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              <tr>
                <th className="px-3 py-2.5">Tipo de cliente</th>
                <th className="px-3 py-2.5">Moneda</th>
                <th className="px-3 py-2.5">Precio</th>
                <th className="px-3 py-2.5">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {salePrices.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2.5 font-medium text-[#111827]">{row.customerType}</td>
                  <td className="px-3 py-2.5 text-[#6B7280]">{row.currency}</td>
                  <td className="px-3 py-2.5 tabular-nums text-[#111827]">{row.price}</td>
                  <td className="px-3 py-2.5 tabular-nums text-[#6B7280]">{row.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProductEditorCard>
    </div>
  );
}
