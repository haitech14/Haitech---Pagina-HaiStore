import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react';

import {
  AdminVariantesRowActions,
} from '@/components/admin/variantes/admin-variantes-row-actions';
import { AdminVariantesStatusBadge } from '@/components/admin/variantes/admin-variantes-badges';
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
import { ADMIN_CATALOG_VARIANTS } from '@/data/admin-variantes-data';
import {
  computeVariantesTabCounts,
  filterVariantes,
  formatVariantePrice,
  stockTone,
} from '@/lib/admin-variantes-utils';
import { cn } from '@/lib/utils';
import type { AdminVariantesTab } from '@/types/admin-variantes';

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

const stockToneClass = {
  high: 'text-emerald-600',
  low: 'text-orange-600',
  zero: 'text-rose-600',
} as const;

interface AdminVariantesTablePanelProps {
  headerSearch?: string;
}

export function AdminVariantesTablePanel({ headerSearch = '' }: AdminVariantesTablePanelProps) {
  const [activeTab, setActiveTab] = useState<AdminVariantesTab>('todas');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [warehouseFilter, setWarehouseFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const combinedSearch = headerSearch.trim() || search;

  const tabCounts = useMemo(() => computeVariantesTabCounts(ADMIN_CATALOG_VARIANTS), []);

  const tabs: Array<{ key: AdminVariantesTab; label: string; count?: number }> = [
    { key: 'todas', label: 'Todas' },
    { key: 'activas', label: 'Activas', count: tabCounts.activas },
    { key: 'stock_bajo', label: 'Con stock bajo', count: tabCounts.stock_bajo },
    { key: 'agotadas', label: 'Agotadas', count: tabCounts.agotadas },
    { key: 'inactivas', label: 'Inactivas', count: tabCounts.inactivas },
  ];

  const filteredVariants = useMemo(
    () =>
      filterVariantes({
        variants: ADMIN_CATALOG_VARIANTS,
        tab: activeTab,
        search: combinedSearch,
        statusFilter,
        categoryFilter,
        warehouseFilter,
      }),
    [activeTab, categoryFilter, combinedSearch, statusFilter, warehouseFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredVariants.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedVariants = filteredVariants.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = filteredVariants.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredVariants.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const handleTabChange = (tab: AdminVariantesTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 pt-4 sm:px-5">
        <div role="tablist" aria-label="Filtrar variantes por estado" className="flex flex-wrap gap-1">
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
                {tab.key === 'todas' && isActive ? (
                  <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                ) : null}
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
            placeholder="Buscar por producto, variante, SKU…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar variantes en la tabla"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[8.5rem]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Estado: Todos</SelectItem>
            <SelectItem value="activa">Activa</SelectItem>
            <SelectItem value="stock_bajo">Stock bajo</SelectItem>
            <SelectItem value="agotada">Agotada</SelectItem>
            <SelectItem value="inactiva">Inactiva</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9rem]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Categoría: Todas</SelectItem>
            <SelectItem value="Laptops">Laptops</SelectItem>
            <SelectItem value="Periféricos">Periféricos</SelectItem>
            <SelectItem value="Monitores">Monitores</SelectItem>
            <SelectItem value="Consumibles">Consumibles</SelectItem>
            <SelectItem value="Impresoras">Impresoras</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={warehouseFilter}
          onValueChange={(value) => {
            setWarehouseFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]">
            <SelectValue placeholder="Almacén" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Almacén: Todos</SelectItem>
            <SelectItem value="Lima Centro">Lima Centro</SelectItem>
            <SelectItem value="Lima Sur">Lima Sur</SelectItem>
            <SelectItem value="Lima Norte">Lima Norte</SelectItem>
            <SelectItem value="Arequipa">Arequipa</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5 sm:ml-auto">
          <Button type="button" variant="outline" size="icon" className="size-8 bg-background" aria-label="Actualizar">
            <RefreshCw className="size-3.5" aria-hidden="true" />
          </Button>
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="whitespace-nowrap text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Fecha
              </TableHead>
              <TableHead className="min-w-[10rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Producto base
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Variante
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                SKU
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Precio
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Stock
              </TableHead>
              <TableHead className="min-w-[9rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Actualización
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVariants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Boxes className="size-8 opacity-40" aria-hidden="true" />
                    <p>No hay variantes que coincidan con los filtros.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedVariants.map((variant) => {
                const tone = stockTone(variant.stock, variant.status);
                return (
                  <TableRow key={variant.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(variant.createdAt), "d 'de' MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-[10rem] items-center gap-2.5">
                        {variant.baseProductImage ? (
                          <img
                            src={variant.baseProductImage}
                            alt=""
                            className="size-9 shrink-0 rounded-md border border-border/60 object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <Boxes className="size-4" aria-hidden="true" />
                          </span>
                        )}
                        <p className="text-sm font-medium text-foreground">{variant.baseProductName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{variant.variantLabel}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{variant.sku}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium text-foreground">
                      {formatVariantePrice(variant.pricePen)}
                    </TableCell>
                    <TableCell>
                      <span className={cn('text-sm font-semibold', stockToneClass[tone])}>
                        {variant.stock.toLocaleString('es-PE')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p className="text-foreground">
                          {format(new Date(variant.updatedAt), "d MMM yyyy, HH:mm", { locale: es })}
                        </p>
                        <p className="text-muted-foreground">{variant.updatedBy}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AdminVariantesStatusBadge status={variant.status} />
                    </TableCell>
                    <TableCell>
                      <AdminVariantesRowActions />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-muted-foreground">
          Mostrando {start} a {end} de {filteredVariants.length.toLocaleString('es-PE')} variantes
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[7.5rem] bg-background text-xs">
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

          <div className="flex items-center gap-0.5">
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
                    item === safePage && 'bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-hover))]',
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
        </div>
      </div>
    </section>
  );
}
