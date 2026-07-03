import {
  calcTrendPercent,
  getPreviousPeriod,
  isDateInRange,
  type AdminDateRange,
} from '@/components/admin/AdminDateRangePicker';
import {
  CUSTOMER_ROLE_SECTIONS,
  getCustomerRoleGroupKey,
  isHaiSupportOnlyCustomer,
  type CustomerRoleGroupKey,
} from '@/lib/customers-by-role';
import { getPersonaCellValue, personaDataToSearchBlob } from '@/lib/persona-report-columns';
import type {
  AdminClientesAccountDistribution,
  AdminClientesGrowthPoint,
  AdminClientesKpi,
  AdminClientesRoleDistribution,
  AdminClientesTab,
  AdminClientesTabCounts,
} from '@/types/admin-clientes';
import type { StoreCustomerWithRole } from '@/types/store';

const ROLE_COLORS: Record<CustomerRoleGroupKey, string> = {
  admin: '#8B5CF6',
  tecnico: '#3B82F6',
  distribuidor: '#F59E0B',
  mayorista: '#22C55E',
  public: '#0EA5E9',
  guest: '#94A3B8',
};

const ACCOUNT_COLORS: Record<Exclude<AdminClientesTab, 'todos'>, string> = {
  con_cuenta: '#22C55E',
  sin_cuenta: '#F59E0B',
  haisupport: '#8B5CF6',
};

const ACCOUNT_LABELS: Record<Exclude<AdminClientesTab, 'todos'>, string> = {
  con_cuenta: 'Con cuenta',
  sin_cuenta: 'Sin cuenta',
  haisupport: 'HaiSupport',
};

export function mapCustomerToTab(customer: StoreCustomerWithRole): Exclude<AdminClientesTab, 'todos'> {
  if (isHaiSupportOnlyCustomer(customer)) return 'haisupport';
  if (customer.profile_id) return 'con_cuenta';
  return 'sin_cuenta';
}

export function customerDisplayName(customer: StoreCustomerWithRole): string {
  return (
    getPersonaCellValue(customer, 'nombre_razon_social') ||
    customer.company_name?.trim() ||
    customer.full_name?.trim() ||
    customer.email
  );
}

export function customerDocumentLabel(customer: StoreCustomerWithRole): string {
  const doc = getPersonaCellValue(customer, 'numero_documento') || customer.tax_id?.trim();
  return doc || '—';
}

export function customerShortId(customer: StoreCustomerWithRole): string {
  const doc = customerDocumentLabel(customer);
  if (doc !== '—') return doc;
  return customer.id.slice(0, 8).toUpperCase();
}

export function customerAccountStatus(customer: StoreCustomerWithRole): 'activo' | 'sin_cuenta' | 'haisupport' {
  if (isHaiSupportOnlyCustomer(customer)) return 'haisupport';
  if (customer.profile_id) return 'activo';
  return 'sin_cuenta';
}

export function filterCustomersInRange(customers: StoreCustomerWithRole[], range: AdminDateRange) {
  return customers.filter((customer) => isDateInRange(customer.created_at, range));
}

export function computeClientesTabCounts(customers: StoreCustomerWithRole[]): AdminClientesTabCounts {
  const counts: AdminClientesTabCounts = {
    todos: customers.length,
    con_cuenta: 0,
    sin_cuenta: 0,
    haisupport: 0,
  };

  for (const customer of customers) {
    const tab = mapCustomerToTab(customer);
    counts[tab] += 1;
  }

  return counts;
}

export function computeRoleDistribution(customers: StoreCustomerWithRole[]): AdminClientesRoleDistribution[] {
  const total = Math.max(customers.length, 1);
  const tally = new Map<CustomerRoleGroupKey, number>();
  for (const section of CUSTOMER_ROLE_SECTIONS) {
    tally.set(section.key, 0);
  }

  for (const customer of customers) {
    const key = getCustomerRoleGroupKey(customer);
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }

  return CUSTOMER_ROLE_SECTIONS.map((section) => ({
    role: section.key,
    label: section.label,
    count: tally.get(section.key) ?? 0,
    percent: Number((((tally.get(section.key) ?? 0) / total) * 100).toFixed(1)),
    color: ROLE_COLORS[section.key],
  })).filter((item) => item.count > 0);
}

