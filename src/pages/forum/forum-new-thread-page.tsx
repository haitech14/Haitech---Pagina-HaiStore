import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
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

export function ForumNewThreadPage() {
  const { user, authProvider, isLoading } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [] } = useForumCategories();
  const createThread = useCreateForumThread();
  const [categorySlug, setCategorySlug] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    document.title = `Nuevo tema | ${FORUM_TITLE_SUFFIX}`;
  }, []);

  useEffect(() => {
    if (!categorySlug && categories[0]) {
      setCategorySlug(categories[0].slug);
    }
  }, [categories, categorySlug]);

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
        Comparte una consulta, guía o debate con la comunidad HaiStore.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
