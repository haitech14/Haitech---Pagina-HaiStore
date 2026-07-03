import { ChevronDown } from 'lucide-react';

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
    <div className={cn('border-b border-[hsl(var(--admin-sidebar-border))]/50 px-4 py-3', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg py-0.5 text-left transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]"
            aria-label="Menú de cuenta"
          >
            <Avatar className="size-10 shrink-0 ring-2 ring-[hsl(var(--admin-sidebar-border))]">
              <AvatarFallback className="bg-[hsl(var(--admin-sidebar-hover))] text-sm font-semibold text-[hsl(var(--admin-sidebar-fg))]">
                {getInitials(user?.name, user?.email)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[hsl(var(--admin-sidebar-fg))]">
                {displayName}
              </span>
              <span className="block truncate text-xs text-[hsl(var(--admin-sidebar-fg-muted))]">
                {roleLabel}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-[0.6875rem] font-medium text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                En línea
              </span>
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-[hsl(var(--admin-sidebar-fg-muted))]"
              aria-hidden="true"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem disabled>{displayName}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void logout()}>Cerrar sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
