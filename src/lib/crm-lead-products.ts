import { getEffectivePrice } from '@/lib/pricing';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { parseLeadValueAmount } from '@/lib/crm-lead-form';
import type { CrmLeadLineItem } from '@/types/crm-lead-form';
import type { CrmLeadCurrency } from '@/types/crm-pipeline';
import type { InventoryProduct, UserRole } from '@/types/product';

export function formatLeadLinePriceInput(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '0';
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export function catalogUnitPriceForLead(
  product: InventoryProduct,
  customerRole: UserRole,
  currency: CrmLeadCurrency,
): number {
  const usd = getEffectivePrice(product, customerRole);
  if (currency === 'USD') return Math.round(usd * 100) / 100;
  return Math.round(usd * getUsdToPenSaleRate() * 100) / 100;
}

export function createLeadLineFromProduct(
  product: InventoryProduct,
  customerRole: UserRole,
  currency: CrmLeadCurrency,
): CrmLeadLineItem {
  const unitPrice = catalogUnitPriceForLead(product, customerRole, currency);
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    productName: product.name,
    quantity: 1,
    unitPrice: formatLeadLinePriceInput(unitPrice),
  };
}

export function computeLeadLinesTotal(lineItems: CrmLeadLineItem[]): number {
  return lineItems.reduce((sum, line) => {
    const qty = Math.max(1, Math.floor(line.quantity) || 1);
    const unit = parseLeadValueAmount(line.unitPrice);
    return sum + qty * unit;
  }, 0);
}

export function leadProductNameFromLines(lineItems: CrmLeadLineItem[]): string {
  if (lineItems.length === 0) return '';
  if (lineItems.length === 1) return lineItems[0]!.productName;
  return `${lineItems[0]!.productName} +${lineItems.length - 1}`;
}

export function recalcLeadLinePrices(
  lineItems: CrmLeadLineItem[],
  products: InventoryProduct[],
  customerRole: UserRole,
  currency: CrmLeadCurrency,
): CrmLeadLineItem[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return lineItems.map((line) => {
    const product = byId.get(line.productId);
    if (!product) return line;
    return {
      ...line,
      productName: product.name,
      unitPrice: formatLeadLinePriceInput(
        catalogUnitPriceForLead(product, customerRole, currency),
      ),
    };
  });
}

export function syncLeadValueFromLines(
  lineItems: CrmLeadLineItem[],
): { valueAmount: string; productName: string } {
  const total = computeLeadLinesTotal(lineItems);
  return {
    valueAmount: total > 0 ? formatLeadLinePriceInput(total) : '0',
    productName: leadProductNameFromLines(lineItems),
  };
}
