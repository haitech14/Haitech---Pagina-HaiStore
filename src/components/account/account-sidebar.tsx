import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Headphones,
  ListOrdered,
  Menu,
  ShoppingBag,
  User,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsDesktopNav } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

export type AccountTab = 'cuenta' | 'pedidos' | 'precios' | 'packing';

interface AccountNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  tab?: AccountTab;
  href?: string;
}

const accountNavItems: AccountNavItem[] = [
  { id: 'cuenta', label: 'Mi Perfil', icon: User, tab: 'cuenta' },
  { id: 'pedidos', label: 'Mis Compras', icon: ShoppingBag, tab: 'pedidos' },
  { id: 'precios', label: 'Lista de Precios', icon: ListOrdered, tab: 'precios' },
  { id: 'packing', label: 'Packing List', icon: ClipboardList, tab: 'packing' },
  { id: 'soporte', label: 'Soporte', icon: Headphones, href: '/contacto' },
];

function navItemClass(active: boolean) {
  return cn(
    'flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    active
      ? 'border-red-600 bg-red-600/10 text-red-700'
      : 'border-border bg-card text-foreground hover:border-red-300 hover:bg-muted/50',
  );
}

interface AccountSidebarNavProps {
  activeTab: AccountTab;
  onSelectTab: (tab: AccountTab) => void;
  onNavigate?: () => void;
}

function AccountSidebarNav({ activeTab, onSelectTab, onNavigate }: AccountSidebarNavProps) {
  return (
    <nav aria-label="Secciones de mi cuenta">
      <ul className="space-y-2" role="list">
        {accountNavItems.map((item) => {
          const Icon = item.icon;
          const active = item.tab != null && item.tab === activeTab;

          if (item.href) {
            return (
              <li key={item.id}>
                <Link to={item.href} className={navItemClass(false)} onClick={onNavigate}>
                  <Icon className="size-4 shrink-0 text-red-600" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (item.tab) onSelectTab(item.tab);
                  onNavigate?.();
                }}
                className={navItemClass(active)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={cn('size-4 shrink-0', active ? 'text-red-600' : 'text-muted-foreground')}
                  aria-hidden="true"
                />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

interface AccountSidebarProps {
  activeTab: AccountTab;
  onSelectTab: (tab: AccountTab) => void;
}

export function AccountSidebar({ activeTab, onSelectTab }: AccountSidebarProps) {
  const isDesktopNav = useIsDesktopNav();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelectTab = (tab: AccountTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  if (isDesktopNav) {
    return (
      <aside className="w-full shrink-0 lg:w-60 xl:w-64">
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Mi cuenta
          </p>
          <AccountSidebarNav activeTab={activeTab} onSelectTab={onSelectTab} />
        </div>
      </aside>
    );
  }

  return (
    <div className="lg:hidden">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full justify-start gap-2 border-border"
            aria-label="Abrir menú de mi cuenta"
          >
            <Menu className="size-4 shrink-0" aria-hidden="true" />
            Menú de cuenta
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(100vw-2rem,18rem)] p-0">
          <SheetHeader className="border-b px-4 py-4 text-left">
            <SheetTitle className="text-base">Mi cuenta</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <AccountSidebarNav
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
