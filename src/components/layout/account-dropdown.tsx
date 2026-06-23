import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Headphones,
  LayoutGrid,
  LogIn,
  LogOut,
  ShoppingBag,
  Star,
  User,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import type { AuthUser } from '@/lib/auth-storage';
import { ADMIN_PANEL_EMAILS, normalizeAuthEmail } from '@/lib/admin-access';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { VIEW_AS_ROLE_OPTIONS } from '@/lib/view-as-role';
import { cn } from '@/lib/utils';
import { USER_ROLE_LABELS, type UserRole } from '@/types/product';

function getDisplayName(user: AuthUser | null): string {
  if (!user) return 'Iniciar sesión';
  const trimmed = user.name?.trim();
  if (trimmed) return trimmed.split(/\s+/)[0] ?? trimmed;
  const local = user.email.split('@')[0] ?? 'Usuario';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function roleBadgeClass(role: UserRole | 'public'): string {
  if (role === 'admin') return 'bg-violet-100 text-violet-700';
  if (role === 'vip') return 'bg-amber-100 text-amber-800';
  return 'bg-sky-100 text-sky-700';
}

/** Puntos de fidelidad (demo hasta integrar backend). */
function getHaiPoints(user: AuthUser): number {
  if (ADMIN_PANEL_EMAILS.includes(normalizeAuthEmail(user.email))) {
    return 2450;
  }
  const seed = user.id?.length ?? user.email.length;
  return 800 + (seed % 17) * 100;
}

interface AccountMenuRowProps {
  icon: LucideIcon;
  label: string;
  variant?: 'default' | 'danger';
}

function AccountMenuRow({ icon: Icon, label, variant = 'default' }: AccountMenuRowProps) {
  const isDanger = variant === 'danger';

  return (
    <span
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-sm',
        isDanger ? 'text-red-600' : 'text-foreground',
      )}
    >
      <Icon
        className={cn('size-[1.125rem] shrink-0', isDanger ? 'text-red-600' : 'text-muted-foreground')}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="flex-1 text-left font-medium">{label}</span>
      <ChevronRight
        className={cn('size-4 shrink-0', isDanger ? 'text-red-500' : 'text-muted-foreground/60')}
        aria-hidden="true"
      />
    </span>
  );
}

function HaiPointsBanner({ points }: { points: number }) {
  return (
    <div className="mx-3 flex w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl bg-[#FFF0EB] px-3 py-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-600 shadow-sm"
        aria-hidden="true"
      >
        <Star className="size-5 fill-white text-white" strokeWidth={0} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-foreground">Tus HaiPoints</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          Acumula puntos y obtén beneficios
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-0.5">
        <span className="text-sm font-bold text-red-600">
          {points.toLocaleString('es-PE')} pts
        </span>
        <ChevronRight className="size-4 text-red-600" aria-hidden="true" />
      </span>
    </div>
  );
}

interface AccountDropdownProps {
  triggerVariant?: 'icon' | 'strip';
}

