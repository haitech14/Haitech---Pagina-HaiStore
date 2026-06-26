import { formatLeadLinePriceInput, syncLeadValueFromLines } from '@/lib/crm-lead-products';
import { randomId } from '@/lib/random-id';
import type { CrmLeadLineItem, CrmNewLeadFormValues } from '@/types/crm-lead-form';
import type { Product } from '@/types/product';

function createLeadLineFromCatalogProduct(product: Product): CrmLeadLineItem {
  return {
    id: randomId(),
    productId: product.id,
    productName: product.name,
    quantity: 1,
    unitPrice: formatLeadLinePriceInput(product.price),
  };
}

export function buildHaibotCrmLeadPrefill(
  products: Product[],
  searchQuery?: string,
): Partial<CrmNewLeadFormValues> {
  const lineItems = products.slice(0, 5).map(createLeadLineFromCatalogProduct);
  const sync = syncLeadValueFromLines(lineItems);
  const notes = searchQuery
    ? `Consulta desde Haibot: ${searchQuery}`
    : 'Lead generado desde Haibot en la tienda.';

  return {
    sourceChannel: 'web',
    notes,
    lineItems,
    valueAmount: sync.valueAmount,
    productName: sync.productName,
    title: searchQuery ? `Consulta: ${searchQuery.slice(0, 80)}` : 'Prospecto Haibot',
  };
}
