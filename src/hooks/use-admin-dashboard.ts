import { useQuery } from '@tanstack/react-query';

import type { OrderStatus } from '@/components/admin/AdminOrderStatusBadge';
import type { AdminDateRange } from '@/components/admin/AdminDateRangePicker';
import {
  calcTrendPercent,
  getPreviousPeriod,
  isDateInRange,
} from '@/components/admin/AdminDateRangePicker';
import { formatOrderTotal, mapStoreOrderStatusToBadge } from '@/lib/admin-order-status';
import { useAdminInventory } from '@/hooks/use-products';
import { apiFetch } from '@/lib/api';
import {
  getInventoryStockStatus,
  INVENTORY_LOW_STOCK_THRESHOLD,
  inventoryCategoryLeafLabel,
  mergeInventoryCategoryStockSnapshots,
  normalizeStockQuantity,
  sortInventoryCategoriesByUrgency,
  tallyInventoryCategoryStock,
  toCategoryStockPercents,
  URGENT_INVENTORY_CATEGORY_LIMIT,
  type InventoryCategoryStockSnapshot,
} from '@/lib/inventory-stock-status';
import { formatPenFromUsd } from '@/lib/utils';
import type { AdminDashboardOrdersPayload, StoreOrder } from '@/types/store';
import type { UserProfile } from '@/types/product';

async function fetchProfiles(): Promise<UserProfile[]> {
  try {
    return await apiFetch<UserProfile[]>('/api/auth/profiles');
  } catch {
    return [];
  }
}

function toIsoDate(date: Date) {
  return date.toISOString();
}

async function fetchOrdersDashboard(range: AdminDateRange): Promise<AdminDashboardOrdersPayload> {
  try {
    const params = new URLSearchParams({
      from: toIsoDate(range.from),
      to: toIsoDate(range.to),
    });
    return await apiFetch<AdminDashboardOrdersPayload>(
      `/api/orders/admin/dashboard?${params.toString()}`,
    );
  } catch {
    return {
      orders: [],
      summary: {
        totalSalesUsd: 0,
        orderCount: 0,
        salesByDay: [],
        salesByCategory: [],
        topProducts: [],
      },
    };
  }
}

function profileDate(profile: UserProfile) {
  return profile.created_at ?? profile.updated_at ?? '';
}

function filterOrdersInRange(orders: StoreOrder[], range: AdminDateRange) {
  return orders.filter(
    (order) =>
      order.payment_status === 'paid' &&
      order.status !== 'cancelled' &&
      isDateInRange(order.created_at, range),
  );
}

