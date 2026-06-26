import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { FORUM_KIND_PLACEHOLDERS, FORUM_THREAD_KIND_OPTIONS } from '@/data/forum-pillars';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { useCreateForumThread, useForumCategories } from '@/hooks/use-forum';
import type { ForumThreadKind } from '@/types/forum';

const VALID_TIPOS = new Set<ForumThreadKind>(['discussion', 'question', 'tutorial', 'firmware']);

function parseTipoParam(value: string | null): ForumThreadKind {
  if (value && VALID_TIPOS.has(value as ForumThreadKind)) {
    return value as ForumThreadKind;
  }
  return 'discussion';
}

export function ForumNewThreadPage() {
  const { user, authProvider, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipoParam = searchParams.get('tipo');
  const { data: categories = [] } = useForumCategories();
  const createThread = useCreateForumThread();
  const [categorySlug, setCategorySlug] = useState('');
  const [kind, setKind] = useState<ForumThreadKind>(() => parseTipoParam(tipoParam));
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    document.title = `Nuevo tema | ${FORUM_TITLE_SUFFIX}`;
  }, []);

  useEffect(() => {
    setKind(parseTipoParam(tipoParam));
  }, [tipoParam]);

  useEffect(() => {
    if (!categorySlug && categories[0]) {
      const firmwareCat = categories.find((c) => c.slug === 'firmware');
      if (kind === 'firmware' && firmwareCat) {
        setCategorySlug(firmwareCat.slug);
      } else {
        setCategorySlug(categories[0].slug);
      }
    }
  }, [categories, categorySlug, kind]);

  const placeholders = useMemo(() => FORUM_KIND_PLACEHOLDERS[kind], [kind]);

  if (!isLoading && (!user || authProvider !== 'supabase')) {
    return <Navigate to="/login" replace state={{ from: '/foro/nuevo' }} />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categorySlug || !title.trim() || !body.trim()) return;

    try {
      const result = await createThread.mutateAsync({
        categorySlug,
        title: title.trim(),
        body: body.trim(),
        kind,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      toast.success('Tema creado');
      navigate(`/foro/tema/${result.thread.slug}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el tema');
    }
  };

  return (
    <div className="container max-w-2xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm">
        <Link to="/foro" className="text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-accent))]">
          ← Volver al foro
        </Link>
      </nav>
      <h1 className="text-2xl font-bold">Nuevo tema</h1>
      <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">
        Comparte una consulta, guía o nota de firmware con la comunidad HaiStore.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="thread-kind">Tipo de publicación</Label>
          <Select
            value={kind}
            onValueChange={(value) => setKind(value as ForumThreadKind)}
          >
            <SelectTrigger
              id="thread-kind"
              className="border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] text-[hsl(var(--forum-fg))]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORUM_THREAD_KIND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thread-category">Categoría</Label>
          <Select value={categorySlug} onValueChange={setCategorySlug} required>
            <SelectTrigger
              id="thread-category"
              className="border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] text-[hsl(var(--forum-fg))]"
            >
              <SelectValue placeholder="Elige categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thread-title">Título</Label>
          <Input
            id="thread-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            minLength={3}
            placeholder={placeholders.title}
            className="border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] text-[hsl(var(--forum-fg))]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thread-body">Contenido</Label>
          <Textarea
            id="thread-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            minLength={10}
            rows={8}
            placeholder={placeholders.body}
            className="border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] text-[hsl(var(--forum-fg))]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thread-tags">Etiquetas (opcional, separadas por coma)</Label>
          <Input
            id="thread-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Hardware, Ricoh, Soporte"
            className="border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] text-[hsl(var(--forum-fg))]"
          />
        </div>

        <Button
          type="submit"
          disabled={createThread.isPending}
          className="min-h-11 w-full bg-[hsl(var(--forum-accent))] hover:bg-[hsl(var(--forum-accent)/0.9)] sm:w-auto"
        >
          {createThread.isPending ? 'Publicando…' : 'Publicar tema'}
        </Button>
      </form>
    </div>
  );
}
