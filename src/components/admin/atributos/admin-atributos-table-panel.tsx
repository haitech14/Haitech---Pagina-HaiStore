import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';

import {
  AdminAtributosRowActions,
} from '@/components/admin/atributos/admin-atributos-row-actions';
import {
  AdminAtributosStatusBadge,
  AdminAtributosTipoBadge,
  AdminAtributosVisibilityBadge,
} from '@/components/admin/atributos/admin-atributos-badges';
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
import { ADMIN_CATALOG_ATTRIBUTES } from '@/data/admin-atributos-data';
import {
  ATRIBUTO_TIPO_LABELS,
  ATRIBUTO_TIPO_STYLES,
  computeAtributosTabCounts,
  filterAtributos,
  formatAplicaA,
} from '@/lib/admin-atributos-utils';
import { cn } from '@/lib/utils';
import type { AdminAtributosTab } from '@/types/admin-atributos';

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

interface AdminAtributosTablePanelProps {
  headerSearch?: string;
}

export function AdminAtributosTablePanel({ headerSearch = '' }: AdminAtributosTablePanelProps) {
  const [activeTab, setActiveTab] = useState<AdminAtributosTab>('todos');
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [aplicaFilter, setAplicaFilter] = useState('todos');
  const [visibilityFilter, setVisibilityFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const combinedSearch = headerSearch.trim() || search;

  const tabCounts = useMemo(
    () => computeAtributosTabCounts(ADMIN_CATALOG_ATTRIBUTES),
    [],
  );

  const tabs: Array<{ key: AdminAtributosTab; label: string; count?: number }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'globales', label: 'Globales', count: tabCounts.globales },
    { key: 'especificos', label: 'Específicos', count: tabCounts.especificos },
    { key: 'sistema', label: 'Sistema', count: tabCounts.sistema },
    { key: 'personalizados', label: 'Personalizados', count: tabCounts.personalizados },
  ];

  const filteredAttributes = useMemo(
    () =>
      filterAtributos({
        attributes: ADMIN_CATALOG_ATTRIBUTES,
        tab: activeTab,
        search: combinedSearch,
        tipoFilter,
        aplicaFilter,
        visibilityFilter,
        statusFilter,
      }),
    [activeTab, aplicaFilter, combinedSearch, statusFilter, tipoFilter, visibilityFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredAttributes.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedAttributes = filteredAttributes.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = filteredAttributes.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredAttributes.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const handleTabChange = (tab: AdminAtributosTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 pt-4 sm:px-5">
        <div role="tablist" aria-label="Filtrar atributos por alcance" className="flex flex-wrap gap-1">
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
                {tab.key === 'todos' && isActive ? (
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
            placeholder="Buscar por atributo, tipo o aplica a…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar atributos en la tabla"
          />
        </div>

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
            <SelectItem value="lista">Lista</SelectItem>
            <SelectItem value="lista_multiple">Lista múltiple</SelectItem>
            <SelectItem value="numero">Número</SelectItem>
            <SelectItem value="texto">Texto</SelectItem>
            <SelectItem value="booleano">Booleano</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={aplicaFilter}
          onValueChange={(value) => {
            setAplicaFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]">
            <SelectValue placeholder="Aplica a" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Aplica a: Todos</SelectItem>
            <SelectItem value="Celulares">Celulares</SelectItem>
            <SelectItem value="Laptops">Laptops</SelectItem>
            <SelectItem value="Tablets">Tablets</SelectItem>
            <SelectItem value="Monitores">Monitores</SelectItem>
            <SelectItem value="todas">Todas las categorías</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={visibilityFilter}
          onValueChange={(value) => {
            setVisibilityFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]">
            <SelectValue placeholder="Visibilidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Visibilidad: Todas</SelectItem>
            <SelectItem value="publica">Pública</SelectItem>
            <SelectItem value="privada">Privada</SelectItem>
          </SelectContent>
        </Select>

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
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
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
              <TableHead className="whitespace-nowrap text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Atributo
              </TableHead>
              <TableHead className="whitespace-nowrap text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Tipo
              </TableHead>
              <TableHead className="min-w-[10rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Valores
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Aplica a
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Visibilidad
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAttributes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <SlidersHorizontal className="size-8 opacity-40" aria-hidden="true" />
                    <p>No hay atributos que coincidan con los filtros.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAttributes.map((attribute) => (
                <TableRow key={attribute.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(attribute.createdAt), "d 'de' MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[8rem]">
                      <p className="text-sm font-medium text-foreground">{attribute.name}</p>
                      <p className="text-xs text-muted-foreground">{attribute.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminAtributosTipoBadge
                      label={ATRIBUTO_TIPO_LABELS[attribute.tipo]}
                      className={ATRIBUTO_TIPO_STYLES[attribute.tipo]}
                    />
                  </TableCell>
                  <TableCell className="max-w-[14rem] truncate text-xs text-muted-foreground">
                    {attribute.valores}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatAplicaA(attribute.aplicaA)}
                  </TableCell>
                  <TableCell>
                    <AdminAtributosVisibilityBadge visibility={attribute.visibilidad} />
                  </TableCell>
                  <TableCell>
                    <AdminAtributosStatusBadge status={attribute.estado} />
                  </TableCell>
                  <TableCell>
                    <AdminAtributosRowActions attribute={attribute} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-muted-foreground">
          Mostrando {start} a {end} de {filteredAttributes.length} atributos
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