function buildSalesSparkline(
  salesByDay: Array<{ date: string; sales: number }>,
  range: AdminDateRange,
) {
  const map = new Map(salesByDay.map((entry) => [entry.date, entry.sales]));
  const days: { value: number }[] = [];
  const cursor = new Date(range.from);
  while (cursor <= range.to) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ value: map.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function buildOrdersSparkline(orders: StoreOrder[], range: AdminDateRange) {
  const days: { value: number }[] = [];
  const cursor = new Date(range.from);
  while (cursor <= range.to) {
    const dayStart = new Date(cursor);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(cursor);
    dayEnd.setHours(23, 59, 59, 999);
    const count = orders.filter((order) => {
      const date = new Date(order.created_at);
      return date >= dayStart && date <= dayEnd;
    }).length;
    days.push({ value: count });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function useAdminProfiles() {
  return useQuery({
    queryKey: ['admin-profiles'],
    queryFn: fetchProfiles,
    staleTime: 1000 * 60,
  });
}

/** Misma caché que `useAdminInventory` (evita queryFn duplicados en `admin-inventory`). */
export function useAdminProductsQuery() {
  return useAdminInventory();
}

export function useAdminOrdersDashboard(range: AdminDateRange) {
  return useQuery({
    queryKey: ['admin-orders-dashboard', range.from.toISOString(), range.to.toISOString()],
    queryFn: () => fetchOrdersDashboard(range),
    staleTime: 1000 * 30,
  });
}

export function useAdminDashboardKpis(range: AdminDateRange) {
  const profilesQuery = useAdminProfiles();
  const productsQuery = useAdminProductsQuery();
  const ordersQuery = useAdminOrdersDashboard(range);
  const previous = getPreviousPeriod(range);

  const profiles = profilesQuery.data ?? [];
  const allOrders = ordersQuery.data?.orders ?? [];

  const newCustomers = profiles.filter((p) => {
    const date = profileDate(p);
    return date && isDateInRange(date, range);
  }).length;
  const prevCustomers = profiles.filter((p) => {
    const date = profileDate(p);
    return date && isDateInRange(date, previous);
  }).length;

  const rangedPaid = filterOrdersInRange(allOrders, range);
  const prevPaid = filterOrdersInRange(allOrders, previous);

  const totalSales = rangedPaid.reduce((sum, order) => sum + Number(order.total_usd), 0);
  const prevSales = prevPaid.reduce((sum, order) => sum + Number(order.total_usd), 0);

  const orderCount = rangedPaid.length;
  const prevOrderCount = prevPaid.length;

  const conversionRate =
    newCustomers > 0 ? Math.round((orderCount / newCustomers) * 100) : orderCount > 0 ? 100 : null;

  const prevConversion =
    prevCustomers > 0
      ? Math.round((prevOrderCount / prevCustomers) * 100)
      : prevOrderCount > 0
        ? 100
        : null;

  const salesByDay = ordersQuery.data?.summary.salesByDay ?? [];
  const productCount = productsQuery.data?.length ?? 0;
  const hasOrders = allOrders.length > 0;

  return {
    isLoading: profilesQuery.isLoading || productsQuery.isLoading || ordersQuery.isLoading,
    hasOrders,
    kpis: {
      totalSales: {
        value: totalSales,
        trend: calcTrendPercent(totalSales, prevSales),
        sparkline: buildSalesSparkline(salesByDay, range),
      },
      orders: {
        value: orderCount,
        trend: calcTrendPercent(orderCount, prevOrderCount),
        sparkline: buildOrdersSparkline(rangedPaid, range),
      },
      newCustomers: {
        value: newCustomers,
        trend: calcTrendPercent(newCustomers, prevCustomers),
        sparkline: buildDailySparkline(profiles, range, profileDate),
      },
      conversionRate: {
        value: conversionRate,
        trend:
          conversionRate !== null && prevConversion !== null
            ? calcTrendPercent(conversionRate, prevConversion)
            : null,
        sparkline: [] as { value: number }[],
      },
      averageTicket: {
        value: orderCount > 0 ? totalSales / orderCount : 0,
        trend: calcTrendPercent(
          orderCount > 0 ? totalSales / orderCount : 0,
          prevOrderCount > 0 ? prevSales / prevOrderCount : 0,
        ),
      },
      productCount,
    },
  };
}

function buildDailySparkline(
  profiles: UserProfile[],
  range: AdminDateRange,
  getDate: (p: UserProfile) => string,
) {
  const days: { value: number }[] = [];
  const cursor = new Date(range.from);
  while (cursor <= range.to) {
    const dayStart = new Date(cursor);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(cursor);
    dayEnd.setHours(23, 59, 59, 999);
    const count = profiles.filter((p) => {
      const d = getDate(p);
      if (!d) return false;
      const date = new Date(d);
      return date >= dayStart && date <= dayEnd;
    }).length;
    days.push({ value: count });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function useAdminSalesTimeSeries(range: AdminDateRange) {
  const ordersQuery = useAdminOrdersDashboard(range);
  const previous = getPreviousPeriod(range);
  const allOrders = ordersQuery.data?.orders ?? [];
  const rangedPaid = filterOrdersInRange(allOrders, range);

  const current = ordersQuery.data?.summary.salesByDay ?? [];
  const ordersByDay = new Map<string, number>();
  for (const order of rangedPaid) {
    const key = order.created_at.slice(0, 10);
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
  }

  const combined = current.map((point) => ({
    date: point.date,
    sales: point.sales,
    orders: ordersByDay.get(point.date) ?? 0,
  }));

  const prevPaid = filterOrdersInRange(allOrders, previous);
  const prevMap = new Map<string, number>();
  for (const order of prevPaid) {
    const offsetMs = order.created_at
      ? new Date(order.created_at).getTime() - range.from.getTime()
      : 0;
    const aligned = new Date(previous.from.getTime() + offsetMs);
    const key = aligned.toISOString().slice(0, 10);
    prevMap.set(key, (prevMap.get(key) ?? 0) + Number(order.total_usd));
  }

  const previousSeries = Array.from(prevMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sales]) => ({ date, sales }));

  return {
    isLoading: ordersQuery.isLoading,
    hasData: combined.some((point) => point.sales > 0 || point.orders > 0),
    current: combined,
    previous: previousSeries,
  };
}

export function useAdminSalesByCategory(range: AdminDateRange) {
  const ordersQuery = useAdminOrdersDashboard(range);
  const data = ordersQuery.data?.summary.salesByCategory ?? [];

  return {
    isLoading: ordersQuery.isLoading,
    hasData: data.length > 0,
    data,
  };
}

export function useAdminRecentOrders() {
  const query = useQuery({
    queryKey: ['admin-orders-recent'],
    queryFn: async () => {
      try {
        const payload = await apiFetch<{ orders: StoreOrder[] }>(
          '/api/orders/admin/recent?limit=8',
        );
        return payload.orders;
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 30,
  });

  const orders = (query.data ?? []).map((order) => {
    const customerRecord = order.customer;
    const customer =
      customerRecord?.full_name?.trim() ||
      customerRecord?.company_name?.trim() ||
      customerRecord?.email ||
      'Cliente';

    return {
      id: order.order_number,
      customer,
      status: mapStoreOrderStatusToBadge(order.status) satisfies OrderStatus,
      paymentStatus: order.payment_status,
      total: formatOrderTotal(Number(order.total_usd), order.total_pen, order.currency),
      date: order.created_at,
    };
  });

  return {
    isLoading: query.isLoading,
    orders,
  };
}

export function useAdminTopProductsList(range: AdminDateRange) {
  const ordersQuery = useAdminOrdersDashboard(range);
  const products = ordersQuery.data?.summary.topProducts ?? [];

  return {
    isLoading: ordersQuery.isLoading,
    hasData: products.length > 0,
    products: products.map((product) => ({
      name: product.name,
      units: product.units,
      revenue: formatPenFromUsd(product.revenue_usd),
      image: product.image,
    })),
  };
}

export interface AdminInventoryCategoryRow extends InventoryCategoryStockSnapshot {
  category: string;
  /** Productos sin stock + bajo stock (compatibilidad export CSV). */
  lowStock: number;
  outPercent: number;
  lowPercent: number;
  healthyPercent: number;
}

export function useAdminInventoryByCategory(options?: { urgentLimit?: number }) {
  const productsQuery = useAdminProductsQuery();
  const urgentLimit = options?.urgentLimit ?? URGENT_INVENTORY_CATEGORY_LIMIT;

  const categories = new Map<string, InventoryCategoryStockSnapshot>();

  for (const product of productsQuery.data ?? []) {
    const category = inventoryCategoryLeafLabel(product.category);
    const entry = categories.get(category) ?? { total: 0, out: 0, low: 0, healthy: 0 };
    const tally = tallyInventoryCategoryStock(normalizeStockQuantity(product.stock));
    categories.set(
      category,
      mergeInventoryCategoryStockSnapshots(entry, {
        total: 1,
        out: tally.out,
        low: tally.low,
        healthy: tally.healthy,
      }),
    );
  }

  const allCategories: AdminInventoryCategoryRow[] = sortInventoryCategoriesByUrgency(
    Array.from(categories.entries()).map(([category, stats]) => {
      const percents = toCategoryStockPercents(stats);
      return {
        category,
        ...stats,
        lowStock: stats.out + stats.low,
        ...percents,
      };
    }),
  );

  return {
    isLoading: productsQuery.isLoading,
    data: allCategories.slice(0, urgentLimit),
    allCategories,
    hasMoreUrgentCategories: allCategories.length > urgentLimit,
    totalCategories: allCategories.length,
  };
}

export function useAdminLowStockProducts(limit = 5) {
  const productsQuery = useAdminProductsQuery();
  const products = productsQuery.data ?? [];

  const lowStock = products
    .filter((product) => {
      const status = getInventoryStockStatus(normalizeStockQuantity(product.stock));
      return status === 'out' || status === 'low';
    })
    .sort((a, b) => normalizeStockQuantity(a.stock) - normalizeStockQuantity(b.stock))
    .slice(0, limit)
    .map((product) => ({
      id: product.id,
      name: product.name,
      code: product.code,
      stock: normalizeStockQuantity(product.stock),
      image: product.image_url,
      threshold: INVENTORY_LOW_STOCK_THRESHOLD,
    }));

  return {
    isLoading: productsQuery.isLoading,
    products: lowStock,
    hasData: lowStock.length > 0,
  };
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

export function useAdminDailySummary() {
  const todayRange: AdminDateRange = { from: startOfToday(), to: endOfToday() };
  const ordersQuery = useAdminOrdersDashboard(todayRange);
  const profilesQuery = useAdminProfiles();
  const productsQuery = useAdminProductsQuery();

  const orders = ordersQuery.data?.orders ?? [];
  const paidToday = filterOrdersInRange(orders, todayRange);
  const salesToday = paidToday.reduce((sum, order) => sum + Number(order.total_usd), 0);
  const unitsToday = paidToday.reduce(
    (sum, order) => sum + (order.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) ?? 0),
    0,
  );

  const newCustomersToday = (profilesQuery.data ?? []).filter((profile) => {
    const date = profileDate(profile);
    return date && isDateInRange(date, todayRange);
  }).length;

  return {
    isLoading: ordersQuery.isLoading || profilesQuery.isLoading,
    sales: salesToday,
    orders: paidToday.length,
    newCustomers: newCustomersToday,
    visits: productsQuery.data?.reduce((sum, product) => sum + (product.view_count ?? 0), 0) ?? 0,
    unitsSold: unitsToday,
  };
}
