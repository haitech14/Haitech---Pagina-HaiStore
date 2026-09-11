import { useEffect, useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from '@/components/tiendanova/Header';
import { Sidebar } from '@/components/tiendanova/Sidebar';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children?: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const id = 'tiendanova-inter';
    if (document.getElementById(id)) return undefined;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
    return undefined;
  }, []);

  return (
    <div
      className="flex min-h-dvh bg-[#F8FAFC] text-slate-900 antialiased [font-family:Inter,ui-sans-serif,system-ui,sans-serif]"
    >
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Cerrar menú"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-[280px] shadow-2xl">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main id="contenido" className={cn('flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8')}>
          {children ?? <Outlet />}
        </main>
        <footer className="border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400 sm:px-8">
          TiendaNova © 2025 · Panel administrativo
        </footer>
      </div>
    </div>
  );
}
