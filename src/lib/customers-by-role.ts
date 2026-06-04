import { personaDataToSearchBlob } from '@/lib/persona-report-columns';
import { USER_ROLE_LABELS, type UserRole } from '@/types/product';
import type { StoreCustomerWithRole } from '@/types/store';

export type CustomerRoleGroupKey =
  | 'admin'
  | 'tecnico'
  | 'distribuidor'
  | 'mayorista'
  | 'public'
  | 'guest';

export interface CustomerRoleSection {
  key: CustomerRoleGroupKey;
  label: string;
  description: string;
}

export const CUSTOMER_ROLE_SECTIONS: CustomerRoleSection[] = [
  {
    key: 'admin',
    label: 'Administrador',
    description: 'Acceso completo al panel y catálogo.',
  },
  {
    key: 'tecnico',
    label: 'Técnico',
    description: 'Lista de precios técnica (incluye rol corporativo).',
  },
  {
    key: 'distribuidor',
    label: 'Distribuidor',
    description: 'Lista distribuidor (incluye rol VIP).',
  },
  {
    key: 'mayorista',
    label: 'Mayorista',
    description: 'Lista de precios mayorista.',
  },
  {
    key: 'public',
    label: 'Público',
    description: 'Precio de tienda estándar con cuenta registrada.',
  },
  {
    key: 'guest',
    label: 'Sin cuenta vinculada',
    description: 'Cliente en base de datos sin perfil de acceso.',
  },
];

export function isHaiSupportOnlyCustomer(customer: StoreCustomerWithRole): boolean {
  return customer.source === 'haisupport';
}

export function getCustomerRoleGroupKey(customer: StoreCustomerWithRole): CustomerRoleGroupKey {
  if (!customer.profile_id && customer.source !== 'haisupport') {
    return 'guest';
  }

  const role = customer.profile_role ?? 'public';
  if (role === 'admin') return 'admin';
  if (role === 'tecnico' || role === 'corporativo') return 'tecnico';
  if (role === 'distribuidor' || role === 'vip') return 'distribuidor';
  if (role === 'mayorista') return 'mayorista';
  return 'public';
}

/** Roles asignables al editar un cliente con cuenta. */
export const CUSTOMER_EDIT_ROLES: { value: UserRole; label: string }[] = [
  { value: 'public', label: USER_ROLE_LABELS.public },
  { value: 'mayorista', label: USER_ROLE_LABELS.mayorista },
  { value: 'tecnico', label: USER_ROLE_LABELS.tecnico },
  { value: 'corporativo', label: USER_ROLE_LABELS.corporativo },
  { value: 'distribuidor', label: USER_ROLE_LABELS.distribuidor },
  { value: 'vip', label: USER_ROLE_LABELS.vip },
  { value: 'admin', label: USER_ROLE_LABELS.admin },
];

export function roleBadgeLabel(customer: StoreCustomerWithRole): string {
  if (customer.source === 'haisupport' && !customer.profile_id) {
    const role = customer.profile_role ?? 'public';
    if (role in USER_ROLE_LABELS) return USER_ROLE_LABELS[role as UserRole];
    return role;
  }
  if (!customer.profile_id) return 'Sin cuenta';
  const role = customer.profile_role ?? 'public';
  if (role in USER_ROLE_LABELS) return USER_ROLE_LABELS[role as UserRole];
  return role;
}

export type CustomerSortKey = 'name' | 'date' | 'role';

const ROLE_GROUP_ORDER: CustomerRoleGroupKey[] = [
  'admin',
  'tecnico',
  'distribuidor',
  'mayorista',
  'public',
  'guest',
];

export function filterAndSortCustomers(
  customers: StoreCustomerWithRole[],
  options: {
    query: string;
    roleFilter: CustomerRoleGroupKey | 'all';
    sort: CustomerSortKey;
  },
): StoreCustomerWithRole[] {
  const q = options.query.trim().toLowerCase();
  let list = customers;

  if (options.roleFilter !== 'all') {
    list = list.filter((customer) => getCustomerRoleGroupKey(customer) === options.roleFilter);
  }

  if (q) {
    list = list.filter((customer) => {
      const haystack = [
        customer.full_name,
        customer.email,
        customer.company_name,
        customer.phone,
        customer.tax_id,
        personaDataToSearchBlob(customer.persona_data),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  const sorted = [...list];
  if (options.sort === 'name') {
    sorted.sort((a, b) =>
      (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email, 'es'),
    );
  } else if (options.sort === 'date') {
    sorted.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } else {
    sorted.sort((a, b) => {
      const ai = ROLE_GROUP_ORDER.indexOf(getCustomerRoleGroupKey(a));
      const bi = ROLE_GROUP_ORDER.indexOf(getCustomerRoleGroupKey(b));
      if (ai !== bi) return ai - bi;
      return (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email, 'es');
    });
  }

  return sorted;
}

export function groupCustomersByRole(
  customers: StoreCustomerWithRole[],
): Map<CustomerRoleGroupKey, StoreCustomerWithRole[]> {
  const groups = new Map<CustomerRoleGroupKey, StoreCustomerWithRole[]>();
  for (const section of CUSTOMER_ROLE_SECTIONS) {
    groups.set(section.key, []);
  }

  for (const customer of customers) {
    const key = getCustomerRoleGroupKey(customer);
    groups.get(key)?.push(customer);
  }

  for (const [, list] of groups) {
    list.sort((a, b) => (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email, 'es'));
  }

  return groups;
}
