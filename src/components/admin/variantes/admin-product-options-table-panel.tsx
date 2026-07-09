import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Link2,
  RefreshCw,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  AdminProductOptionSourceBadge,
  AdminProductOptionTypeBadge,
} from '@/components/admin/variantes/admin-variantes-badges';
import { AdminProductOptionsRowActions } from '@/components/admin/variantes/admin-variantes-row-actions';
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
import { useAdminInventory } from '@/hooks/use-products';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import {
  collectProductOptionsFromInventory,
  computeProductOptionsTabCounts,
  filterProductOptions,
} from '@/lib/admin-variantes-utils';
import { cn } from '@/lib/utils';
import type { AdminProductOptionsTab } from '@/types/admin-variantes';

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

interface AdminProductOptionsTablePanelProps {
  headerSearch?: string;
}

export function AdminProductOptionsTablePanel({ headerSearch = '' }: AdminProductOptionsTablePanelProps) {
  const { data: products = [], isLoading, refetch } = useAdminInventory();
  const [activeTab, setActiveTab] = useState<AdminProductOptionsTab>('todas');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [sourceFilter, setSourceFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const combinedSearch = headerSearch.trim() || search;

  const allOptions = useMemo(
    () => collectProductOptionsFromInventory(products),
    [products],
  );

  const tabCounts = useMemo(() => computeProductOptionsTabCounts(allOptions), [allOptions]);

  const tabs: Array<{ key: AdminProductOptionsTab; label: string; count?: number }> = [
    { key: 'todas', label: 'Todas' },
    { key: 'cross_sell', label: 'Cross-sell', count: tabCounts.cross_sell },
    { key: 'upsell', label: 'Upsell', count: tabCounts.upsell },
    { key: 'opcionales', label: 'Sin inventario', count: tabCounts.opcionales },
  ];

  const filteredOptions = useMemo(
    () =>
      filterProductOptions({
        options: allOptions,
        tab: activeTab,
        search: combinedSearch,
        typeFilter,
        sourceFilter,
      }),
    [activeTab, allOptions, combinedSearch, sourceFilter, typeFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedOptions = filteredOptions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = filteredOptions.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredOptions.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const handleTabChange = (tab: AdminProductOptionsTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 pt-4 sm:px-5">
        <div role="tablist" aria-label="Filtrar opciones por tipo" className="flex flex-wrap gap-1">
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
            placeholder="Buscar por producto padre u opción…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar opciones en la tabla"
          />
        </div>

        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[8.5rem]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Tipo: Todos</SelectItem>
            <SelectItem value="cross_sell">Cross-sell</SelectItem>
            <SelectItem value="upsell">Upsell</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sourceFilter}
          onValueChange={(value) => {
            setSourceFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Fuente: Todas</SelectItem>
            <SelectItem value="inventory">Inventario</SelectItem>
            <SelectItem value="optional">Sin inventario</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 bg-background sm:ml-auto"
          aria-label="Actualizar opciones desde inventario"
          disabled={isLoading}
          onClick={() => void refetch()}
        >
          <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} aria-hidden="true" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[10rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Producto padre
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Tipo
              </TableHead>
              <TableHead className="min-w-[10rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Opción
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Fuente
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Precio USD
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Actualización
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  Cargando opciones desde inventario…
                </TableCell>
              </TableRow>
            ) : paginatedOptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Link2 className="size-8 opacity-40" aria-hidden="true" />
                    <p>No hay opciones de producto configuradas.</p>
                    <p className="text-xs">
                      Configúralas en{' '}
                      <Link
                        to={ADMIN_ROUTES.INVENTORY}
                        className="font-medium text-[hsl(var(--admin-accent))] hover:underline"
                      >
                        Inventario → Merchandising
                      </Link>
                      .
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOptions.map((option) => (
                <TableRow key={option.id}>
                  <TableCell>
                    <div className="min-w-[9rem]">
                      <p className="text-sm font-medium text-foreground">{option.parentProductName}</p>
                      {option.parentCode ? (
                        <p className="font-mono text-xs text-muted-foreground">{option.parentCode}</p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminProductOptionTypeBadge type={option.type} />
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[10rem] items-center gap-2.5">
                      {option.imageUrl ? (
                        <img
                          src={option.imageUrl}
                          alt=""
                          className="size-9 shrink-0 rounded-md border border-border/60 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <ShoppingBag className="size-4" aria-hidden="true" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{option.name}</p>
                        {option.code ? (
                          <p className="font-mono text-xs text-muted-foreground">{option.code}</p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminProductOptionSourceBadge source={option.source} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-medium text-foreground">
                    US$ {option.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(option.updatedAt), "d MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <AdminProductOptionsRowActions parentName={option.parentProductName} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-muted-foreground">
          Mostrando {start} a {end} de {filteredOptions.length.toLocaleString('es-PE')} opciones
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
