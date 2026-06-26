import { Link } from 'react-router-dom';
import { Eye, MessageCircle } from 'lucide-react';

import { ForumThreadKindBadge } from '@/components/forum/forum-thread-kind-badge';
import { getForumCategoryIcon, formatForumRelativeTime } from '@/lib/forum-utils';
import { cn } from '@/lib/utils';
import type { ForumThread } from '@/types/forum';

interface ForumDiscussionRowProps {
  thread: ForumThread;
  showKind?: boolean;
  variant?: 'default' | 'home';
}

function getThreadStatus(thread: ForumThread): { label: string; className: string } | null {
  if (thread.isSolved) {
    return { label: 'Resuelto', className: 'bg-emerald-100 text-emerald-800' };
  }
  const hoursSinceCreated = (Date.now() - new Date(thread.createdAt).getTime()) / 3_600_000;
  if (hoursSinceCreated < 24) {
    return { label: 'Nuevo', className: 'bg-red-100 text-red-800' };
  }
  if (thread.replyCount === 0 && thread.kind === 'question') {
    return { label: 'Urgente', className: 'bg-amber-100 text-amber-900' };
  }
  return null;
}

function threadExcerpt(body: string): string {
  const line = body.split('\n').find((part) => part.trim()) ?? body;
  return line.trim().slice(0, 120);
}

function threadMetaLine(thread: ForumThread): string {
  const brand = thread.tags.find((tag) =>
    ['Ricoh', 'Canon', 'Xerox', 'Toshiba', 'Kyocera'].includes(tag),
  );
  const model = thread.tags.find((tag) => tag !== brand && tag.length > 2);
  const parts = [brand, model].filter(Boolean);
  if (parts.length === 0 && thread.category?.name) parts.push(thread.category.name);
  parts.push(`Por ${thread.author?.name ?? 'Anónimo'}`);
  parts.push(formatForumRelativeTime(thread.createdAt));
  return parts.join(' • ');
}

export function ForumDiscussionRow({ thread, showKind, variant = 'default' }: ForumDiscussionRowProps) {
  const Icon = getForumCategoryIcon(thread.category?.iconKey ?? 'message-square');
  const status = variant === 'home' ? getThreadStatus(thread) : null;

  if (variant === 'home') {
    return (
      <article className="flex gap-3 border-b border-[hsl(var(--forum-border))] py-4 last:border-b-0">
        <span
          className={cn(
            'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-white',
            thread.category?.accentClass ?? 'bg-neutral-800',
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {status ? (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide',
                  status.className,
                )}
              >
                {status.label}
              </span>
            ) : null}
            <h3 className="text-sm font-semibold leading-snug sm:text-base">
              <Link
                to={`/foro/tema/${thread.slug}`}
                className="text-[hsl(var(--forum-fg))] hover:text-[hsl(var(--forum-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
              >
                {thread.title}
              </Link>
            </h3>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-[hsl(var(--forum-muted))]">
            {threadExcerpt(thread.body)}
          </p>
          <p className="mt-1.5 text-xs text-[hsl(var(--forum-muted))]">{threadMetaLine(thread)}</p>
        </div>
        <div className="hidden shrink-0 flex-col items-end justify-center gap-2 text-xs text-[hsl(var(--forum-muted))] sm:flex">
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3.5" aria-hidden="true" />
            {thread.replyCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5" aria-hidden="true" />
            {thread.viewCount}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="grid gap-3 border-b border-[hsl(var(--forum-border))] py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
      <div className="flex min-w-0 gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-white',
            thread.category?.accentClass ?? 'bg-neutral-800',
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug sm:text-base">
            <Link
              to={`/foro/tema/${thread.slug}`}
              className="text-[hsl(var(--forum-fg))] hover:text-[hsl(var(--forum-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
            >
              {thread.title}
            </Link>
          </h3>
          {showKind ? (
            <ForumThreadKindBadge
              kind={thread.kind}
              isSolved={thread.isSolved}
              className="mt-1.5"
            />
          ) : null}
          {thread.tags.length > 0 ? (
            <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Etiquetas">
              {thread.tags.map((tag) => (
                <li key={tag}>
                  <span className="rounded-md bg-[hsl(var(--forum-accent)/0.12)] px-2 py-0.5 text-[0.65rem] font-medium text-[hsl(var(--forum-accent))]">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2 text-xs text-[hsl(var(--forum-muted))]">
            por {thread.author?.name ?? 'Anónimo'} · {formatForumRelativeTime(thread.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:text-right">
        <dl className="flex gap-4 text-xs sm:flex-col sm:gap-1 sm:text-right">
          <div>
            <dt className="sr-only">Respuestas</dt>
            <dd className="font-semibold text-[hsl(var(--forum-fg))]">{thread.replyCount}</dd>
            <dd className="text-[hsl(var(--forum-muted))]">Respuestas</dd>
          </div>
          <div>
            <dt className="sr-only">Vistas</dt>
            <dd className="font-semibold text-[hsl(var(--forum-fg))]">{thread.viewCount}</dd>
            <dd className="text-[hsl(var(--forum-muted))]">Vistas</dd>
          </div>
        </dl>
        <p className="text-xs text-[hsl(var(--forum-muted))]">
          {formatForumRelativeTime(thread.lastReplyAt ?? thread.createdAt)}
          {thread.lastReplyAuthor ? ` por ${thread.lastReplyAuthor.name}` : ''}
          <span
            className="ml-1 inline-block size-2 rounded-full bg-[hsl(var(--forum-accent))]"
            aria-hidden="true"
          />
        </p>
      </div>
    </article>
  );
}
