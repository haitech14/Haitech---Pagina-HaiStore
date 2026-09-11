import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function SidebarItem({
  to,
  icon: Icon,
  label,
  badge,
  end,
  active,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  end?: boolean;
  active?: boolean;
}) {
  return (
    <NavLink
      to={to}
      {...(end ? { end: true } : {})}
      className={({ isActive }) => {
        const selected = active ?? isActive;
        return cn(
          'group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[13.5px] font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
          selected
            ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
            : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
        );
      }}
    >
      {({ isActive }) => {
        const selected = active ?? isActive;
        return (
        <>
          <Icon
            className={cn('size-[18px] shrink-0', selected ? 'text-white' : 'text-slate-400 group-hover:text-white')}
            strokeWidth={1.85}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {badge != null ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
              {badge}
            </span>
          ) : null}
        </>
        );
      }}
    </NavLink>
  );
}
