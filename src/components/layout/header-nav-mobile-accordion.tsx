import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import type { HeaderNavSubmenuConfig, HeaderNavSubmenuItem } from '@/data/header-nav-submenus';
import { cn } from '@/lib/utils';

type HeaderNavMobileAccordionProps = {
  config: HeaderNavSubmenuConfig;
  onNavigate?: () => void;
};

const mobileLinkClass =
  'block px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset';

const mobileHeadingClass =
  'px-4 pb-1 pt-2.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-white/55';

const mobileInfoClass =
  'block px-4 py-2.5 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset';

function isExternalSubmenuHref(href: string, external?: boolean): boolean {
  return Boolean(external || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'));
}

function submenuItemKey(item: HeaderNavSubmenuItem, index: number): string {
  if (item.kind === 'info') return `${item.kind}-${item.label}-${item.value}`;
  return `${item.kind ?? 'link'}-${item.label}-${index}`;
}

function HeaderNavMobileSubmenuItemContent({
  item,
  onNavigate,
}: {
  item: HeaderNavSubmenuItem;
  onNavigate: () => void;
}) {
  if (item.kind === 'heading') {
    return <p className={mobileHeadingClass}>{item.label}</p>;
  }

  if (item.kind === 'info') {
    const content = (
      <div className="flex flex-col gap-0.5 text-left">
        <span className="text-xs font-medium text-white/55">{item.label}</span>
        <span className="text-sm text-white/90">{item.value}</span>
      </div>
    );

    if (item.href) {
      const external = isExternalSubmenuHref(item.href, item.external);
      return (
        <a
          href={item.href}
          target={external && item.href.startsWith('http') ? '_blank' : undefined}
          rel={external && item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          onClick={onNavigate}
          className={mobileInfoClass}
        >
          {content}
        </a>
      );
    }

    return <div className={cn(mobileInfoClass, 'cursor-default')}>{content}</div>;
  }

  const external = isExternalSubmenuHref(item.href, item.external);
  if (external) {
    return (
      <a
        href={item.href}
        target={item.href.startsWith('http') ? '_blank' : undefined}
        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        onClick={onNavigate}
        className={mobileLinkClass}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.href} onClick={onNavigate} className={mobileLinkClass}>
      {item.label}
    </Link>
  );
}

export function HeaderNavMobileAccordion({ config, onNavigate }: HeaderNavMobileAccordionProps) {
  const [open, setOpen] = useState(false);
  const Icon = config.icon;

  const closeAll = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-white/15 bg-white/5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-normal text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
          {config.label}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 shrink-0 text-white/70 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <ul className="border-t border-white/10 py-1">
          {config.items.map((item, index) => (
            <li key={submenuItemKey(item, index)} role={item.kind === 'heading' ? 'presentation' : undefined}>
              <HeaderNavMobileSubmenuItemContent item={item} onNavigate={closeAll} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
