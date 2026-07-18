import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  ClipboardList,
  Eye,
  Headphones,
  LayoutGrid,
  ListOrdered,
  LogIn,
  LogOut,
  ShoppingBag,
  Sparkles,
  User,
  UserPlus,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import {
  headerIconActionButtonClass,
  type HeaderActionTone,
} from '@/components/layout/header-action-strip';
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
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { formatHaiPoints, getHaiPointsBalance } from '@/lib/haipoints';
import { VIEW_AS_ROLE_OPTIONS } from '@/lib/view-as-role';
import { cn } from '@/lib/utils';

const TechnicalServiceRequestDialog = lazy(() =>
  import('@/components/layout/technical-service-request-dialog').then((m) => ({
    default: m.TechnicalServiceRequestDialog,
  })),
);
import { USER_ROLE_LABELS, type UserRole } from '@/types/product';

const HOVER_CLOSE_DELAY_MS = 180;

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
        'flex w-full items-center gap-2 px-3 py-2 text-[0.8125rem]',
        isDanger ? 'text-red-600' : 'text-foreground',
      )}
    >
      <Icon
        className={cn('size-4 shrink-0', isDanger ? 'text-red-600' : 'text-muted-foreground')}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="flex-1 text-left font-medium">{label}</span>
      <ChevronRight
        className={cn('size-3.5 shrink-0', isDanger ? 'text-red-500' : 'text-muted-foreground/60')}
        aria-hidden="true"
      />
    </span>
  );
}

interface AccountDropdownProps {
  triggerVariant?: 'icon' | 'strip' | 'labeled';
  tone?: HeaderActionTone;
}

export function AccountDropdown({ triggerVariant = 'icon', tone = 'light' }: AccountDropdownProps) {
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
  const haiPoints = user ? getHaiPointsBalance(user) : 0;

  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={headerIconActionButtonClass(
            tone,
            triggerVariant === 'strip' || triggerVariant === 'labeled' ? 'sm' : 'md',
          )}
          aria-label={user ? `Menú de cuenta de ${displayName}` : 'Iniciar sesión o crear cuenta'}
          aria-haspopup="true"
          aria-expanded={open}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
        >
          <User
            className={cn(
              'shrink-0',
              triggerVariant === 'strip' || triggerVariant === 'labeled' ? 'size-4' : 'size-5',
            )}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="z-50 w-[min(100vw-2rem,17.5rem)] overflow-visible border-0 bg-transparent p-0 shadow-none"
      >
        <div className="relative mt-1.5 overflow-hidden rounded-lg border border-border/80 bg-white shadow-lg">
          <span
            className="absolute -top-[6px] right-6 z-10 size-3 rotate-45 border-l border-t border-border/80 bg-white"
            aria-hidden="true"
          />

          {user ? (
            <>
              <div className="border-b border-border/60 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="size-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8125rem] font-bold text-foreground">
                      Hola {displayName}
                    </p>
                    <span
                      className={cn(
                        'mt-0.5 inline-block rounded px-1.5 py-px text-[0.625rem] font-semibold leading-none',
                        previewingAsRole ? 'bg-orange-100 text-orange-800' : roleBadgeClass(user.role),
                      )}
                    >
                      {roleLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <div
                    className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-amber-900"
                    title="Saldo de HaiPoints"
                  >
                    <Sparkles className="size-3.5 shrink-0 text-amber-600" strokeWidth={1.75} aria-hidden="true" />
                    <span className="truncate text-[0.6875rem] font-semibold tabular-nums">
                      {formatHaiPoints(haiPoints)}{' '}
                      <span className="font-medium text-amber-800/80">HaiPoints</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => goTo('/mi-cuenta?tab=billetera')}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-white px-2 py-1.5',
                      'text-[0.6875rem] font-semibold text-foreground transition-colors',
                      'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
                    )}
                  >
                    <Wallet className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                    Billetera
                  </button>
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
                      className="min-h-8 cursor-pointer justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium focus:bg-muted/60"
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
                          className="min-h-8 cursor-pointer justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs focus:bg-muted/60"
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

              <div>
                <DropdownMenuItem
                  className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                  onSelect={() => goTo('/mi-cuenta?tab=billetera')}
                >
                  <AccountMenuRow icon={Wallet} label="Billetera" />
                </DropdownMenuItem>
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
                  <AccountMenuRow icon={ShoppingBag} label="Mis Compras" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                  onSelect={() => goTo('/mi-cuenta?tab=precios')}
                >
                  <AccountMenuRow icon={ListOrdered} label="Lista de Precios" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                  onSelect={() => goTo('/mi-cuenta?tab=packing')}
                >
                  <AccountMenuRow icon={ClipboardList} label="Packing List" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                  onSelect={(event) => {
                    event.preventDefault();
                    setOpen(false);
                    setSupportOpen(true);
                  }}
                >
                  <AccountMenuRow icon={Headphones} label="Soporte" />
                </DropdownMenuItem>
              </div>

              <DropdownMenuItem
                className="cursor-pointer rounded-none p-0 focus:bg-red-50 focus:text-red-600"
                onSelect={(event) => {
                  event.preventDefault();
                  setOpen(false);
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
                onSelect={(event) => {
                  event.preventDefault();
                  setOpen(false);
                  setSupportOpen(true);
                }}
              >
                <AccountMenuRow icon={Headphones} label="Soporte" />
              </DropdownMenuItem>
            </div>
          )}
        </div>
      </DropdownMenuContent>

      {supportOpen ? (
        <Suspense fallback={null}>
          <TechnicalServiceRequestDialog open={supportOpen} onOpenChange={setSupportOpen} />
        </Suspense>
      ) : null}
    </DropdownMenu>
  );
}
