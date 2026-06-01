export interface StoreCustomerSearchResult {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  tax_id: string | null;
  profile_role: string | null;
  default_billing?: Record<string, unknown> | null;
}
