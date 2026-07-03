import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
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

interface AdminTopBarUserMenuProps {
  className?: string;
}

export function AdminTopBarUserMenu({ className }: AdminTopBarUserMenuProps) {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Administrador';
  const roleLabel = ROLE_LABELS[user?.role ?? 'admin'] ?? 'Administrador';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--admin-accent-soft))] text-xs font-bold text-[hsl(var(--admin-accent))]"
        aria-hidden="true"
      >
        {getInitials(user?.name, user?.email)}
      </div>
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-semibold leading-tight text-foreground">{displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
      </div>
    </div>
  );
}
