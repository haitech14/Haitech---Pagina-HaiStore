import { Link } from 'react-router-dom';
import { Download, FileText, Printer } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FORUM_POPULAR_EQUIPMENT } from '@/data/forum-home-layout';
import type { ForumManualItem, ForumMember } from '@/types/forum';

interface ForumSidebarProps {
  featuredMembers: ForumMember[];
  manuals: ForumManualItem[];
  isManualsLoading?: boolean;
}

function SidebarCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[hsl(var(--forum-fg))]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ForumSidebar({
  featuredMembers,
  manuals,
  isManualsLoading,
}: ForumSidebarProps) {
  return (
    <aside className="space-y-4" aria-label="Panel lateral del foro">
      <SidebarCard title="Técnicos destacados">
        <ul className="space-y-3">
          {featuredMembers.length === 0 ? (
            <li className="text-sm text-[hsl(var(--forum-muted))]">Sin datos todavía.</li>
          ) : (
            featuredMembers.map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <Avatar className="size-10 border border-[hsl(var(--forum-border))]">
                  <AvatarFallback className="bg-neutral-900 text-xs font-semibold text-white">
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{member.name}</p>
                  <p className="truncate text-xs text-[hsl(var(--forum-muted))]">
                    {member.forumTitle ?? 'Técnico certificado'}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold text-[hsl(var(--forum-accent))]">
                  {member.forumPoints.toLocaleString('es-PE')} pts
                </span>
              </li>
            ))
          )}
        </ul>
      </SidebarCard>

      <SidebarCard
        title="Últimos manuales"
        action={
          <Link
            to="/foro/firmware"
            className="text-xs font-medium text-[hsl(var(--forum-accent))] hover:underline"
          >
            Ver todos
          </Link>
        }
      >
        {isManualsLoading ? (
          <p className="text-sm text-[hsl(var(--forum-muted))]" role="status">
            Cargando…
          </p>
        ) : manuals.length === 0 ? (
          <p className="text-sm text-[hsl(var(--forum-muted))]">
            Aún no hay manuales en el catálogo.
          </p>
        ) : (
          <ul className="space-y-3">
            {manuals.map((manual) => (
              <li key={`${manual.productId}-${manual.url}`}>
                <a
                  href={manual.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[hsl(var(--forum-accent))]"
                    aria-hidden="true"
                  >
                    <FileText className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium leading-snug hover:text-[hsl(var(--forum-accent))]">
                      {manual.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-[hsl(var(--forum-muted))]">
                      PDF{manual.fileName ? ` • ${manual.fileName}` : ''}
                    </span>
                  </span>
                  <Download className="mt-1 size-4 shrink-0 text-[hsl(var(--forum-muted))]" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </SidebarCard>

      <SidebarCard
        title="Equipos populares"
        action={
          <Link
            to="/foro"
            className="text-xs font-medium text-[hsl(var(--forum-accent))] hover:underline"
          >
            Ver todos
          </Link>
        }
      >
        <ol className="space-y-3">
          {FORUM_POPULAR_EQUIPMENT.map((equipment) => (
            <li key={equipment.rank}>
              <Link
                to={equipment.href}
                className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
              >
                <span className="w-4 shrink-0 text-sm font-bold text-[hsl(var(--forum-accent))]">
                  {equipment.rank}
                </span>
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--forum-border))] bg-neutral-50 text-neutral-500"
                  aria-hidden="true"
                >
                  <Printer className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold hover:text-[hsl(var(--forum-accent))]">
                    {equipment.name}
                  </span>
                  <span className="text-xs text-[hsl(var(--forum-muted))]">
                    {equipment.topicCount} temas
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </SidebarCard>
    </aside>
  );
}
