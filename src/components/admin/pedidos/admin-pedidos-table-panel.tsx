import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Filter,
  Globe,
  Search,
  ShoppingBag,
  Store,
} from 'lucide-react';

import { AdminDateRangePicker } from '@/components/admin/AdminDateRangePicker';
import { AdminPaymentStatusBadge } from '@/components/admin/AdminPaymentStatusBadge';
import { AdminPedidosStatusBadge } from '@/components/admin/pedidos/admin-pedidos-status-badge';
import { AdminPedidosRowActions } from '@/components/admin/pedidos/admin-pedidos-row-actions';
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
  CHANNEL_LABELS,
  computePedidosTabCounts,
  filterPedidosOrders,
  formatPedidosOrderTotal,
  mapOrderChannel,
  mapOrderToPedidosTab,
  orderCustomerLabel,
  orderCustomerRuc,
} from '@/lib/admin-pedidos-utils';
import { cn } from '@/lib/utils';
import type { AdminPedidosChannel, AdminPedidosTab } from '@/types/admin-pedidos';
import type { StoreOrder } from '@/types/store';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const CHANNEL_META: Record<
  AdminPedidosChannel,
  { icon: typeof Globe; iconClassName: string }
> = {
  web: { icon: Globe, iconClassName: 'text-blue-600' },
  tpv: { icon: Store, iconClassName: 'text-violet-600' },
  mercadopago: { icon: CreditCard, iconClassName: 'text-sky-600' },
  transferencia: { icon: CreditCard, iconClassName: 'text-emerald-600' },
  otro: { icon: ShoppingBag, iconClassName: 'text-amber-600' },
};

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

interface AdminPedidosTablePanelProps {
  orders: StoreOrder[];
  range: AdminDateRange;
  onRangeChange: (range: AdminDateRange) => void;
  isLoading?: boolean;
}

export function AdminPedidosTablePanel({
  orders,
  range,
  onRangeChange,
  isLoading,
}: AdminPedidosTablePanelProps) {
  const [activeTab, setActiveTab] = useState<AdminPedidosTab>('todos');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [paymentFilter, setPaymentFilter] = useState<string>('todos');
  const [channelFilter, setChannelFilter] = useState<string>('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const tabCounts = useMemo(() => computePedidosTabCounts(filterPedidosOrders({
    orders,
    tab: 'todos',
    search: '',
    statusFilter: 'todos',
    paymentFilter: 'todos',
    channelFilter: 'todos',
    range,
  })), [orders, range]);

  const tabs: Array<{ key: AdminPedidosTab; label: string; count?: number }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendiente', label: 'Pendientes', count: tabCounts.pendiente },
    { key: 'en_proceso', label: 'En proceso', count: tabCounts.en_proceso },
    { key: 'entregado', label: 'Entregados', count: tabCounts.entregado },
    { key: 'cancelado', label: 'Cancelados', count: tabCounts.cancelado },
  ];

  const filteredOrders = useMemo(
    () =>
      filterPedidosOrders({
        orders,
        tab: activeTab,
        search,
        statusFilter,
        paymentFilter,
        channelFilter,
        range,
      }),
    [activeTab, channelFilter, orders, paymentFilter, range, search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = filteredOrders.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredOrders.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const handleTabChange = (tab: AdminPedidosTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 pt-4 sm:px-5">
        <div role="tablist" aria-label="Filtrar pedidos por estado" className="flex flex-wrap gap-1">
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
            placeholder="Buscar por cliente, pedido o canal…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar pedidos"
          />
        </div>

        <Select
          value={channelFilter}
          onValueChange={(value) => {
            setChannelFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Filtrar por canal">
            <SelectValue placeholder="Canal: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Canal: Todos</SelectItem>
            <SelectItem value="web">Tienda web</SelectItem>
            <SelectItem value="tpv">Punto de venta</SelectItem>
            <SelectItem value="mercadopago">Mercado Pago</SelectItem>
            <SelectItem value="transferencia">Transferencia</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10rem]" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Estado: Todos</SelectItem>
            <SelectItem value="pending_payment">Pago pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="processing">En preparación</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentFilter}
          onValueChange={(value) => {
            setPaymentFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Filtrar por pago">
            <SelectValue placeholder="Pago: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Pago: Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="failed">Fallido</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
          </SelectContent>
        </Select>

        <AdminDateRangePicker variant="toolbar" value={range} onChange={onRangeChange} />

        <Button type="button" variant="outline" className="h-8 gap-1.5 bg-background text-xs">
          <Filter className="size-4" aria-hidden="true" />
          Filtros
        </Button>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground" role="status">
            Cargando pedidos…
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[8.5rem] px-4">Fecha</TableHead>
                <TableHead className="min-w-[6.5rem]">Pedido</TableHead>
                <TableHead className="min-w-[11rem]">Cliente</TableHead>
                <TableHead className="min-w-[9rem]">Canal</TableHead>
                <TableHead className="min-w-[7rem]">Estado</TableHead>
                <TableHead className="min-w-[5.5rem]">Pago</TableHead>
                <TableHead className="min-w-[6.5rem]">Total</TableHead>
                <TableHead className="w-12 px-4 text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No hay pedidos que coincidan con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => {
                  const channel = mapOrderChannel(order);
                  const channelMeta = CHANNEL_META[channel];
                  const ChannelIcon = channelMeta.icon;
                  const tabStatus = mapOrderToPedidosTab(order);

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="px-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-[hsl(var(--admin-accent))]">
                          {order.order_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {orderCustomerLabel(order)}
                          </p>
                          <p className="text-xs text-muted-foreground">{orderCustomerRuc(order)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ChannelIcon
                            className={cn('size-4 shrink-0', channelMeta.iconClassName)}
                            aria-hidden="true"
                          />
                          <span className="text-sm">{CHANNEL_LABELS[channel]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AdminPedidosStatusBadge status={tabStatus} />
                      </TableCell>
                      <TableCell>
                        <AdminPaymentStatusBadge status={order.payment_status} />
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">
                        {formatPedidosOrderTotal(order)}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <AdminPedidosRowActions order={order} />
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
        aria-label="Paginación de pedidos"
        className="flex flex-col gap-3 border-t bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-muted-foreground">
          Mostrando{' '}
          <span className="font-medium text-foreground">
            {start} a {end}
          </span>{' '}
          de <span className="font-medium text-foreground">{filteredOrders.length}</span> pedidos
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
            <SelectTrigger className="h-8 w-[8.5rem] bg-background text-xs" aria-label="Pedidos por página">
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
