import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Headset,
  Search,
  Store,
  UserRound,
  Users,
} from 'lucide-react';

import { AdminClientesRoleBadge } from '@/components/admin/clientes/admin-clientes-role-badge';
import { AdminClientesRowActions } from '@/components/admin/clientes/admin-clientes-row-actions';
import { AdminClientesStatusBadge } from '@/components/admin/clientes/admin-clientes-status-badge';
import { AdminDateRangePicker } from '@/components/admin/AdminDateRangePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { AdminDateRange } from '@/components/admin/AdminDateRangePicker';
import {
  computeClientesTabCounts,
  customerAccountStatus,
  customerDisplayName,
  customerDocumentLabel,
  customerShortId,
  filterClientesCustomers,
} from '@/lib/admin-clientes-utils';
import { CUSTOMER_ROLE_SECTIONS, getCustomerRoleGroupKey } from '@/lib/customers-by-role';
import { getPersonaCellValue } from '@/lib/persona-report-columns';
import { cn } from '@/lib/utils';
import type { AdminClientesTab } from '@/types/admin-clientes';
import type { StoreCustomerWithRole } from '@/types/store';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const ROLE_ICON_META = {
  admin: { icon: Users, iconClassName: 'text-violet-600' },
  tecnico: { icon: UserRound, iconClassName: 'text-blue-600' },
  distribuidor: { icon: Store, iconClassName: 'text-amber-600' },
  mayorista: { icon: Store, iconClassName: 'text-emerald-600' },
  public: { icon: Users, iconClassName: 'text-sky-600' },
  guest: { icon: UserRound, iconClassName: 'text-slate-500' },
} as const;

function buildPageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const items: Array<number | 'ellipsis'> = [1];
  if (current > 3) items.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) items.push(page);

  if (current < total - 2) items.push('ellipsis');
  items.push(total);
  return items;
}