export function AccountDropdown({ triggerVariant = 'icon' }: AccountDropdownProps) {
  const navigate = useNavigate();
  const {
    user,
    logout,
    canAccessAdminPanel: showAdminPanel,
    role,
    viewAsRoles,
    toggleViewAsRole,
    clearViewAsRoles,
  } = useAuth();
  const displayName = getDisplayName(user);
  const previewingAsRole = viewAsRoles.length > 0;
  const roleLabel = previewingAsRole
    ? viewAsRoles.length === 1
      ? `Como ${USER_ROLE_LABELS[viewAsRoles[0]!]}`
      : `Como ${viewAsRoles.map((item) => USER_ROLE_LABELS[item]).join(' · ')}`
    : user
      ? USER_ROLE_LABELS[user.role]
      : USER_ROLE_LABELS.public;

  const goTo = (path: string) => {
    navigate(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerVariant === 'strip' ? (
          <Button
            variant="ghost"
            className="h-9 min-h-9 shrink-0 gap-1.5 rounded-none px-3 text-sm font-medium normal-case tracking-normal text-foreground hover:bg-muted focus-visible:ring-inset"
            aria-label={user ? `Menú de cuenta de ${displayName}` : 'Iniciar sesión o crear cuenta'}
          >
            <User className="size-4 shrink-0 text-foreground" strokeWidth={1.75} aria-hidden="true" />
            <span>Mi cuenta</span>
            <ChevronDown className="size-3.5 shrink-0 text-foreground" strokeWidth={1.75} aria-hidden="true" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 sm:inline-flex"
            aria-label={user ? `Menú de cuenta de ${displayName}` : 'Iniciar sesión o crear cuenta'}
          >
            <User className="size-5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="z-50 w-[min(100vw-2rem,20rem)] overflow-visible border-0 bg-transparent p-0 shadow-none"
      >
        <div className="relative mt-2 overflow-hidden rounded-xl border border-border/80 bg-white shadow-lg">
          <span
            className="absolute -top-[7px] right-6 z-10 size-3.5 rotate-45 border-l border-t border-border/80 bg-white"
            aria-hidden="true"
          />

          {user ? (
            <>
              <div className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="size-5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">Hola {displayName}</p>
                    <span
                      className={cn(
                        'mt-1 inline-block rounded-md px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none',
                        previewingAsRole ? 'bg-orange-100 text-orange-800' : roleBadgeClass(user.role),
                      )}
                    >
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </div>

              {showAdminPanel && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                  onSelect={() => goTo(ADMIN_ROUTES.DASHBOARD)}
                >
                  <AccountMenuRow icon={LayoutGrid} label="Panel Administración" />
                </DropdownMenuItem>
              )}

              {showAdminPanel && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer rounded-none px-0 py-0 focus:bg-muted/50 data-[state=open]:bg-muted/50">
                    <AccountMenuRow icon={Eye} label="Ver como (Rol)" />
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="rounded-lg border-border/80 p-1 shadow-lg">
                    <DropdownMenuItem
                      className="min-h-10 cursor-pointer justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium focus:bg-muted/60"
                      onSelect={(event) => {
                        event.preventDefault();
                        clearViewAsRoles();
                      }}
                    >
                      <span>Mi rol real ({USER_ROLE_LABELS[role as UserRole] ?? role})</span>
                      {!previewingAsRole ? (
                        <Check className="size-4 shrink-0 text-red-600" aria-hidden="true" />
                      ) : null}
                    </DropdownMenuItem>
                    {VIEW_AS_ROLE_OPTIONS.map((option) => {
                      const selected = viewAsRoles.includes(option.value);
                      return (
                        <DropdownMenuItem
                          key={option.value}
                          className="min-h-10 cursor-pointer justify-between gap-2 rounded-md px-3 py-2 text-sm focus:bg-muted/60"
                          onSelect={(event) => {
                            event.preventDefault();
                            toggleViewAsRole(option.value);
                          }}
                        >
                          <span>{option.label}</span>
                          {selected ? (
                            <Check className="size-4 shrink-0 text-red-600" aria-hidden="true" />
                          ) : null}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              <DropdownMenuItem
                className="cursor-pointer rounded-none p-0 py-3 focus:bg-transparent data-[highlighted]:bg-transparent"
                onSelect={() => goTo('/tienda')}
              >
                <HaiPointsBanner points={getHaiPoints(user)} />
              </DropdownMenuItem>

              <div className="py-1">
                <DropdownMenuItem
                  className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                  onSelect={() => goTo('/mi-cuenta')}
                >
                  <AccountMenuRow icon={User} label="Mi Cuenta" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                  onSelect={() => goTo('/mi-cuenta?tab=pedidos')}
                >
                  <AccountMenuRow icon={ShoppingBag} label="Mis Pedidos" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                  onSelect={() => goTo('/contacto')}
                >
                  <AccountMenuRow icon={Headphones} label="Soporte" />
                </DropdownMenuItem>
              </div>

              <DropdownMenuItem
                className="cursor-pointer rounded-none p-0 focus:bg-red-50 focus:text-red-600"
                onSelect={(event) => {
                  event.preventDefault();
                  void logout();
                }}
              >
                <AccountMenuRow icon={LogOut} label="Cerrar Sesión" variant="danger" />
              </DropdownMenuItem>
            </>
          ) : (
            <div className="py-1">
              <DropdownMenuItem
                className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                onSelect={() => goTo('/login')}
              >
                <AccountMenuRow icon={LogIn} label="Iniciar sesión" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                onSelect={() => goTo('/login/registro')}
              >
                <AccountMenuRow icon={UserPlus} label="Crear cuenta" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                onSelect={() => goTo('/contacto')}
              >
                <AccountMenuRow icon={Headphones} label="Soporte" />
              </DropdownMenuItem>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
