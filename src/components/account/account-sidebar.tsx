import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Headphones,
  ListOrdered,
  ShoppingBag,
  User,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export type AccountTab = 'cuenta' | 'pedidos' | 'precios' | 'packing' | 'billetera';

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
    'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    active
      ? 'border-red-600 bg-red-600/10 text-red-700'
      : 'border-border bg-card text-foreground hover:border-red-300 hover:bg-muted/50',
  );
}

interface AccountSidebarProps {
  activeTab: AccountTab;
  onSelectTab: (tab: AccountTab) => void;
}

export function AccountSidebar({ activeTab, onSelectTab }: AccountSidebarProps) {
  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Mi cuenta
      </p>
      <nav aria-label="Secciones de mi cuenta" className="-mx-1 overflow-x-auto px-1">
        <ul className="flex w-max min-w-full flex-row gap-2" role="list">
          {accountNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.tab != null && item.tab === activeTab;

            if (item.href) {
              return (
                <li key={item.id}>
                  <Link to={item.href} className={navItemClass(false)}>
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
                  }}
                  className={navItemClass(active)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'size-4 shrink-0',
                      active ? 'text-red-600' : 'text-muted-foreground',
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