interface AdminClientesTablePanelProps {
  customers: StoreCustomerWithRole[];
  range: AdminDateRange;
  onRangeChange: (range: AdminDateRange) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export function AdminClientesTablePanel({
  customers,
  range,
  onRangeChange,
  isLoading,
  isError,
  errorMessage,
}: AdminClientesTablePanelProps) {
  const [activeTab, setActiveTab] = useState<AdminClientesTab>('todos');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [accountFilter, setAccountFilter] = useState<string>('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const tabCounts = useMemo(
    () =>
      computeClientesTabCounts(
        filterClientesCustomers({
          customers,
          tab: 'todos',
          search: '',
          roleFilter: 'todos',
          accountFilter: 'todos',
          range,
        }),
      ),
    [customers, range],
  );

  const tabs: Array<{ key: AdminClientesTab; label: string; count?: number }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'con_cuenta', label: 'Con cuenta', count: tabCounts.con_cuenta },
    { key: 'sin_cuenta', label: 'Sin cuenta', count: tabCounts.sin_cuenta },
    ...(tabCounts.haisupport > 0
      ? [{ key: 'haisupport' as const, label: 'HaiSupport', count: tabCounts.haisupport }]
      : []),
  ];

  const filteredCustomers = useMemo(
    () =>
      filterClientesCustomers({
        customers,
        tab: activeTab,
        search,
        roleFilter,
        accountFilter,
        range,
      }),
    [accountFilter, activeTab, customers, range, roleFilter, search],
  );

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedCustomers = filteredCustomers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = filteredCustomers.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredCustomers.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const handleTabChange = (tab: AdminClientesTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 pt-4 sm:px-5">
        <div role="tablist" aria-label="Filtrar clientes por cuenta" className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[hsl(var(--admin-accent))] text-white'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
                {tab.count !== undefined ? (
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-xs font-semibold',
                      isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por cliente, documento o correo…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar clientes"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Filtrar por tipo">
            <SelectValue placeholder="Tipo: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Tipo: Todos</SelectItem>
            {CUSTOMER_ROLE_SECTIONS.map((section) => (
              <SelectItem key={section.key} value={section.key}>
                {section.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={accountFilter}
          onValueChange={(value) => {
            setAccountFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Filtrar por cuenta">
            <SelectValue placeholder="Cuenta: Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Cuenta: Todas</SelectItem>
            <SelectItem value="con_cuenta">Con cuenta</SelectItem>
            <SelectItem value="sin_cuenta">Sin cuenta</SelectItem>
            <SelectItem value="haisupport">HaiSupport</SelectItem>
          </SelectContent>
        </Select>

        <AdminDateRangePicker variant="toolbar" value={range} onChange={onRangeChange} />

        <Button type="button" variant="outline" className="h-8 gap-1.5 bg-background text-xs">
          <Filter className="size-4" aria-hidden="true" />
          Filtros
        </Button>
      </div>

      <div className="overflow-x-auto">
        {isError ? (
          <p role="alert" className="p-6 text-sm text-destructive">
            {errorMessage ??
              'No se pudieron cargar los clientes. Verifica Supabase y el servidor admin.'}
          </p>
        ) : isLoading ? (
          <p className="p-6 text-sm text-muted-foreground" role="status">
            Cargando clientes…
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[8.5rem] px-4">Fecha</TableHead>
                <TableHead className="min-w-[6.5rem]">ID</TableHead>
                <TableHead className="min-w-[11rem]">Cliente</TableHead>
                <TableHead className="min-w-[8rem]">Tipo</TableHead>
                <TableHead className="min-w-[7rem]">Cuenta</TableHead>
                <TableHead className="min-w-[7rem]">Canal</TableHead>
                <TableHead className="min-w-[8rem]">Vendedor</TableHead>
                <TableHead className="w-12 px-4 text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No hay clientes que coincidan con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => {
                  const roleKey = getCustomerRoleGroupKey(customer);
                  const roleMeta = ROLE_ICON_META[roleKey];
                  const RoleIcon = roleMeta.icon;
                  const accountStatus = customerAccountStatus(customer);
                  const canal =
                    getPersonaCellValue(customer, 'canal_ruta') ||
                    (customer.source === 'haisupport' ? 'HaiSupport' : 'Tienda');
                  const vendedor = getPersonaCellValue(customer, 'vendedor') || '—';

                  return (
                    <TableRow key={`${customer.source ?? 'store'}:${customer.id}`}>
                      <TableCell className="px-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(customer.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-[hsl(var(--admin-accent))]">
                          {customerShortId(customer)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {customerDisplayName(customer)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {customerDocumentLabel(customer)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <RoleIcon
                            className={cn('size-4 shrink-0', roleMeta.iconClassName)}
                            aria-hidden="true"
                          />
                          <AdminClientesRoleBadge role={roleKey} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <AdminClientesStatusBadge status={accountStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          {customer.source === 'haisupport' ? (
                            <Headset className="size-4 text-violet-600" aria-hidden="true" />
                          ) : null}
                          <span>{canal}</span>
                        </div>
                      </TableCell>
                      <TableCell className="truncate text-sm">{vendedor}</TableCell>
                      <TableCell className="px-4 text-right">
                        <AdminClientesRowActions customer={customer} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <nav
        aria-label="Paginación de clientes"
        className="flex flex-col gap-3 border-t bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-muted-foreground">
          Mostrando{' '}
          <span className="font-medium text-foreground">
            {start} a {end}
          </span>{' '}
          de <span className="font-medium text-foreground">{filteredCustomers.length}</span> clientes
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>

            {pageItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1 text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  variant={item === safePage ? 'default' : 'outline'}
                  size="icon"
                  className={cn(
                    'size-9 tabular-nums',
                    item === safePage &&
                      'bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-hover))]',
                  )}
                  onClick={() => setPage(item)}
                  aria-label={`Página ${item}`}
                  aria-current={item === safePage ? 'page' : undefined}
                >
                  {item}
                </Button>
              ),
            )}

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[8.5rem] bg-background text-xs" aria-label="Clientes por página">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </nav>
    </section>
  );
}
