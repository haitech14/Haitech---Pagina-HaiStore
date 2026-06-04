import type { StoreCustomer } from '@/types/store';

export interface ImportedSaleDocument {
  id: string;
  external_key: string;
  invoice_date: string;
  due_date?: string | null;
  document_type: string;
  serie: string;
  numero: string;
  tax_id?: string | null;
  customer_name: string;
  seller_name?: string | null;
  user_name?: string | null;
  currency: string;
  total: number;
  exchange_rate?: number | null;
  total_pen?: number | null;
  payment_date?: string | null;
  related_doc?: string | null;
  observations?: string | null;
  hora?: string | null;
  report_period_start?: string | null;
  report_period_end?: string | null;
  report_period_month: string;
  customer_id?: string | null;
  source_filename?: string | null;
  report_data?: Record<string, string | number>;
  created_at: string;
  updated_at: string;
  customer?: Pick<
    StoreCustomer,
    'id' | 'full_name' | 'company_name' | 'tax_id' | 'email'
  > | null;
}

export interface VentasMonthSummary {
  month: string;
  label: string;
  count: number;
  totalUsd: number;
  totalPen: number;
}

export type ImportedSalesListCode = 'IMPORTED_SALES_TABLE_MISSING';

export interface ImportedSalesListPayload {
  documents: ImportedSaleDocument[];
  months: VentasMonthSummary[];
  source: string;
  code?: ImportedSalesListCode;
  migration?: string;
  error?: string;
}

export interface VentasImportResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  filesProcessed: number;
  errors: Array<{ file: string; row: number; message: string }>;
}
