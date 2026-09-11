import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  Crown,
  FileText,
  Home,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tags,
  Ticket,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

import { SidebarItem } from '@/components/tiendanova/SidebarItem';
import { TIENDANOVA_BRAND, TIENDANOVA_NAV, type TiendaNovaNavItem } from '@/data/tiendanova/dashboard';
import { cn } from '@/lib/utils';

const NAV_ICONS: Record<TiendaNovaNavItem['icon'], LucideIcon> = {
  home: Home,
  'shopping-cart': ShoppingCart,
  'file-text': FileText,
  package: Package,
  tags: Tags,
  warehouse: Warehouse,
  users: Users,
  'bar-chart-3': BarChart3,
  star: Star,
  ticket: Ticket,
  truck: Truck,
  megaphone: Megaphone,
  settings: Settings,
};

function isNavItemActive(item: TiendaNovaNavItem, pathname: string, search: string): boolean {
  if (item.id === 'dashboard') return pathname === '/admin';
  if (item.id === 'cotizaciones') {
    return pathname.startsWith('/admin/ventas') && search.includes('vista=cotizaciones');
  }
  if (item.id === 'ventas') {
    return pathname.startsWith('/admin/ventas') && !search.includes('vista=cotizaciones');
  }
  if (item.id === 'cupones') return pathname.startsWith('/admin/marketing/cupones');
  if (item.id === 'marketing') {
    return pathname.startsWith('/admin/marketing') && !pathname.startsWith('/admin/marketing/cupones');
  }
  if (item.id === 'clientes') {
    return pathname.startsWith('/admin/crm/clientes') || pathname.startsWith('/admin/clientes');
  }
  if (item.id === 'productos' || item.id === 'inventario') {
    return pathname.startsWith('/admin/inventario');
  }
  if (item.id === 'resenas') return pathname.startsWith('/admin/mural');
  const pathOnly = item.href.split('?')[0] ?? item.href;
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { pathname, search } = useLocation();

  return (
    <aside
      className={cn(
        'flex h-dvh w-[280px] shrink-0 flex-col text-white',
        className,
      )}
      style={{ background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)' }}
    >
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#2563EB] shadow-[0_8px_20px_rgba(37,99,235,0.35)]">
          <ShoppingBag className="size-5 text-white" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[17px] font-bold tracking-tight">{TIENDANOVA_BRAND.name}</p>
            <span className="rounded-md bg-[#2563EB] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
              PRO
            </span>
          </div>
          <p className="text-[12px] text-slate-400">{TIENDANOVA_BRAND.tagline}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Navegación TiendaNova" onClick={onNavigate}>
        {TIENDANOVA_NAV.map((item) => (
          <SidebarItem
            key={item.id}
            to={item.href}
            icon={NAV_ICONS[item.icon]}
            label={item.label}
            {...(item.id === 'dashboard' ? { end: true } : {})}
            {...(item.badge != null ? { badge: item.badge } : {})}
            active={isNavItemActive(item, pathname, search)}
          />
        ))}
      </nav>

      <div className="px-3 pb-5">
        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.04] p-4 ring-1 ring-white/10">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-400/15">
              <Crown className="size-5 text-amber-300" fill="currentColor" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-white">{TIENDANOVA_BRAND.planTitle}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-slate-400">{TIENDANOVA_BRAND.planSubtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
