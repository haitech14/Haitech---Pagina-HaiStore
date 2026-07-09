import { useEffect, useState } from 'react';
import { Bell, CircleHelp, LayoutPanelLeft, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { MURAL_BLOG_POSTS } from '@/data/mural-blog-mock';
import { cn } from '@/lib/utils';

interface MuralPageHeaderProps {
  className?: string;
  onSelectPost?: (id: string) => void;
}

export function MuralPageHeader({ className, onSelectPost }: MuralPageHeaderProps) {
  const { open: sidebarOpen, toggle: toggleSidebar } = useAdminSidebar();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          'flex flex-col gap-2.5 xl:flex-row xl:items-start xl:justify-between',
          className,
        )}
      >
        <div className="min-w-0 shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
            Mural
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Comunicados, publicaciones internas y cultura organizacional.
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center xl:max-w-2xl xl:justify-end">
          <button
            type="button"
            className="min-w-0 flex-1 sm:max-w-sm"
            onClick={() => setCommandOpen(true)}
            aria-label="Buscar publicaciones"
          >
            <div className="relative pointer-events-none">
              <Search
                className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                readOnly
                placeholder="Buscar…"
                className="h-8 rounded-md border-border/80 bg-card pl-8 pr-14 text-xs shadow-sm"
                aria-hidden="true"
                tabIndex={-1}
              />
              <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1 py-0.5 text-[0.5625rem] font-medium text-muted-foreground sm:inline">
                Ctrl+K
              </kbd>
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              className="h-8 gap-1.5 bg-card text-xs"
              onClick={toggleSidebar}
            >
              <LayoutPanelLeft className="size-3.5" aria-hidden="true" />
              {sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative size-8 bg-card"
              aria-label="Notificaciones"
            >
              <Bell className="size-3.5" aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[hsl(var(--admin-accent))] text-[0.5625rem] font-bold text-white ring-2 ring-background">
                2
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 bg-card"
              aria-label="Ayuda"
            >
              <CircleHelp className="size-3.5" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              className="h-8 gap-1 bg-[hsl(var(--admin-accent))] px-3 text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Nueva publicación
            </Button>
          </div>
        </div>
      </header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Buscar publicaciones…" />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Publicaciones">
            {MURAL_BLOG_POSTS.map((post) => (
              <CommandItem
                key={post.id}
                value={`${post.title} ${post.author.name}`}
                onSelect={() => {
                  setCommandOpen(false);
                  onSelectPost?.(post.id);
                }}
              >
                <span className="font-medium">{post.title}</span>
                <span className="ml-2 truncate text-muted-foreground">{post.author.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