export function computeAccountDistribution(
  customers: StoreCustomerWithRole[],
): AdminClientesAccountDistribution[] {
  const counts = computeClientesTabCounts(customers);
  const total = Math.max(customers.length, 1);

  return (['con_cuenta', 'sin_cuenta', 'haisupport'] as const).map((key) => ({
    key,
    label: ACCOUNT_LABELS[key],
    count: counts[key],
    percent: Number(((counts[key] / total) * 100).toFixed(1)),
    color: ACCOUNT_COLORS[key],
  }));
}

export function computeClientesGrowthSeries(
  customers: StoreCustomerWithRole[],
  range: AdminDateRange,
): AdminClientesGrowthPoint[] {
  const inRange = filterCustomersInRange(customers, range);
  const byDay = new Map<string, number>();

  for (const customer of inRange) {
    const key = customer.created_at.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  const points: AdminClientesGrowthPoint[] = [];
  const cursor = new Date(range.from);
  while (cursor <= range.to) {
    const key = cursor.toISOString().slice(0, 10);
    const day = cursor.getDate();
    const month = cursor.toLocaleDateString('es-PE', { month: 'short' });
    points.push({
      date: `${day} ${month}`,
      value: byDay.get(key) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  if (points.length > 12) {
    const step = Math.ceil(points.length / 8);
    return points.filter((_, index) => index % step === 0 || index === points.length - 1);
  }

  return points;
}

export function computeClientesKpis(
  customers: StoreCustomerWithRole[],
  range: AdminDateRange,
): AdminClientesKpi[] {
  const previous = getPreviousPeriod(range);
  const current = filterCustomersInRange(customers, range);
  const prev = filterCustomersInRange(customers, previous);

  const withAccountTotal = customers.filter((customer) => Boolean(customer.profile_id)).length;
  const withAccountCurrent = current.filter((customer) => Boolean(customer.profile_id)).length;
  const withAccountPrev = prev.filter((customer) => Boolean(customer.profile_id)).length;

  const withoutAccountTotal = customers.filter(
    (customer) => !customer.profile_id && !isHaiSupportOnlyCustomer(customer),
  ).length;
  const haiSupportTotal = customers.filter(isHaiSupportOnlyCustomer).length;

  return [
    {
      title: 'Total clientes',
      value: String(customers.length),
      trend: calcTrendPercent(current.length, prev.length) ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'total',
    },
    {
      title: 'Nuevos del periodo',
      value: String(current.length),
      trend: calcTrendPercent(current.length, prev.length) ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'new',
    },
    {
      title: 'Con cuenta',
      value: String(withAccountTotal),
      trend: calcTrendPercent(withAccountCurrent, withAccountPrev) ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'account',
    },
    {
      title: 'Sin cuenta / HaiSupport',
      value: String(withoutAccountTotal + haiSupportTotal),
      trend:
        calcTrendPercent(
          current.filter((customer) => !customer.profile_id).length,
          prev.filter((customer) => !customer.profile_id).length,
        ) ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'haisupport',
    },
  ];
}

export function matchesClientesSearch(customer: StoreCustomerWithRole, query: string) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  const roleSection = CUSTOMER_ROLE_SECTIONS.find(
    (section) => section.key === getCustomerRoleGroupKey(customer),
  );

  return (
    customer.id.toLowerCase().includes(normalized) ||
    customerDisplayName(customer).toLowerCase().includes(normalized) ||
    customerDocumentLabel(customer).includes(normalized) ||
    customer.email.toLowerCase().includes(normalized) ||
    (roleSection?.label.toLowerCase().includes(normalized) ?? false) ||
    personaDataToSearchBlob(customer.persona_data).includes(normalized)
  );
}

export function filterClientesCustomers(options: {
  customers: StoreCustomerWithRole[];
  tab: AdminClientesTab;
  search: string;
  roleFilter: string;
  accountFilter: string;
  range: AdminDateRange;
}) {
  const { customers, tab, search, roleFilter, accountFilter, range } = options;

  return filterCustomersInRange(customers, range).filter((customer) => {
    if (tab !== 'todos' && mapCustomerToTab(customer) !== tab) return false;
    if (roleFilter !== 'todos' && getCustomerRoleGroupKey(customer) !== roleFilter) return false;
    if (accountFilter !== 'todos' && mapCustomerToTab(customer) !== accountFilter) return false;
    return matchesClientesSearch(customer, search);
  });
}
