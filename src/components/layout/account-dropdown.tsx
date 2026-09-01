import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
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

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import {
  type HeaderActionTone,
} from '@/components/layout/header-action-strip';
import { TechnicalServiceRequestDialog } from '@/components/layout/technical-service-request-dialog';
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
import { USER_ROLE_LABELS, type UserRole } from '@/types/product';

const HOVER_CLOSE_DELAY_MS = 180;

function getDisplayName(user: AuthUser | null): string {
  if (!user) return 'Iniciar sesión';
  const trimmed = user.name?.trim();
  if (trimmed) return trimmed.split(/\s+/)[0] ?? trimmed;
  const local = user.email.split('@')[0] ?? 'Usuario';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function getInitials(name: string | undefined, email: string | undefined): string {
  const source = name?.trim() || email?.trim() || 'A';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
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
      <span className="flex-1 truncate text-left font-medium">{label}</span>
      <ChevronRight
        className={cn('size-3 shrink-0 opacity-70', isDanger ? 'text-red-500' : 'text-muted-foreground')}
        aria-hidden="true"
      />
    </span>
  );
}

type AccountDropdownTriggerVariant =
  | 'icon'
  | 'strip'
  | 'labeled'
  | 'pill'
  | 'profile'
  | 'sidebar';

interface AccountDropdownProps {
  triggerVariant?: AccountDropdownTriggerVariant;
  tone?: HeaderActionTone;
  triggerClassName?: string;
  className?: string;
  menuSide?: 'top' | 'bottom' | 'left' | 'right';
  menuAlign?: 'start' | 'center' | 'end';
}

export function AccountDropdown({
  triggerVariant = 'icon',
  tone = 'light',
  triggerClassName,
  className,
  menuSide = 'bottom',
  menuAlign = 'end',
}: AccountDropdownProps) {
  const navigate = useNavigate();
  const location = useLocation();
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
  const showReturnToWebsite = showAdminPanel && location.pathname.startsWith('/admin');

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
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setViewAsSubOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const [viewAsSubOpen, setViewAsSubOpen] = useState(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        clearCloseTimer();
        setOpen(true);
      }
    },
    [clearCloseTimer],
  );

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const fullDisplayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Administrador';
  const initials = getInitials(user?.name, user?.email);
  const isCompactIcon =
    triggerVariant === 'strip' || triggerVariant === 'labeled' || triggerVariant === 'icon';
  const triggerButtonClass = cn(
    'relative inline-flex shrink-0 items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
    triggerVariant === 'pill' &&
      'h-[45px] gap-2 rounded-[10px] bg-[#F3F3F3] px-3.5 text-[12px] font-medium text-[#222] hover:bg-[#EAEAEA] focus-visible:ring-[#222]/20',
    triggerVariant === 'profile' &&
      'gap-2.5 rounded-md px-1 py-1 hover:bg-muted/50 focus-visible:ring-ring',
    triggerVariant === 'sidebar' &&
      'w-full gap-2 rounded-md px-1 py-1 text-left hover:bg-[hsl(var(--admin-sidebar-hover))]/60 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
    (triggerVariant === 'icon' ||
      triggerVariant === 'strip' ||
      triggerVariant === 'labeled') &&
      cn(
        'items-center justify-center rounded-full bg-transparent',
        triggerVariant === 'strip' || triggerVariant === 'labeled' ? 'size-9' : 'size-11',
        tone === 'dark'
          ? 'text-white hover:text-white/80 focus-visible:ring-white/40'
          : 'text-foreground hover:text-foreground/70 focus-visible:ring-ring',
      ),
    triggerClassName,
  );

  const triggerContent =
    triggerVariant === 'profile' ? (
      <>
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--admin-accent-soft))] text-xs font-bold text-[hsl(var(--admin-accent))]"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold leading-tight text-foreground">
            {fullDisplayName}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{roleLabel}</span>
        </span>
      </>
    ) : triggerVariant === 'sidebar' ? (
      <>
        <span className="relative shrink-0">
          <Avatar className="size-8 ring-1 ring-[hsl(var(--admin-sidebar-border))]">
            <AvatarFallback className="bg-[hsl(var(--admin-sidebar-hover))] text-xs font-semibold text-[hsl(var(--admin-sidebar-fg))]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute bottom-0 right-0 size-2 rounded-full border border-[hsl(var(--admin-sidebar-bg))] bg-emerald-400"
            aria-hidden="true"
          />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[0.8125rem] font-medium text-[hsl(var(--admin-sidebar-fg))]">
            {fullDisplayName}
          </span>
          <span className="block truncate text-[0.6875rem] text-[hsl(var(--admin-sidebar-fg-muted))]">
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          className="size-3.5 shrink-0 text-[hsl(var(--admin-sidebar-fg-muted))]/70"
          aria-hidden="true"
        />
      </>
    ) : (
      <>
        <User
          className={cn(
            'shrink-0',
            isCompactIcon ? 'size-4' : 'size-5',
            triggerVariant === 'pill' && 'size-[18px]',
          )}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        {triggerVariant === 'pill' ? (
          <span className="hidden whitespace-nowrap xl:inline">
            {user ? fullDisplayName : 'Iniciar sesión'}
          </span>
        ) : null}
        {triggerVariant === 'labeled' ? <span className="hidden sm:inline">Mi Cuenta</span> : null}
      </>
    );

  return (
    <div className={className}>
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={triggerButtonClass}
          aria-label={user ? `Menú de cuenta de ${displayName}` : 'Iniciar sesión o crear cuenta'}
          aria-haspopup="true"
          aria-expanded={open}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
        >
          {triggerContent}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={menuAlign}
        side={menuSide}
        sideOffset={8}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={cn(
          'z-50 overflow-visible border-0 bg-transparent p-0 shadow-none',
          user ? 'w-[min(100vw-2rem,16rem)]' : 'w-[min(100vw-2rem,12.75rem)]',
        )}
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
                <DropdownMenuSub open={viewAsSubOpen} onOpenChange={setViewAsSubOpen}>
                  <DropdownMenuSubTrigger
                    className="cursor-pointer rounded-none px-0 py-0 focus:bg-muted/50 data-[state=open]:bg-muted/50"
                    onPointerEnter={() => {
                      clearCloseTimer();
                      setViewAsSubOpen(true);
                    }}
                  >
                    <AccountMenuRow icon={Eye} label="Ver como" />
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    className="rounded-lg border-border/80 p-1 shadow-lg"
                    onMouseEnter={openMenu}
                    onMouseLeave={scheduleClose}
                  >
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

              {showReturnToWebsite ? (
                <DropdownMenuItem
                  className="cursor-pointer rounded-none p-0 focus:bg-muted/50"
                  onSelect={() => goTo('/')}
                >
                  <AccountMenuRow icon={ExternalLink} label="Volver a la página web" />
                </DropdownMenuItem>
              ) : null}

              <div>
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

      <TechnicalServiceRequestDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </DropdownMenu>
    </div>
  );
}
