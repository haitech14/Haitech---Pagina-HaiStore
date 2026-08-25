import type { ReactNode } from 'react';
import { Heart, Search, ShoppingCart, User } from 'lucide-react';

import { QTC } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

function QtcLogo() {
  return (
    <a href="/qtc" className="inline-flex shrink-0 items-end gap-0.5" aria-label="QTC">
      <span
        className="text-[2.15rem] font-black leading-none tracking-tight"
        style={{ color: QTC.purple }}
      >
        QTC
      </span>
      <span
        className="mb-1 size-2.5 rounded-sm"
        style={{ backgroundColor: QTC.orange }}
        aria-hidden="true"
      />
    </a>
  );
}

function HeaderAction({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-[45px] items-center gap-2 rounded-[10px] bg-[#F3F3F3] px-3.5',
        'text-[12px] font-medium text-[#222] transition-colors duration-200 hover:bg-[#EAEAEA]',
      )}
    >
      {icon}
      <span className="hidden whitespace-nowrap xl:inline">{label}</span>
    </button>
  );
}

export function QtcMainHeader({ className }: { className?: string }) {
  return (
    <header className={cn('w-full border-b border-black/[0.04] bg-white', className)}>
      <div
        className="mx-auto flex h-[85px] items-center gap-4 px-4 xl:gap-6 xl:px-6"
        style={{ maxWidth: QTC.maxWidth }}
      >
        <QtcLogo />

        <form
          className="mx-auto flex h-[43px] w-full max-w-[650px] flex-1 items-center gap-2 rounded-[13px] border border-[#D9D9D9] bg-white px-3.5"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search className="size-[18px] shrink-0 text-[#888]" strokeWidth={1.75} aria-hidden="true" />
          <input
            type="search"
            placeholder="¿Qué estás buscando?"
            className="h-full w-full bg-transparent text-[14px] text-[#222] outline-none placeholder:text-[#9A9A9A]"
            aria-label="Buscar en QTC"
          />
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <HeaderAction
            icon={<User className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />}
            label="Iniciar sesión"
          />
          <HeaderAction
            icon={<Heart className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />}
            label="Mis favoritos"
          />
          <HeaderAction
            icon={<ShoppingCart className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />}
            label="Mi carrito"
          />
        </div>
      </div>
    </header>
  );
}
