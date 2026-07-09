import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Pencil,
  RotateCcw,
  Search,
  Star,
  Archive,
  Sparkles,
} from 'lucide-react';

import { AdminCategoriasStatusBadge } from '@/components/admin/categorias/admin-categorias-status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { computeCategoriasTabCounts } from '@/data/admin-categorias-data';
import { cn } from '@/lib/utils';
import type { AdminCategoriaRecord, AdminCategoriaTab } from '@/types/admin-categorias';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const ASSIGNEES = ['todos'] as const;

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

function matchesSearch(record: AdminCategoriaRecord, query: string) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return (
    record.name.toLowerCase().includes(normalized) ||
    (record.parentName ?? '').toLowerCase().includes(normalized) ||
    record.description.toLowerCase().includes(normalized)
  );
}

function matchesTab(record: AdminCategoriaRecord, tab: AdminCategoriaTab) {
  if (tab === 'todos') return true;
  if (tab === 'activa') return record.status === 'activa' || record.status === 'destacada';
  return record.status === tab;
}

interface AdminCategoriasTablePanelProps {
  records: AdminCategoriaRecord[];
  headerSearch?: string;
  onEditCategory?: (record: AdminCategoriaRecord) => void;
  onToggleFeatured?: (record: AdminCategoriaRecord) => void;
  onArchiveCategory?: (record: AdminCategoriaRecord) => void;
}

export function AdminCategoriasTablePanel({
  records,
  headerSearch = '',
  onEditCategory,
  onToggleFeatured,
  onArchiveCategory,
}: AdminCategoriasTablePanelProps) {
  const [activeTab, setActiveTab] = useState<AdminCategoriaTab>('todos');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [assigneeFilter, setAssigneeFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('recientes');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const combinedSearch = headerSearch.trim() || search;

  const tabCounts = useMemo(() => computeCategoriasTabCounts(records), [records]);

  const tabs: Array<{ key: AdminCategoriaTab; label: string; count?: number }> = [
    { key: 'todos', label: 'Todas' },
    { key: 'activa', label: 'Activas', count: tabCounts.activa },
    { key: 'destacada', label: 'Destacadas', count: tabCounts.destacada },
    { key: 'borrador', label: 'Borradores', count: tabCounts.borrador },
    { key: 'archivada', label: 'Archivadas', count: tabCounts.archivada },
  ];

  const filteredRecords = useMemo(() => {
    let list = records.filter((record) => {
      if (!matchesTab(record, activeTab)) return false;
      if (statusFilter !== 'todos' && record.status !== statusFilter) return false;
      if (assigneeFilter !== 'todos' && record.assigneeName !== assigneeFilter) return false;
      return matchesSearch(record, combinedSearch);
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'nombre') return a.name.localeCompare(b.name, 'es');
      if (sortBy === 'productos') return b.productCount - a.productCount;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

    return list;
  }, [activeTab, assigneeFilter, combinedSearch, records, sortBy, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const start = filteredRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredRecords.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const handleTabChange = (tab: AdminCategoriaTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 pt-3 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Filtrar categorías" className="flex flex-wrap gap-0.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    'inline-flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'border-[hsl(var(--admin-accent))] text-[hsl(var(--admin-accent))]'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label}
                  {tab.count !== undefined ? (
                    <span className="text-[0.6875rem] text-muted-foreground">({tab.count})</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 pb-1">
            <Button type="button" variant="ghost" className="h-7 gap-1 px-2 text-xs text-muted-foreground">
              <Star className="size-3.5" aria-hidden="true" />
              Guardar vista
            </Button>
            <Button type="button" variant="ghost" className="h-7 gap-1 px-2 text-xs text-muted-foreground">
              <Filter className="size-3.5" aria-hidden="true" />
              Más filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-b bg-muted/20 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre o categoría padre..."
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar categorías"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]" aria-label="Estado">
            <SelectValue placeholder="Estado: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Estado: Todos</SelectItem>
            <SelectItem value="activa">Activa</SelectItem>
            <SelectItem value="destacada">Destacada</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="archivada">Archivada</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={assigneeFilter}
          onValueChange={(value) => {
            setAssigneeFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Responsable">
            <SelectValue placeholder="Responsable: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Responsable: Todos</SelectItem>
            {ASSIGNEES.filter((name) => name !== 'todos').map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]" aria-label="Ordenar por">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recientes">Más recientes</SelectItem>
            <SelectItem value="nombre">Nombre</SelectItem>
            <SelectItem value="productos">Productos</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0 bg-background"
          aria-label="Restablecer filtros"
          onClick={() => {
            setSearch('');
            setStatusFilter('todos');
            setAssigneeFilter('todos');
            setSortBy('recientes');
            setPage(1);
          }}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 min-w-[8rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Categoría padre
              </TableHead>
              <TableHead className="h-8 min-w-[12rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Nombre
              </TableHead>
              <TableHead className="h-8 min-w-[5rem] text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Productos
              </TableHead>
              <TableHead className="h-8 min-w-[6rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="h-8 min-w-[9rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Responsable
              </TableHead>
              <TableHead className="h-8 w-10 px-3" aria-label="Acciones" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No hay categorías que coincidan con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="py-2 text-xs text-muted-foreground">
                  {record.parentName ?? '—'}
                </TableCell>
                <TableCell className="py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">{record.name}</p>
                    <p className="truncate text-[0.625rem] text-muted-foreground">{record.description}</p>
                  </div>
                </TableCell>
                <TableCell className="py-2 text-right text-xs font-medium tabular-nums text-foreground">
                  {record.productCount}
                </TableCell>
                <TableCell className="py-2">
                  <AdminCategoriasStatusBadge status={record.status} />
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-muted text-[0.625rem] font-semibold">
                        {record.assigneeInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{record.assigneeName}</p>
                      <p className="text-[0.625rem] text-muted-foreground">{record.assigneeRole}</p>
                    </div>
                  </div>
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
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onEditCategory?.(record)}>
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleFeatured?.(record)}>
                        <Sparkles className="size-3.5" aria-hidden="true" />
                        {record.status === 'destacada' ? 'Quitar destacado' : 'Destacar'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onArchiveCategory?.(record)}>
                        <Archive className="size-3.5" aria-hidden="true" />
                        Archivar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <nav
        aria-label="Paginación de categorías"
        className="flex flex-col gap-2 border-t bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-xs text-muted-foreground">
          Mostrando{' '}
          <span className="font-medium text-foreground">
            {start} a {end}
          </span>{' '}
          de <span className="font-medium text-foreground">{filteredRecords.length}</span> categorías
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
              <ChevronLeft className="size-3.5" aria-hidden="true" />
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
                    'size-8 text-xs tabular-nums',
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
              <ChevronRight className="size-3.5" aria-hidden="true" />
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
