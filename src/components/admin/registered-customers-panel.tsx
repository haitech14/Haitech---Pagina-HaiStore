import { useMemo, useState } from 'react';
import { Pencil, Search, Users } from 'lucide-react';

import {
  CustomerEditDialog,
  type CustomerEditFormValues,
} from '@/components/admin/customer-edit-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAdminStoreCustomers,
  useAdminStoreCustomersMutations,
} from '@/hooks/use-admin-customers';
import {
  CUSTOMER_ROLE_SECTIONS,
  filterAndSortCustomers,
  roleBadgeLabel,
  type CustomerRoleGroupKey,
  type CustomerSortKey,
} from '@/lib/customers-by-role';
import type { StoreCustomerWithRole } from '@/types/store';

const ALL_ROLES = 'all' as const;

function formatRegisteredAt(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(iso));
}

interface RegisteredCustomersPanelProps {
  variant?: 'page' | 'embedded';
}

export function RegisteredCustomersPanel({ variant = 'page' }: RegisteredCustomersPanelProps) {
  const { data: customers = [], isLoading, isError } = useAdminStoreCustomers();
  const { updateCustomer } = useAdminStoreCustomersMutations();

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<CustomerRoleGroupKey | typeof ALL_ROLES>(ALL_ROLES);
  const [sort, setSort] = useState<CustomerSortKey>('name');
  const [editing, setEditing] = useState<StoreCustomerWithRole | null>(null);

  const filtered = useMemo(
    () =>
      filterAndSortCustomers(customers, {
        query,
        roleFilter,
        sort,
      }),
    [customers, query, roleFilter, sort],
  );

  const totalWithAccount = customers.filter((c) => c.profile_id).length;

  const handleSave = async (values: CustomerEditFormValues) => {
    if (!editing) return;
    await updateCustomer.mutateAsync({ id: editing.id, values });
  };

  const summary = !isLoading && customers.length > 0 && (
    <p className="text-sm text-muted-foreground" role="status">
      {filtered.length === customers.length
        ? `${customers.length} cliente${customers.length === 1 ? '' : 's'}`
        : `${filtered.length} de ${customers.length} clientes`}
      {totalWithAccount > 0 ? ` · ${totalWithAccount} con cuenta` : ''}
    </p>
  );

  const filters = (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[12rem] flex-1 space-y-2">
        <Label htmlFor="customers-search" className="text-xs font-medium uppercase tracking-wide">
          Buscar
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="customers-search"
            type="search"
            placeholder="Nombre, correo, empresa…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="customers-role-filter" className="text-xs font-medium uppercase tracking-wide">
          Tipo de cliente
        </Label>
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as CustomerRoleGroupKey | typeof ALL_ROLES)}
        >
          <SelectTrigger id="customers-role-filter" aria-label="Filtrar por tipo de cliente">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROLES}>Todos los tipos</SelectItem>
            {CUSTOMER_ROLE_SECTIONS.map((section) => (
              <SelectItem key={section.key} value={section.key}>
                {section.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="customers-sort" className="text-xs font-medium uppercase tracking-wide">
          Ordenar por
        </Label>
        <Select value={sort} onValueChange={(value) => setSort(value as CustomerSortKey)}>
          <SelectTrigger id="customers-sort" aria-label="Ordenar clientes">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="role">Tipo de cliente</SelectItem>
            <SelectItem value="date">Fecha de registro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const table = (
    <div className="overflow-x-auto rounded-lg border bg-card">
      {isError && (
        <p role="alert" className="p-4 text-sm text-destructive">
          No se pudieron cargar los clientes. Verifica Supabase y el servidor admin.
        </p>
      )}

      {isLoading && (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && customers.length === 0 && !isError && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Aún no hay clientes registrados en el sistema.
        </p>
      )}

      {!isLoading && customers.length > 0 && filtered.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Ningún cliente coincide con los filtros aplicados.
        </p>
      )}

      {!isLoading && filtered.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[11rem]">Cliente</TableHead>
              <TableHead className="min-w-[7rem]">Tipo de cliente</TableHead>
              <TableHead className="hidden min-w-[8rem] sm:table-cell">Empresa</TableHead>
              <TableHead className="hidden min-w-[6rem] md:table-cell">Teléfono</TableHead>
              <TableHead className="hidden w-32 lg:table-cell">Registro</TableHead>
              <TableHead className="w-14 text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <p className="font-medium">{customer.full_name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal whitespace-nowrap">
                    {roleBadgeLabel(customer)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                  {customer.company_name ?? '—'}
                </TableCell>
                <TableCell className="hidden text-sm tabular-nums md:table-cell">
                  {customer.phone ?? '—'}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                  {formatRegisteredAt(customer.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9"
                    aria-label={`Editar ${customer.full_name ?? customer.email}`}
                    onClick={() => setEditing(customer)}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  const editDialog = (
    <CustomerEditDialog
      customer={editing}
      open={editing != null}
      onOpenChange={(open) => {
        if (!open) setEditing(null);
      }}
      onSubmit={handleSave}
      isSaving={updateCustomer.isPending}
    />
  );

  if (variant === 'embedded') {
    return (
      <section className="space-y-4" aria-labelledby="settings-customers-heading">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2">
            <Users className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <h2 id="settings-customers-heading" className="text-base font-semibold">
                Clientes registrados
              </h2>
              <p className="text-sm text-muted-foreground">
                Listado único con tipo de cliente, filtros y edición de datos.
              </p>
            </div>
          </div>
          {summary}
        </div>
        {filters}
        {table}
        {editDialog}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-balance">Clientes registrados</h2>
        <p className="text-muted-foreground">
          Todos los clientes en una sola tabla. El tipo de cliente define la lista de precios en la
          tienda.
        </p>
        {summary}
      </header>
      {filters}
      {table}
      {editDialog}
    </div>
  );
}
