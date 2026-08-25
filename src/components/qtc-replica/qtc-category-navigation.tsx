import { QTC, QTC_PRIMARY_CATEGORIES } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

export function QtcCategoryNavigation({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Categorías principales"
      className={cn('w-full border-b border-black/[0.06] bg-white', className)}
    >
      <ul
        className="mx-auto flex h-[45px] items-center justify-center gap-5 overflow-x-auto px-4 text-[13.5px] font-semibold text-[#1A1A1A] xl:gap-7 xl:px-6"
        style={{ maxWidth: QTC.maxWidth }}
      >
        {QTC_PRIMARY_CATEGORIES.map((label) => (
          <li key={label} className="shrink-0">
            <a
              href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
              className="inline-flex h-[45px] items-center transition-colors duration-200 hover:text-[color:var(--qtc-purple)]"
              style={{ ['--qtc-purple' as string]: QTC.purple }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
