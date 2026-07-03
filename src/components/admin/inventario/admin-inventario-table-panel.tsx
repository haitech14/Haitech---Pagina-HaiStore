import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Search,
} from 'lucide-react';

import { AdminInventarioStatusBadge } from '@/components/admin/inventario/admin-inventario-status-badge';
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
import { ADMIN_INVENTARIO_RECORDS } from '@/data/admin-inventario-data';
import { cn } from '@/lib/utils';
import type { AdminInventarioRecord, AdminInventarioStockStatus } from '@/types/admin-inventario';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const CATEGORIES = ['Laptops', 'Accesorios', 'Impresoras', 'Monitores', 'Otros'] as const;
const LOCATIONS = ['Almacén Central', 'Sucursal Norte', 'Sucursal Sur'] as const;

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

function matchesSearch(record: AdminInventarioRecord, query: string) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return (
    record.name.toLowerCase().includes(normalized) ||
    record.sku.toLowerCase().includes(normalized) ||
    (record.barcode ?? '').includes(normalized)
  );
}

function stockTone(status: AdminInventarioStockStatus) {
  if (status === 'stock_critico') return 'text-red-600';
  if (status === 'stock_bajo') return 'text-amber-600';
  return 'text-emerald-600';
}

function ProductThumb({ record }: { record: AdminInventarioRecord }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
      style={{ backgroundColor: record.imageColor }}
      aria-hidden="true"
    >
      {record.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function AdminInventarioTablePanel() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [locationFilter, setLocationFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const filteredRecords = useMemo(() => {
    return ADMIN_INVENTARIO_RECORDS.filter((record) => {
      if (categoryFilter !== 'todas' && record.category !== categoryFilter) return false;
      if (locationFilter !== 'todas' && record.location !== locationFilter) return false;
      if (statusFilter !== 'todos' && record.status !== statusFilter) return false;
      return matchesSearch(record, search);
    });
  }, [categoryFilter, locationFilter, search, statusFilter]);

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
    <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-foreground">Listado de productos</h2>
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
            placeholder="Buscar por producto, SKU o código de barras..."
            className="h-9 bg-background pl-9"
            aria-label="Buscar productos"
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-full bg-background sm:w-[10.5rem]" aria-label="Filtrar por categoría">
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

        <Select
          value={locationFilter}
          onValueChange={(value) => {
            setLocationFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-full bg-background sm:w-[10.5rem]" aria-label="Filtrar por ubicación">
            <SelectValue placeholder="Ubicación: Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Ubicación: Todas</SelectItem>
            {LOCATIONS.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-full bg-background sm:w-[9.5rem]" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Estado: Todos</SelectItem>
            <SelectItem value="en_stock">En stock</SelectItem>
            <SelectItem value="stock_bajo">Stock bajo</SelectItem>
            <SelectItem value="stock_critico">Stock crítico</SelectItem>
          </SelectContent>
        </Select>

        <Button type="button" variant="outline" className="h-9 gap-2 bg-background">
          <Filter className="size-4" aria-hidden="true" />
          Filtros
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 bg-background"
          aria-label="Exportar listado"
        >
          <Download className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[14rem] px-4">Producto</TableHead>
              <TableHead className="min-w-[8rem]">SKU</TableHead>
              <TableHead className="min-w-[7rem]">Categoría</TableHead>
              <TableHead className="min-w-[6rem] text-right">Stock actual</TableHead>
              <TableHead className="min-w-[6.5rem] text-right">Stock mínimo</TableHead>
              <TableHead className="min-w-[9rem]">Ubicación</TableHead>
              <TableHead className="min-w-[7rem]">Estado</TableHead>
              <TableHead className="min-w-[9.5rem]">Último movimiento</TableHead>
              <TableHead className="w-12 px-4 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <ProductThumb record={record} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{record.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{record.subtitle}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{record.sku}</TableCell>
                <TableCell className="text-sm">{record.category}</TableCell>
                <TableCell
                  className={cn(
                    'text-right text-sm font-semibold tabular-nums',
                    stockTone(record.status),
                  )}
                >
                  {record.stock}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {record.minStock}
                </TableCell>
                <TableCell className="text-sm">{record.location}</TableCell>
                <TableCell>
                  <AdminInventarioStatusBadge status={record.status} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="whitespace-nowrap text-foreground">
                      {format(record.lastMovementAt, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {record.lastMovementType}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Acciones para ${record.name}`}
                  >
                    <MoreVertical className="size-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <nav
        aria-label="Paginación de productos"
        className="flex flex-col gap-3 border-t bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
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
            <SelectTrigger className="h-9 w-[8.5rem] bg-background" aria-label="Registros por página">
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
