import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { ForumThreadKindBadge } from '@/components/forum/forum-thread-kind-badge';
import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { useCreateForumReply, useForumThread, useMarkForumThreadSolved } from '@/hooks/use-forum';
import { formatForumRelativeTime } from '@/lib/forum-utils';
import { cn } from '@/lib/utils';

export function ForumThreadPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, authProvider } = useAuth();
  const { data, isLoading, isError } = useForumThread(slug);
  const createReply = useCreateForumReply(slug ?? '');
  const markSolved = useMarkForumThreadSolved(slug ?? '');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (data?.thread.title) {
      document.title = `${data.thread.title} | ${FORUM_TITLE_SUFFIX}`;
    }
  }, [data?.thread.title]);

  if (!slug) return <Navigate to="/foro" replace />;

  if (isLoading) {
    return (
      <div className="container px-4 py-12 text-center text-[hsl(var(--forum-muted))] sm:px-6" role="status">
        Cargando tema…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container px-4 py-12 text-center sm:px-6">
        <p className="text-[hsl(var(--forum-muted))]">Tema no encontrado.</p>
        <Button asChild variant="link" className="mt-4 text-[hsl(var(--forum-accent))]">
          <Link to="/foro">Volver al foro</Link>
        </Button>
      </div>
    );
  }

  const { thread, replies } = data;
  const canReply = Boolean(user && authProvider === 'supabase');
  const canMarkSolution =
    canReply &&
    thread.kind === 'question' &&
    !thread.isSolved &&
    user?.id === thread.author?.id;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;
    try {
      await createReply.mutateAsync(body.trim());
      setBody('');
      toast.success('Respuesta publicada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo publicar');
    }
  };

  const handleMarkSolution = async (replyId: string) => {
    try {
      await markSolved.mutateAsync(replyId);
      toast.success('Respuesta marcada como solución');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo marcar la solución');
    }
  };

  return (
    <div className="container max-w-4xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-[hsl(var(--forum-muted))]" aria-label="Miga de pan">
        <Link to="/foro" className="hover:text-[hsl(var(--forum-accent))]">
          Foro
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-[hsl(var(--forum-fg))]">{thread.title}</span>
      </nav>

      <article className="rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-5 sm:p-6">
        <ForumThreadKindBadge kind={thread.kind} isSolved={thread.isSolved} className="mb-3" />
        <h1 className="text-balance text-xl font-bold sm:text-2xl">{thread.title}</h1>
        <p className="mt-2 text-xs text-[hsl(var(--forum-muted))]">
          {thread.author?.name ?? 'Anónimo'} · {formatForumRelativeTime(thread.createdAt)} ·{' '}
          {thread.viewCount} vistas · {thread.replyCount} respuestas
        </p>
        {thread.tags.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {thread.tags.map((tag) => (
              <li key={tag}>
                <span className="rounded-md bg-[hsl(var(--forum-accent)/0.12)] px-2 py-0.5 text-xs text-[hsl(var(--forum-accent))]">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-[hsl(var(--forum-fg)/0.95)]">
          {thread.body}
        </div>
      </article>

      <section className="mt-8" aria-labelledby="forum-replies-title">
        <h2 id="forum-replies-title" className="text-lg font-bold">
          Respuestas ({replies.length})
        </h2>
        <ul className="mt-4 space-y-4" role="list">
          {replies.map((reply) => {
            const isAccepted = thread.acceptedReplyId === reply.id;
            return (
              <li
                key={reply.id}
                className={cn(
                  'rounded-xl border p-4',
                  isAccepted
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))]',
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs text-[hsl(var(--forum-muted))]">
                    {reply.author?.name ?? 'Usuario'} · {formatForumRelativeTime(reply.createdAt)}
                  </p>
                  {isAccepted ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      Solución aceptada
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{reply.body}</p>
                {canMarkSolution && !isAccepted ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={markSolved.isPending}
                    onClick={() => void handleMarkSolution(reply.id)}
                    className="mt-3 min-h-9 border-[hsl(var(--forum-border))] text-[hsl(var(--forum-accent))]"
                  >
                    Marcar como solución
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-5">
        <h2 className="text-base font-bold">Añadir respuesta</h2>
        {canReply ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <label htmlFor="reply-body" className="sr-only">
              Tu respuesta
            </label>
            <Textarea
              id="reply-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
              placeholder="Escribe tu respuesta…"
              className="border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-bg))] text-[hsl(var(--forum-fg))]"
              required
            />
            <Button
              type="submit"
              disabled={createReply.isPending}
              className="min-h-11 bg-[hsl(var(--forum-accent))] hover:bg-[hsl(var(--forum-accent)/0.9)]"
            >
              {createReply.isPending ? 'Publicando…' : 'Publicar respuesta'}
            </Button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-[hsl(var(--forum-muted))]">
            {user ? (
              'Las respuestas requieren una cuenta Supabase (no sesión demo).'
            ) : (
              <>
                <Link to="/login" className="font-semibold text-[hsl(var(--forum-accent))] hover:underline">
                  Inicia sesión
                </Link>{' '}
                para participar en la conversación.
              </>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
