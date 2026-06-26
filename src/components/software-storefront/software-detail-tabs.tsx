import { useState } from 'react';
import { Cloud, Headphones, PiggyBank, ShieldCheck } from 'lucide-react';

import type { SoftwareCatalogItem } from '@/types/software-catalog';
import { cn } from '@/lib/utils';

const VALUE_ICONS = [PiggyBank, Cloud, ShieldCheck, Headphones];

type DetailTabId = 'descripcion' | 'incluye' | 'condiciones' | 'faq';

const TABS: { id: DetailTabId; label: string }[] = [
  { id: 'descripcion', label: 'Descripción' },
  { id: 'incluye', label: 'Incluye' },
  { id: 'condiciones', label: 'Condiciones' },
  { id: 'faq', label: 'Preguntas frecuentes' },
];

interface SoftwareDetailTabsProps {
  item: SoftwareCatalogItem;
  className?: string;
}

export function SoftwareDetailTabs({ item, className }: SoftwareDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>('descripcion');

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Información del software"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'shrink-0 border-b-2 px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
              activeTab === tab.id
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="text-sm leading-relaxed text-muted-foreground">
        {activeTab === 'descripcion' ? <p>{item.description}</p> : null}
        {activeTab === 'incluye' ? (
          <ul className="list-disc space-y-2 pl-5">
            {item.inclusions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        {activeTab === 'condiciones' ? (
          <ul className="list-disc space-y-2 pl-5">
            {item.conditions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        {activeTab === 'faq' ? (
          <div className="space-y-4">
            {item.faq.map((entry) => (
              <div key={entry.question}>
                <p className="font-semibold text-foreground">{entry.question}</p>
                <p className="mt-1">{entry.answer}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface SoftwareDetailValuePropsProps {
  item: SoftwareCatalogItem;
  className?: string;
}

export function SoftwareDetailValueProps({ item, className }: SoftwareDetailValuePropsProps) {
  return (
    <aside
      className={cn(
        'rounded-xl border border-border/70 bg-card p-5 shadow-sm',
        className,
      )}
      aria-labelledby="software-value-props-titulo"
    >
      <h2 id="software-value-props-titulo" className="text-base font-bold text-foreground">
        ¿Por qué elegir este software?
      </h2>
      <ul className="mt-4 space-y-4">
        {item.valueProps.map((prop, index) => {
          const Icon = VALUE_ICONS[index % VALUE_ICONS.length];
          return (
            <li key={prop.id} className="flex gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"
                aria-hidden="true"
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {prop.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
