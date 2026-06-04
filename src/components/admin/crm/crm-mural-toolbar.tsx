import {
  ChevronRight,
  Download,
  HelpCircle,
  Redo2,
  Search,
  Share2,
  Undo2,
  ZoomIn,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useAdminWorkspace } from '@/context/admin-workspace-context';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { Link } from 'react-router-dom';

interface CrmMuralToolbarProps {
  zoomPercent?: number;
}

export function CrmMuralToolbar({ zoomPercent = 70 }: CrmMuralToolbarProps) {
  const { brand } = useAdminWorkspace();
  const { user } = useAuth();
  const initials = (user?.name ?? user?.email ?? 'NA').slice(0, 2).toUpperCase();
  const boardTitle = brand.id === 'haitech' ? 'NBN Tecnología Total S.A.C.' : brand.legalName;

  return (
    <div className="space-y-2 px-1 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-1">
          <Link to={ADMIN_ROUTES.DASHBOARD} className="hover:text-foreground hover:underline">
            Inicio
          </Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          <span className="inline-flex items-center gap-1 font-medium text-[hsl(var(--admin-accent))]">
            <span className="size-2 rounded-full bg-[hsl(var(--admin-accent))]" aria-hidden="true" />
            {boardTitle}
          </span>
        </nav>
        <div className="flex flex-wrap items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Deshacer">
            <Undo2 className="size-4" aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Rehacer">
            <Redo2 className="size-4" aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Ayuda">
            <HelpCircle className="size-4" aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Buscar en mural">
            <Search className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-emerald-600" role="status">
            Guardado
          </p>
          <h1 className="font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {boardTitle}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="link" className="h-auto px-0 text-xs text-muted-foreground">
            Recomienda a un amigo…
          </Button>
          <Avatar className="size-8">
            <AvatarFallback className="bg-[hsl(var(--admin-accent))]/10 text-xs font-semibold text-[hsl(var(--admin-accent))]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Button type="button" variant="outline" size="sm" className="min-h-9 gap-1.5 text-xs">
            <Share2 className="size-3.5" aria-hidden="true" />
            Compartir
          </Button>
          <Button type="button" variant="outline" size="sm" className="min-h-9 gap-1.5 text-xs">
            <Download className="size-3.5" aria-hidden="true" />
            Exportar
          </Button>
          <span className="inline-flex min-h-9 items-center rounded-md border bg-muted/40 px-2 text-xs font-medium tabular-nums text-muted-foreground">
            <ZoomIn className="mr-1 size-3.5" aria-hidden="true" />
            {zoomPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
