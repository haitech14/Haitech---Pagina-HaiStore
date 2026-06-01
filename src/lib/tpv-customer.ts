import { resolvePriceRole, isPriceRole } from '@/lib/roles';
import type { TpvCurrency, TpvCustomer } from '@/types/tpv';
import type { StoreCustomerSearchResult } from '@/types/store-customer';
import type { PriceRole } from '@/types/product';

function billingField<T>(billing: Record<string, unknown> | null | undefined, key: string): T | undefined {
  if (!billing || typeof billing !== 'object') return undefined;
  const value = billing[key];
  return value as T | undefined;
}

export function resolveTpvPriceList(
  profileRole: string | null | undefined,
  billing?: Record<string, unknown> | null,
): PriceRole {
  const fromBilling = billingField<string>(billing, 'price_list');
  if (fromBilling && isPriceRole(fromBilling)) return fromBilling;
  return resolvePriceRole(profileRole ?? 'public');
}

export function resolveTpvCurrency(billing?: Record<string, unknown> | null): TpvCurrency {
  const fromBilling = billingField<string>(billing, 'currency');
  return fromBilling === 'USD' ? 'USD' : 'PEN';
}

export function storeCustomerToTpvCustomer(row: StoreCustomerSearchResult): TpvCustomer {
  const billing = row.default_billing ?? null;
  return {
    storeCustomerId: row.id,
    razonSocial: row.company_name?.trim() || row.full_name?.trim() || '',
    documento: row.tax_id?.trim() || '',
    atencion: row.full_name?.trim() || '',
    celular: row.phone?.trim() || '',
    direccion: billingField<string>(billing, 'address')?.trim() || 'Lima',
    priceList: resolveTpvPriceList(row.profile_role, billing),
    currency: resolveTpvCurrency(billing),
  };
}

export function customerDisplayLabel(row: StoreCustomerSearchResult): string {
  const name = row.company_name?.trim() || row.full_name?.trim() || row.email;
  const doc = row.tax_id?.trim();
  return doc ? `${name} · ${doc}` : name;
}
