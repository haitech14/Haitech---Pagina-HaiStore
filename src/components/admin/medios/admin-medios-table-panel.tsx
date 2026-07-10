import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3x3,
  List,
  Loader2,
  MoreVertical,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { formatMediosBytes, kindLabel, sourceLabel, dedupeMediosForDisplay } from '@/lib/admin-medios-utils';
import { cn } from '@/lib/utils';
import type { MediaAlbumItem, MediaAlbumItemKind, MediaAlbumItemSource } from '@/types/media-album';

const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

type ViewMode = 'grid' | 'list';

interface AdminMediosTablePanelProps {
  items: MediaAlbumItem[];
  isLoading?: boolean;
  search: string;
  onDelete?: (item: MediaAlbumItem) => void;
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

function matchesSearch(item: MediaAlbumItem, query: string) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return (
    item.name.toLowerCase().includes(normalized) ||
    sourceLabel(item.source).toLowerCase().includes(normalized) ||
    kindLabel(item.kind).toLowerCase().includes(normalized)
  );
}

function MediaThumb({ item }: { item: MediaAlbumItem }) {
  if (item.kind === 'video') {
    return (
      <video src={item.url} className="size-full object-cover" muted playsInline preload="metadata" />
    );
  }

  return <img src={item.url} alt="" className="size-full object-cover" loading="lazy" />;
}

export function AdminMediosTablePanel({
  items,
  isLoading = false,
  search,
  onDelete,
}: AdminMediosTablePanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [kindFilter, setKindFilter] = useState<'todos' | MediaAlbumItemKind>('todos');
  const [sourceFilter, setSourceFilter] = useState<'todos' | MediaAlbumItemSource>('todos');
  const [sortBy, setSortBy] = useState('recientes');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12);

  const dedupedItems = useMemo(() => dedupeMediosForDisplay(items), [items]);

  const filteredItems = useMemo(() => {
    let list = dedupedItems.filter((item) => {
      if (kindFilter !== 'todos' && item.kind !== kindFilter) return false;
      if (sourceFilter !== 'todos' && item.source !== sourceFilter) return false;
      return matchesSearch(item, search);
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'nombre') return a.name.localeCompare(b.name, 'es');
      if (sortBy === 'tamano') return (b.bytes ?? 0) - (a.bytes ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [dedupedItems, kindFilter, search, sortBy, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = filteredItems.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filteredItems.length);
  const pageItems = buildPageItems(safePage, totalPages);

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b bg-muted/20 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            readOnly
            placeholder="Buscar por nombre, tipo o fuente…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar medios"
          />
        </div>

        <Select value={kindFilter} onValueChange={(value) => { setKindFilter(value as typeof kindFilter); setPage(1); }}>
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]" aria-label="Tipo">
            <SelectValue placeholder="Tipo: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Tipo: Todos</SelectItem>
            <SelectItem value="image">Imágenes</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={(value) => { setSourceFilter(value as typeof sourceFilter); setPage(1); }}>
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[10.5rem]" aria-label="Fuente">
            <SelectValue placeholder="Fuente: Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Fuente: Todas</SelectItem>
            <SelectItem value="upload">Subida</SelectItem>
            <SelectItem value="inventory">Inventario</SelectItem>
            <SelectItem value="google_drive">Google Drive</SelectItem>
            <SelectItem value="import">Importado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 w-full bg-background text-xs sm:w-[9.5rem]" aria-label="Ordenar por">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recientes">Más recientes</SelectItem>
            <SelectItem value="nombre">Nombre</SelectItem>
            <SelectItem value="tamano">Tamaño</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button type="button" variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" className="size-8" onClick={() => setViewMode('grid')} aria-label="Vista cuadrícula">
            <Grid3x3 className="size-3.5" />
          </Button>
          <Button type="button" variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" className="size-8" onClick={() => setViewMode('list')} aria-label="Vista lista">
            <List className="size-3.5" />
          </Button>
          <Button type="button" variant="outline" size="icon" className="size-8" aria-label="Más filtros">
            <Filter className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Restablecer filtros"
            onClick={() => {
              setKindFilter('todos');
              setSourceFilter('todos');
              setSortBy('recientes');
              setPage(1);
            }}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Cargando medios…
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No hay archivos que coincidan con los filtros seleccionados.
          </p>
        ) : viewMode === 'grid' ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {paginatedItems.map((item) => (
              <li key={item.mergedIds?.join(':') ?? item.id} className="group overflow-hidden rounded-lg border border-border/70 bg-muted/10">
                <div className="relative aspect-square">
                  <MediaThumb item={item} />
                  {(item.duplicateCount ?? 1) > 1 ? (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-background/90 px-1.5 py-0.5 text-[0.625rem] font-semibold text-foreground shadow-sm">
                      ×{item.duplicateCount}
                    </span>
                  ) : null}
                  {item.source !== 'inventory' ? (
                    <button
                      type="button"
                      className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label={`Eliminar ${item.name}`}
                      onClick={() => onDelete?.(item)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
                <div className="space-y-0.5 p-2">
                  <p className="truncate text-xs font-semibold text-foreground">{item.name}</p>
                  <p className="text-[0.625rem] text-muted-foreground">
                    {kindLabel(item.kind)} · {sourceLabel(item.source)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 min-w-[12rem]">Archivo</TableHead>
                  <TableHead className="h-8">Tipo</TableHead>
                  <TableHead className="h-8">Fuente</TableHead>
                  <TableHead className="h-8">Tamaño</TableHead>
                  <TableHead className="h-8">Fecha</TableHead>
                  <TableHead className="h-8 w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="size-10 overflow-hidden rounded-md border bg-muted/30">
                          <MediaThumb item={item} />
                        </div>
                        <span className="truncate font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">{kindLabel(item.kind)}</TableCell>
                    <TableCell className="py-2">{sourceLabel(item.source)}</TableCell>
                    <TableCell className="py-2 tabular-nums">{formatMediosBytes(item.bytes ?? 0)}</TableCell>
                    <TableCell className="py-2 whitespace-nowrap text-muted-foreground">
                      {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      {item.source !== 'inventory' ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={`Acciones para ${item.name}`}>
                              <MoreVertical className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onDelete?.(item)}>
                              <Trash2 className="size-3.5" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <nav
        aria-label="Paginación de medios"
        className="flex flex-col gap-2 border-t bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-xs text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{start} a {end}</span> de{' '}
          <span className="font-medium text-foreground">{filteredItems.length}</span> archivos
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="icon" className="size-8" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} aria-label="Página anterior">
              <ChevronLeft className="size-3.5" />
            </Button>
            {pageItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-1 text-xs text-muted-foreground">…</span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  variant={item === safePage ? 'default' : 'outline'}
                  size="icon"
                  className={cn('size-8 text-xs tabular-nums', item === safePage && 'bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-hover))]')}
                  onClick={() => setPage(item)}
                  aria-label={`Página ${item}`}
                  aria-current={item === safePage ? 'page' : undefined}
                >
                  {item}
                </Button>
              ),
            )}
            <Button type="button" variant="outline" size="icon" className="size-8" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} aria-label="Página siguiente">
              <ChevronRight className="size-3.5" />
            </Button>
          </div>

          <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
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
