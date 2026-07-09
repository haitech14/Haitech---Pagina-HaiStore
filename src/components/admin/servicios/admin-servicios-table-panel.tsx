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
  Wrench,
} from 'lucide-react';

import { AdminDateRangePicker } from '@/components/admin/AdminDateRangePicker';
import {
  AdminServiciosCategoriaBadge,
  AdminServiciosEstadoBadge,
  AdminServiciosResponsableCell,
} from '@/components/admin/servicios/admin-servicios-badges';
import { AdminServiciosRowActions } from '@/components/admin/servicios/admin-servicios-row-actions';
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
import type { AdminDateRange } from '@/lib/admin-date-range-presets';
import { endOfDay, startOfDay } from '@/lib/admin-date-range-presets';
import {
  SERVICIO_MODALIDAD_LABELS,
  computeServiciosTabCounts,
  filterServicios,
} from '@/lib/admin-servicios-utils';
import { cn } from '@/lib/utils';
import type { AdminServicioRecord, AdminServiciosTab } from '@/types/admin-servicios';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function getServiciosDefaultRange(): AdminDateRange {
  return {
    from: startOfDay(new Date(2024, 0, 1)),
    to: endOfDay(new Date(2026, 11, 31)),
  };
}

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

interface AdminServiciosTablePanelProps {
  headerSearch?: string;
  services: readonly AdminServicioRecord[];
  responsableOptions: ReadonlyArray<{ value: string; label: string }>;
  isLoading?: boolean;
  onEdit?: (service: AdminServicioRecord) => void;
  onDelete?: (sourceId: string) => void;
  onToggleArchive?: (service: AdminServicioRecord) => void;
}

export function AdminServiciosTablePanel({
  headerSearch = '',
  services,
  responsableOptions,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleArchive,
}: AdminServiciosTablePanelProps) {
  const [activeTab, setActiveTab] = useState<AdminServiciosTab>('todos');
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  const [responsableFilter, setResponsableFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [range, setRange] = useState<AdminDateRange>(getServiciosDefaultRange);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const combinedSearch = headerSearch.trim() || search;

  const tabCounts = useMemo(() => computeServiciosTabCounts(services), [services]);

  const tabs: Array<{ key: AdminServiciosTab; label: string; count?: number }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'activos', label: 'Activos', count: tabCounts.activos },
    { key: 'programados', label: 'Programados', count: tabCounts.programados },
    { key: 'pausados', label: 'Pausados', count: tabCounts.pausados },
    { key: 'archivados', label: 'Archivados', count: tabCounts.archivados },
  ];

  const filteredServices = useMemo(
    () =>
      filterServicios({
        services,
        tab: activeTab,
        search: combinedSearch,
        categoriaFilter,
        responsableFilter,
        tipoFilter,
        range,
      }),
    [activeTab, categoriaFilter, combinedSearch, range, responsableFilter, services, tipoFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedServices = filteredServices.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = filteredServices.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredServices.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const handleTabChange = (tab: AdminServiciosTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div role="tablist" aria-label="Filtrar servicios por estado" className="flex flex-wrap gap-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'inline-flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-[hsl(var(--admin-accent))] text-[hsl(var(--admin-accent))]'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
                {tab.count !== undefined ? (
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-xs font-semibold',
                      isActive ? 'bg-[hsl(var(--admin-accent))]/10' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <Button type="button" variant="outline" className="h-8 gap-1.5 bg-background text-xs">
            <Star className="size-3.5" aria-hidden="true" />
            Guardar vista
          </Button>
          <Button type="button" variant="outline" className="h-8 gap-1.5 bg-background text-xs">
            <Filter className="size-3.5" aria-hidden="true" />
            Más filtros
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
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
            placeholder="Buscar por servicio, categoría o responsable…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar servicios en la tabla"
          />
        </div>

        <Select
          value={categoriaFilter}
          onValueChange={(value) => {
            setCategoriaFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Categoría: Todas</SelectItem>
            <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            <SelectItem value="instalacion">Instalación</SelectItem>
            <SelectItem value="soporte">Soporte</SelectItem>
            <SelectItem value="consultoria">Consultoría</SelectItem>
            <SelectItem value="otros">Otros</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={responsableFilter}
          onValueChange={(value) => {
            setResponsableFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10rem]">
            <SelectValue placeholder="Responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Responsable: Todos</SelectItem>
            {responsableOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={tipoFilter}
          onValueChange={(value) => {
            setTipoFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[8.5rem]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Tipo: Todos</SelectItem>
            <SelectItem value="unico">Único</SelectItem>
            <SelectItem value="mensual">Mensual</SelectItem>
            <SelectItem value="proyecto">Proyecto</SelectItem>
          </SelectContent>
        </Select>

        <AdminDateRangePicker variant="toolbar" value={range} onChange={setRange} />

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 bg-background"
          aria-label="Restablecer filtros"
          onClick={() => {
            setSearch('');
            setCategoriaFilter('todos');
            setResponsableFilter('todos');
            setTipoFilter('todos');
            setRange(getServiciosDefaultRange());
            setPage(1);
          }}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="whitespace-nowrap text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Fecha
              </TableHead>
              <TableHead className="whitespace-nowrap text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Servicio
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Categoría
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Modalidad
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Precio base
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Cobertura
              </TableHead>
              <TableHead className="min-w-[9rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Responsable
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                  Cargando catálogo de servicios…
                </TableCell>
              </TableRow>
            ) : paginatedServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Wrench className="size-8 opacity-40" aria-hidden="true" />
                    <p>No hay servicios que coincidan con los filtros.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(service.createdAt), "d 'de' MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[8rem]">
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminServiciosCategoriaBadge categoria={service.categoria} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {SERVICIO_MODALIDAD_LABELS[service.modalidad]}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-medium text-foreground">
                    {service.precioLabel}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{service.cobertura}</TableCell>
                  <TableCell>
                    <AdminServiciosResponsableCell {...service.responsable} />
                  </TableCell>
                  <TableCell>
                    <AdminServiciosEstadoBadge estado={service.estado} />
                  </TableCell>
                  <TableCell>
                    <AdminServiciosRowActions
                      service={service}
                      {...(onEdit ? { onEdit } : {})}
                      {...(onDelete ? { onDelete } : {})}
                      {...(onToggleArchive ? { onToggleArchive } : {})}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-muted-foreground">
          Mostrando {start} a {end} de {filteredServices.length} servicios
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
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
                  size="icon"
                  className={cn(
                    'size-8 text-xs',
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
            <SelectTrigger className="h-8 w-[7.5rem] text-xs">
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
      </div>
    </section>
  );
}
