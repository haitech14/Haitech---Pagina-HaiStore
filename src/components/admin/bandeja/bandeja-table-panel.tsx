import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

import {
  BandejaAssigneeAvatar,
  BandejaChannelBadge,
  BandejaPriorityBadge,
  BandejaStatusBadge,
} from '@/components/admin/bandeja/bandeja-badges';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import {
  BANDEJA_ASSIGNEES,
  BANDEJA_CHANNELS_FILTER,
  BANDEJA_CONVERSATIONS,
  BANDEJA_STATUSES,
  BANDEJA_TEAMS,
} from '@/data/bandeja-mock';
import { computeBandejaTabCounts, filterBandejaConversations } from '@/lib/bandeja-utils';
import { cn } from '@/lib/utils';
import type { BandejaConversation, BandejaTab } from '@/types/bandeja';

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

interface BandejaTablePanelProps {
  conversations?: BandejaConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function BandejaTablePanel({
  conversations = BANDEJA_CONVERSATIONS,
  selectedId,
  onSelect,
}: BandejaTablePanelProps) {
  const [activeTab, setActiveTab] = useState<BandejaTab>('todos');
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('Todos');
  const [teamFilter, setTeamFilter] = useState('Todos');
  const [assigneeFilter, setAssigneeFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const tabCounts = useMemo(() => computeBandejaTabCounts(conversations), [conversations]);

  const tabs: Array<{ key: BandejaTab; label: string; count?: number }> = [
    { key: 'todos', label: 'Todos', count: tabCounts.todos },
    { key: 'sin_leer', label: 'Sin leer', count: tabCounts.sin_leer },
    { key: 'menciones', label: 'Menciones', count: tabCounts.menciones },
    { key: 'asignados', label: 'Asignados', count: tabCounts.asignados },
    { key: 'resueltos', label: 'Resueltos', count: tabCounts.resueltos },
    { key: 'spam', label: 'Spam', count: tabCounts.spam },
  ];

  const filtered = useMemo(
    () =>
      filterBandejaConversations(conversations, {
        tab: activeTab,
        search,
        channel: channelFilter,
        team: teamFilter,
        assignee: assigneeFilter,
        status: statusFilter,
      }),
    [activeTab, assigneeFilter, channelFilter, conversations, search, statusFilter, teamFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filtered.length);
  const pageItems = buildPageItems(safePage, totalPages);

  const allPageSelected =
    paginated.length > 0 && paginated.every((item) => selectedIds.has(item.id));

  const handleTabChange = (tab: BandejaTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const toggleAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((item) => next.delete(item.id));
        return next;
      });
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      paginated.forEach((item) => next.add(item.id));
      return next;
    });
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b px-4 pt-4 sm:px-5">
        <div role="tablist" aria-label="Filtrar conversaciones" className="flex flex-wrap gap-1">
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
            placeholder="Buscar remitente o asunto…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Buscar conversaciones"
          />
        </div>

        <Select
          value={channelFilter}
          onValueChange={(value) => {
            setChannelFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[7.5rem] bg-background text-xs" aria-label="Filtrar por canal">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            {BANDEJA_CHANNELS_FILTER.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={teamFilter}
          onValueChange={(value) => {
            setTeamFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[7.5rem] bg-background text-xs" aria-label="Filtrar por equipo">
            <SelectValue placeholder="Equipo" />
          </SelectTrigger>
          <SelectContent>
            {BANDEJA_TEAMS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={assigneeFilter}
          onValueChange={(value) => {
            setAssigneeFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[8rem] bg-background text-xs" aria-label="Filtrar por asignado">
            <SelectValue placeholder="Asignado" />
          </SelectTrigger>
          <SelectContent>
            {BANDEJA_ASSIGNEES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
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
          <SelectTrigger className="h-8 w-[7.5rem] bg-background text-xs" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {BANDEJA_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Seleccionar todas las conversaciones visibles"
                />
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Fecha
              </TableHead>
              <TableHead className="min-w-[10rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Remitente
              </TableHead>
              <TableHead className="min-w-[12rem] text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Asunto
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Canal
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Asignado
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Prioridad
              </TableHead>
              <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-8">
                  <AdminEmptyState
                    title="Sin conversaciones"
                    description="Cuando lleguen mensajes por WhatsApp, email u otros canales, aparecerán aquí."
                  />
                </TableCell>
              </TableRow>
            ) : null}
            {paginated.map((conversation) => {
              const isSelected = selectedId === conversation.id;
              const isChecked = selectedIds.has(conversation.id);

              return (
                <TableRow
                  key={conversation.id}
                  className={cn(
                    'cursor-pointer',
                    isSelected && 'bg-[hsl(var(--admin-accent))]/5',
                    conversation.unread && 'font-medium',
                  )}
                  onClick={() => onSelect(conversation.id)}
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (checked) next.add(conversation.id);
                          else next.delete(conversation.id);
                          return next;
                        });
                      }}
                      aria-label={`Seleccionar conversación de ${conversation.senderName}`}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {conversation.date}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-foreground">{conversation.senderName}</p>
                      <p className="truncate text-[0.6875rem] text-muted-foreground">
                        {conversation.senderContact}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-foreground">{conversation.subject}</p>
                      <p className="truncate text-[0.6875rem] text-muted-foreground">
                        {conversation.preview}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <BandejaChannelBadge channel={conversation.channel} />
                  </TableCell>
                  <TableCell>
                    <BandejaAssigneeAvatar
                      initials={conversation.assignedTo.initials}
                      color={conversation.assignedTo.color}
                      name={conversation.assignedTo.name}
                    />
                  </TableCell>
                  <TableCell>
                    <BandejaPriorityBadge priority={conversation.priority} />
                  </TableCell>
                  <TableCell>
                    <BandejaStatusBadge status={conversation.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-muted-foreground">
          Mostrando {start} a {end} de {filtered.length} conversaciones
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[7rem] text-xs" aria-label="Conversaciones por página">
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
              onClick={() => setPage((value) => Math.max(1, value - 1))}
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
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
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
