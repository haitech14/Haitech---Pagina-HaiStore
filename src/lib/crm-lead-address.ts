import type { CrmNewLeadFormValues } from '@/types/crm-lead-form';
import type { StoreCustomerSearchResult } from '@/types/store-customer';

function billingField(
  billing: Record<string, unknown> | null | undefined,
  key: string,
): string {
  if (!billing || typeof billing !== 'object') return '';
  const value = billing[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function formatCrmLeadAddress(values: Pick<
  CrmNewLeadFormValues,
  'address' | 'district' | 'city' | 'province'
>): string {
  const parts = [
    values.address.trim(),
    values.district.trim(),
    values.city.trim(),
    values.province.trim(),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '';
}

export function addressFromCustomer(customer: StoreCustomerSearchResult): Pick<
  CrmNewLeadFormValues,
  'address' | 'district' | 'city' | 'province'
> {
  const billing = customer.default_billing ?? null;
  const persona = customer as StoreCustomerSearchResult & {
    direccion?: string | null;
    distrito?: string | null;
    ciudad?: string | null;
    provincia?: string | null;
  };

  return {
    address:
      billingField(billing, 'address') ||
      billingField(billing, 'direccion') ||
      persona.direccion?.trim() ||
      '',
    district:
      billingField(billing, 'district') ||
      billingField(billing, 'distrito') ||
      persona.distrito?.trim() ||
      '',
    city:
      billingField(billing, 'city') ||
      billingField(billing, 'ciudad') ||
      persona.ciudad?.trim() ||
      'Lima',
    province:
      billingField(billing, 'province') ||
      billingField(billing, 'provincia') ||
      persona.provincia?.trim() ||
      'Lima',
  };
}
