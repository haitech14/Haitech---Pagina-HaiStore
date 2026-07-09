import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react';

import { AdminDateRangePicker } from '@/components/admin/AdminDateRangePicker';
import { AdminEnviosRowActions } from '@/components/admin/envios/admin-envios-row-actions';
import { AdminEnviosStatusBadge } from '@/components/admin/envios/admin-envios-status-badge';
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
  carrierDisplayMeta,
  computeEnviosTabCounts,
  filterEnviosShipments,
  formatEnviosDestination,
} from '@/lib/admin-envios-utils';
import { loadShippingCarriers, loadShippingZones } from '@/lib/shipping-storage';
import { cn } from '@/lib/utils';
import type { AdminEnviosTab } from '@/types/admin-envios';
import type { ShipmentRecord, ShipmentStatus } from '@/types/shipping';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const NEXT_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  pending_pickup: 'in_transit',
  in_transit: 'out_for_delivery',
  out_for_delivery: 'delivered',
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

interface AdminEnviosTablePanelProps {
  shipments: ShipmentRecord[];
  range: AdminDateRange;
  onRangeChange: (range: AdminDateRange) => void;
  onRefresh: () => void;
  onEdit: (shipment: ShipmentRecord) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAdvanceStatus: (id: string, status: ShipmentStatus) => void;
}

export function AdminEnviosTablePanel({
  shipments,
  range,
  onRangeChange,
  onRefresh,
  onEdit,
  onDuplicate,
  onDelete,
  onAdvanceStatus,
}: AdminEnviosTablePanelProps) {
  const [activeTab, setActiveTab] = useState<AdminEnviosTab>('todos');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [carrierFilter, setCarrierFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const carriers = useMemo(() => loadShippingCarriers(), []);
  const zones = useMemo(() => loadShippingZones(), []);
  const zoneName = useMemo(() => {
    const map = new Map(zones.map((zone) => [zone.id, zone.name]));
    return (id: string) => map.get(id as (typeof zones)[number]['id']) ?? id;
  }, [zones]);
  const carrierName = useMemo(() => {
    const map = new Map(carriers.map((carrier) => [carrier.id, carrier.name]));
    return (id: string) => map.get(id) ?? id;
  }, [carriers]);

  const tabCounts = useMemo(
    () =>
      computeEnviosTabCounts(
        filterEnviosShipments({
          shipments,
          tab: 'todos',
          search: '',
          statusFilter: 'todos',
          carrierFilter: 'todos',
          range,
        }),
        range,
      ),
    [shipments, range],
  );

  const tabs: Array<{ key: AdminEnviosTab; label: string; count?: number }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'en_transito', label: 'En tránsito', count: tabCounts.en_transito },
    { key: 'entregados', label: 'Entregados', count: tabCounts.entregados },
    { key: 'pendientes', label: 'Pendientes', count: tabCounts.pendientes },
    { key: 'devueltos', label: 'Devueltos', count: tabCounts.devueltos },
    { key: 'incidencias', label: 'Incidencias', count: tabCounts.incidencias },
  ];

  const filtered = useMemo(
    () =>
      filterEnviosShipments({
        shipments,
        tab: activeTab,
        search,
        statusFilter,
        carrierFilter,
        range,
      }),
    [activeTab, carrierFilter, range, search, shipments, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filtered.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const handleTabChange = (tab: AdminEnviosTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 pt-4 sm:px-5">
        <div role="tablist" aria-label="Filtrar envíos" className="flex flex-wrap gap-1">
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
        <div className="relative min-w-[14rem] flex-1 sm:max-w-md">
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
            placeholder="Buscar por tracking, pedido, cliente o destino…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar envíos"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[9.5rem] bg-background text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Estado: Todos</SelectItem>
            <SelectItem value="pending_pickup">Preparando</SelectItem>
            <SelectItem value="in_transit">En ruta</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="failed">Devuelto</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={carrierFilter}
          onValueChange={(value) => {
            setCarrierFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[10.5rem] bg-background text-xs">
            <SelectValue placeholder="Transportadora" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Transportadora: Todas</SelectItem>
            {carriers.map((carrier) => (
              <SelectItem key={carrier.id} value={carrier.id}>
                {carrier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AdminDateRangePicker value={range} onChange={onRangeChange} className="h-8" />

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 bg-background"
          aria-label="Actualizar listado"
          onClick={onRefresh}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
        </Button>

        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          <Button type="button" variant="ghost" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground">
            <Star className="size-3.5" aria-hidden="true" />
            Guardar vista
          </Button>
          <Button type="button" variant="ghost" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground">
            <Filter className="size-3.5" aria-hidden="true" />
            Más filtros
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[0.65rem] font-semibold uppercase tracking-wide">Fecha</TableHead>
              <TableHead className="text-[0.65rem] font-semibold uppercase tracking-wide">Tracking</TableHead>
              <TableHead className="text-[0.65rem] font-semibold uppercase tracking-wide">Pedido</TableHead>
              <TableHead className="text-[0.65rem] font-semibold uppercase tracking-wide">Transportadora</TableHead>
              <TableHead className="text-[0.65rem] font-semibold uppercase tracking-wide">Destino</TableHead>
              <TableHead className="text-[0.65rem] font-semibold uppercase tracking-wide">Fecha estimada</TableHead>
              <TableHead className="text-[0.65rem] font-semibold uppercase tracking-wide">Estado</TableHead>
              <TableHead className="text-[0.65rem] font-semibold uppercase tracking-wide">Incidencias</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                  No hay envíos que coincidan con los filtros.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => {
                const carrier = carrierDisplayMeta(row.carrierId);
                const incidents = row.incidentsCount ?? 0;
                const nextStatus = NEXT_STATUS[row.status];

                return (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(row.createdAt), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[hsl(var(--admin-accent))] hover:underline"
                        onClick={() => onEdit(row)}
                      >
                        {row.trackingCode}
                      </button>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{row.orderRef}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-bold text-white"
                          style={{ backgroundColor: carrier.color }}
                          aria-hidden="true"
                        >
                          {carrier.initials}
                        </span>
                        <span className="text-xs">{carrier.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[12rem] text-xs text-muted-foreground">
                      {formatEnviosDestination(row)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {row.estimatedDeliveryDate
                        ? format(new Date(row.estimatedDeliveryDate), 'dd/MM/yyyy', { locale: es })
                        : row.etaLabel}
                    </TableCell>
                    <TableCell>
                      <AdminEnviosStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex size-6 items-center justify-center rounded-full text-xs font-bold',
                          incidents > 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700',
                        )}
                      >
                        {incidents}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminEnviosRowActions
                        shipment={row}
                        carrierName={carrierName(row.carrierId)}
                        zoneName={zoneName(row.zoneId)}
                        {...(nextStatus
                          ? {
                              nextStatus,
                              onAdvance: () => onAdvanceStatus(row.id, nextStatus),
                            }
                          : {})}
                        onDuplicate={() => onDuplicate(row.id)}
                        onDelete={() => onDelete(row.id)}
                        onEdit={() => onEdit(row)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Mostrando {start} a {end} de {filtered.length} envíos
        </p>

        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>

          {pageItems.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-xs text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === safePage ? 'default' : 'outline'}
                className={cn('size-8 text-xs', item === safePage && 'bg-[hsl(var(--admin-accent))]')}
                onClick={() => setPage(item)}
              >
                {item}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={safePage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
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
          <SelectTrigger className="h-8 w-[8.5rem] bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} por página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
