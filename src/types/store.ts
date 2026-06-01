/** Estados de pedido en base de datos (Supabase enum store_order_status). */
export type StoreOrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type StorePaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface StoreProductCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreCustomer {
  id: string;
  profile_id?: string | null;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  company_name?: string | null;
  tax_id?: string | null;
  default_shipping?: Record<string, unknown> | null;
  default_billing?: Record<string, unknown> | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/** Cliente de tienda con rol del perfil vinculado (si existe). */
export interface StoreCustomerWithRole extends StoreCustomer {
  profile_role: string | null;
}

export interface AdminStoreCustomersPayload {
  customers: StoreCustomerWithRole[];
  source: 'supabase' | 'unavailable';
}

export interface StoreOrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  quantity: number;
  unit_price_usd: number;
  line_total_usd: number;
  product_snapshot: {
    id?: string;
    name?: string;
    image_url?: string | null;
    category?: string | null;
    brand?: string | null;
  };
  created_at: string;
}

export interface StoreOrder {
  id: string;
  order_number: string;
  customer_id?: string | null;
  user_id?: string | null;
  status: StoreOrderStatus;
  payment_status: StorePaymentStatus;
  payment_method?: string | null;
  currency: string;
  subtotal_usd: number;
  tax_usd: number;
  total_usd: number;
  total_pen?: number | null;
  exchange_rate?: number | null;
  shipping_address?: Record<string, unknown> | null;
  billing_address?: Record<string, unknown> | null;
  notes?: string | null;
  paid_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
  customer?: Pick<StoreCustomer, 'id' | 'email' | 'full_name' | 'company_name'> | null;
  items?: StoreOrderItem[];
}

export interface AdminDashboardOrdersPayload {
  orders: StoreOrder[];
  summary: {
    totalSalesUsd: number;
    orderCount: number;
    salesByDay: Array<{ date: string; sales: number }>;
    salesByCategory: Array<{ category: string; amount: number; percent: number }>;
    topProducts: Array<{
      product_id: string | null;
      name: string;
      units: number;
      revenue_usd: number;
      image?: string | null;
    }>;
  };
}
