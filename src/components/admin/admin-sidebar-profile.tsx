import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink, UserRound } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  mayorista: 'Mayorista',
  distribuidor: 'Distribuidor',
  public: 'Usuario',
};

function getInitials(name: string | undefined, email: string | undefined): string {
  const source = name?.trim() || email?.trim() || 'A';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

interface AdminSidebarProfileProps {
  className?: string;
}

export function AdminSidebarProfile({ className }: AdminSidebarProfileProps) {
  const { user, logout } = useAuth();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Administrador';
  const roleLabel = ROLE_LABELS[user?.role ?? 'admin'] ?? 'Administrador';

  return (
    <div className={cn('border-t border-[hsl(var(--admin-sidebar-border))]/50 px-3 py-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-[hsl(var(--admin-sidebar-hover))]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]"
            aria-label="Menú de cuenta"
          >
            <span className="relative shrink-0">
              <Avatar className="size-8 ring-1 ring-[hsl(var(--admin-sidebar-border))]">
                <AvatarFallback className="bg-[hsl(var(--admin-sidebar-hover))] text-xs font-semibold text-[hsl(var(--admin-sidebar-fg))]">
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-0 right-0 size-2 rounded-full border border-[hsl(var(--admin-sidebar-bg))] bg-emerald-400"
                aria-hidden="true"
              />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[0.8125rem] font-medium text-[hsl(var(--admin-sidebar-fg))]">
                {displayName}
              </span>
              <span className="block truncate text-[0.6875rem] text-[hsl(var(--admin-sidebar-fg-muted))]">
                {roleLabel}
              </span>
            </span>
            <ChevronDown
              className="size-3.5 shrink-0 text-[hsl(var(--admin-sidebar-fg-muted))]/70"
              aria-hidden="true"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuItem disabled>{displayName}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/mi-cuenta" className="cursor-pointer">
              <UserRound className="size-4" aria-hidden="true" />
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/" className="cursor-pointer">
              <ExternalLink className="size-4" aria-hidden="true" />
              Regresar al Sitio Web
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void logout()}>Cerrar sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
