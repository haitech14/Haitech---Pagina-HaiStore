import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound } from 'lucide-react';

import { TIENDANOVA_HEADER, TIENDANOVA_USER } from '@/data/tiendanova/dashboard';

export function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-slate-100 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
        aria-label="Abrir menú"
        onClick={onOpenSidebar}
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{TIENDANOVA_HEADER.searchPlaceholder}</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={searchRef}
          type="search"
          placeholder={TIENDANOVA_HEADER.searchPlaceholder}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] pl-10 pr-16 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB]/40 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-400 sm:inline-flex">
          ⌘ K
        </kbd>
      </label>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          aria-label={`Notificaciones, ${TIENDANOVA_HEADER.notifications} nuevas`}
        >
          <Bell className="size-[18px]" aria-hidden="true" />
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
            {TIENDANOVA_HEADER.notifications}
          </span>
        </button>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-50"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <img
              src={TIENDANOVA_USER.avatar}
              alt=""
              className="size-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <span className="hidden text-left sm:block">
              <span className="block text-[13px] font-semibold leading-tight text-slate-800">{TIENDANOVA_USER.name}</span>
              <span className="block text-[12px] leading-tight text-slate-400">{TIENDANOVA_USER.role}</span>
            </span>
            <ChevronDown className="hidden size-4 text-slate-400 sm:block" aria-hidden="true" />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl"
            >
              <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50" role="menuitem">
                <UserRound className="size-4" aria-hidden="true" /> Perfil
              </button>
              <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50" role="menuitem">
                <Settings className="size-4" aria-hidden="true" /> Ajustes
              </button>
              <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50" role="menuitem">
                <LogOut className="size-4" aria-hidden="true" /> Salir
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
