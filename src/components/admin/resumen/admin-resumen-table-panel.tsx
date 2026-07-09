import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Headset,
  MoreVertical,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Users,
} from 'lucide-react';

import { AdminResumenPriorityBadge } from '@/components/admin/resumen/admin-resumen-priority-badge';
import { AdminResumenStatusBadge } from '@/components/admin/resumen/admin-resumen-status-badge';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import {
  ADMIN_RESUMEN_RECORDS,
  ADMIN_RESUMEN_TAB_COUNTS,
} from '@/data/admin-resumen-data';
import { cn } from '@/lib/utils';
import type {
  AdminResumenModule,
  AdminResumenPriority,
  AdminResumenRecord,
  AdminResumenStatus,
} from '@/types/admin-resumen';

type StatusTab = 'todos' | AdminResumenStatus;

const TABS: Array<{ key: StatusTab; label: string; count?: number }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendiente', label: 'Pendientes', count: ADMIN_RESUMEN_TAB_COUNTS.pendiente },
  { key: 'en_proceso', label: 'En proceso', count: ADMIN_RESUMEN_TAB_COUNTS.en_proceso },
  { key: 'resuelto', label: 'Resueltos', count: ADMIN_RESUMEN_TAB_COUNTS.resuelto },
  { key: 'cancelado', label: 'Cancelados', count: ADMIN_RESUMEN_TAB_COUNTS.cancelado },
];

const MODULE_META: Record<
  AdminResumenModule,
  { label: string; icon: typeof Headset; iconClassName: string }
> = {
  soporte: { label: 'Soporte Técnico', icon: Headset, iconClassName: 'text-violet-600' },
  ventas: { label: 'Ventas', icon: ShoppingBag, iconClassName: 'text-blue-600' },
  inventario: { label: 'Inventario', icon: Package, iconClassName: 'text-amber-600' },
  compras: { label: 'Compras', icon: ShoppingCart, iconClassName: 'text-emerald-600' },
  clientes: { label: 'Clientes', icon: Users, iconClassName: 'text-sky-600' },
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

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

function matchesSearch(record: AdminResumenRecord, query: string) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return (
    record.id.toLowerCase().includes(normalized) ||
    record.clientName.toLowerCase().includes(normalized) ||
    record.clientRuc.includes(normalized) ||
    MODULE_META[record.module].label.toLowerCase().includes(normalized)
  );
}

export function AdminResumenTablePanel() {
  const [activeTab, setActiveTab] = useState<StatusTab>('todos');
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todas');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const filteredRecords = useMemo(() => {
    return ADMIN_RESUMEN_RECORDS.filter((record) => {
      if (activeTab !== 'todos' && record.status !== activeTab) return false;
      if (moduleFilter !== 'todos' && record.module !== moduleFilter) return false;
      if (statusFilter !== 'todos' && record.status !== statusFilter) return false;
      if (priorityFilter !== 'todas' && record.priority !== priorityFilter) return false;
      return matchesSearch(record, search);
    });
  }, [activeTab, moduleFilter, priorityFilter, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = filteredRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredRecords.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 sm:px-5">
        <div
          role="tablist"
          aria-label="Filtrar registros por estado"
          className="flex flex-wrap gap-2"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const tabLabel =
              tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-[hsl(var(--admin-accent))] text-[hsl(var(--admin-accent))]'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                )}
                onClick={() => handleTabChange(tab.key)}
              >
                {tabLabel}
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
            placeholder="Buscar por cliente..."
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar registros"
          />
        </div>

        <Select
          value={moduleFilter}
          onValueChange={(value) => {
            setModuleFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Filtrar por módulo">
            <SelectValue placeholder="Módulo: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Módulo: Todos</SelectItem>
            <SelectItem value="soporte">Soporte Técnico</SelectItem>
            <SelectItem value="ventas">Ventas</SelectItem>
            <SelectItem value="inventario">Inventario</SelectItem>
            <SelectItem value="compras">Compras</SelectItem>
            <SelectItem value="clientes">Clientes</SelectItem>
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
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_proceso">En proceso</SelectItem>
            <SelectItem value="resuelto">Resuelto</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(value) => {
            setPriorityFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Filtrar por prioridad">
            <SelectValue placeholder="Prioridad: Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Prioridad: Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>

        <Button type="button" variant="outline" className="h-8 gap-1.5 bg-background text-xs">
          <Calendar className="size-4" aria-hidden="true" />
          01/05/2026 - 31/05/2026
        </Button>

        <Button type="button" variant="outline" className="h-8 gap-1.5 bg-background text-xs">
          <Filter className="size-4" aria-hidden="true" />
          Filtros
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[8.5rem] px-4">Fecha</TableHead>
              <TableHead className="min-w-[6.5rem]">ID</TableHead>
              <TableHead className="min-w-[11rem]">Cliente</TableHead>
              <TableHead className="min-w-[9rem]">Módulo</TableHead>
              <TableHead className="min-w-[7rem]">Estado</TableHead>
              <TableHead className="min-w-[5.5rem]">Prioridad</TableHead>
              <TableHead className="min-w-[9rem]">Responsable</TableHead>
              <TableHead className="w-12 px-4 text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <AdminEmptyState
                    title="Sin registros"
                    description="No hay solicitudes que coincidan con los filtros seleccionados."
                    className="rounded-none border-0 bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record) => {
              const moduleMeta = MODULE_META[record.module];
              const ModuleIcon = moduleMeta.icon;

              return (
                <TableRow key={record.id}>
                  <TableCell className="px-4 whitespace-nowrap text-muted-foreground">
                    {format(record.date, 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="font-semibold text-[hsl(var(--admin-accent))] hover:underline"
                    >
                      {record.id}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{record.clientName}</p>
                      <p className="text-xs text-muted-foreground">{record.clientRuc}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ModuleIcon
                        className={cn('size-4 shrink-0', moduleMeta.iconClassName)}
                        aria-hidden="true"
                      />
                      <span className="text-sm">{moduleMeta.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminResumenStatusBadge status={record.status as AdminResumenStatus} />
                  </TableCell>
                  <TableCell>
                    <AdminResumenPriorityBadge priority={record.priority as AdminResumenPriority} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-muted text-[0.65rem] font-semibold">
                          {record.assigneeInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm">{record.assigneeName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Acciones para ${record.id}`}
                    >
                      <MoreVertical className="size-4" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
            )}
          </TableBody>
        </Table>
      </div>

      <nav
        aria-label="Paginación de registros"
        className="flex flex-col gap-3 border-t bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-muted-foreground">
          Mostrando{' '}
          <span className="font-medium text-foreground">
            {start} a {end}
          </span>{' '}
          de <span className="font-medium text-foreground">{filteredRecords.length}</span> registros
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
            <SelectTrigger className="h-8 w-[8.5rem] bg-background text-xs" aria-label="Registros por página">
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
