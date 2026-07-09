import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Pencil,
  RefreshCw,
  Search,
  Star,
  ToggleLeft,
} from 'lucide-react';

import { AdminMarcasStatusBadge } from '@/components/admin/marcas/admin-marcas-status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ADMIN_MARCAS_RECORDS } from '@/data/admin-marcas-data';
import { cn } from '@/lib/utils';
import type { AdminMarcaRecord } from '@/types/admin-marcas';

interface AdminMarcasTablePanelProps {
  records?: AdminMarcaRecord[];
  onEditBrand?: (record: AdminMarcaRecord) => void;
  onToggleFeatured?: (record: AdminMarcaRecord) => void;
  onToggleStatus?: (record: AdminMarcaRecord) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const ORIGINS = ['Asia', 'Norteamérica', 'Europa', 'Otros'] as const;
const CATEGORIES = [
  'Computación',
  'Accesorios',
  'Gaming',
  'Impresoras',
  'Periféricos',
  'Laptops',
  'Hardware',
  'Almacenamiento',
] as const;

function countryFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return '🏳️';
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
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

function matchesSearch(record: AdminMarcaRecord, query: string) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return (
    record.name.toLowerCase().includes(normalized) ||
    record.country.toLowerCase().includes(normalized) ||
    record.manager.name.toLowerCase().includes(normalized)
  );
}

function BrandLogo({ record }: { record: AdminMarcaRecord }) {
  if (record.logo) {
    return (
      <img
        src={record.logo}
        alt=""
        className="size-8 shrink-0 rounded-md bg-white object-contain p-0.5"
      />
    );
  }

  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-bold text-white"
      style={{ backgroundColor: record.logoBg ?? '#111827' }}
      aria-hidden="true"
    >
      {record.logoText ?? record.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function ManagerAvatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function AdminMarcasTablePanel({
  records = ADMIN_MARCAS_RECORDS,
  onEditBrand,
  onToggleFeatured,
  onToggleStatus,
  onRefresh,
  isRefreshing = false,
}: AdminMarcasTablePanelProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [originFilter, setOriginFilter] = useState<string>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (statusFilter !== 'todos' && record.status !== statusFilter) return false;
      if (originFilter !== 'todos' && record.origin !== originFilter) return false;
      if (categoryFilter !== 'todas' && !record.categories.includes(categoryFilter)) return false;
      return matchesSearch(record, search);
    });
  }, [categoryFilter, originFilter, records, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = filteredRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredRecords.length);
  const pageItems = buildPageItems(safePage, totalPages);

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 sm:flex-row sm:flex-wrap sm:items-center">
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
            placeholder="Buscar por marca, país o gestor..."
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar marcas"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Estado: Todos</SelectItem>
            <SelectItem value="activa">Activa</SelectItem>
            <SelectItem value="inactiva">Inactiva</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={originFilter}
          onValueChange={(value) => {
            setOriginFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]" aria-label="Filtrar por origen">
            <SelectValue placeholder="Origen: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Origen: Todos</SelectItem>
            {ORIGINS.map((origin) => (
              <SelectItem key={origin} value={origin}>
                {origin}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Filtrar por categoría">
            <SelectValue placeholder="Categoría: Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Categoría: Todas</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" variant="outline" className="h-8 gap-1.5 bg-background text-xs">
          <Filter className="size-4" aria-hidden="true" />
          Más filtros
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 bg-background"
          aria-label="Actualizar listado"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} aria-hidden="true" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 min-w-[9rem] px-3 text-[0.6875rem] font-medium uppercase tracking-wide">
                Fecha
              </TableHead>
              <TableHead className="h-8 min-w-[11rem] text-[0.6875rem] font-medium uppercase tracking-wide">
                Marca
              </TableHead>
              <TableHead className="h-8 min-w-[10rem] text-[0.6875rem] font-medium uppercase tracking-wide">
                País de origen
              </TableHead>
              <TableHead className="h-8 min-w-[12rem] text-[0.6875rem] font-medium uppercase tracking-wide">
                Categorías
              </TableHead>
              <TableHead className="h-8 min-w-[5.5rem] text-right text-[0.6875rem] font-medium uppercase tracking-wide">
                Productos
              </TableHead>
              <TableHead className="h-8 min-w-[11rem] text-[0.6875rem] font-medium uppercase tracking-wide">
                Gestor
              </TableHead>
              <TableHead className="h-8 min-w-[6.5rem] text-[0.6875rem] font-medium uppercase tracking-wide">
                Estado
              </TableHead>
              <TableHead className="h-8 w-12 px-3 text-right text-[0.6875rem] font-medium uppercase tracking-wide">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="px-3 py-2">
                  <p className="whitespace-nowrap text-xs text-foreground">
                    {format(record.createdAt, 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <BrandLogo record={record} />
                    <p className="truncate text-xs font-semibold text-foreground">{record.name}</p>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-sm leading-none"
                      aria-hidden="true"
                    >
                      {countryFlagEmoji(record.countryCode)}
                    </span>
                    <span className="text-xs text-foreground">{record.country}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {record.categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex rounded-md bg-muted px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground"
                      >
                        {category}
                      </span>
                    ))}
                    {record.extraCategories ? (
                      <span className="inline-flex rounded-md bg-muted px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
                        +{record.extraCategories}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="py-2 text-right text-xs font-semibold tabular-nums text-foreground">
                  {record.productCount.toLocaleString('es-PE')}
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <ManagerAvatar
                      name={record.manager.name}
                      color={record.manager.avatarColor}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">
                        {record.manager.name}
                      </p>
                      <p className="truncate text-[0.625rem] text-muted-foreground">
                        {record.manager.role}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <AdminMarcasStatusBadge
                    status={record.status}
                    className="px-2 py-0 text-[0.625rem]"
                  />
                </TableCell>
                <TableCell className="px-3 py-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label={`Acciones para ${record.name}`}
                      >
                        <MoreVertical className="size-3.5" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onSelect={() => {
                          onEditBrand?.(record);
                        }}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Editar marca
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          onToggleFeatured?.(record);
                        }}
                      >
                        <Star className="size-3.5" aria-hidden="true" />
                        {record.featured ? 'Quitar destacada' : 'Marcar destacada'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => {
                          onToggleStatus?.(record);
                        }}
                      >
                        <ToggleLeft className="size-3.5" aria-hidden="true" />
                        {record.status === 'activa' ? 'Desactivar marca' : 'Activar marca'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <nav
        aria-label="Paginación de marcas"
        className="flex flex-col gap-3 border-t bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-xs text-muted-foreground">
          Mostrando{' '}
          <span className="font-medium text-foreground">
            {start} a {end}
          </span>{' '}
          de <span className="font-medium text-foreground">{filteredRecords.length}</span> marcas
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
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
                  className="px-1 text-xs text-muted-foreground"
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
                    'size-8 tabular-nums',
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
            <SelectTrigger className="h-8 w-[8.5rem] bg-background text-xs" aria-label="Marcas por página">
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
