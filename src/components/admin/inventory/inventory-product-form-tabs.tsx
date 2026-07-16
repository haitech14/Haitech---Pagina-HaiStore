import type { LucideIcon } from 'lucide-react';
import { Camera, CircleDollarSign, ClipboardList, Link2, ListTree } from 'lucide-react';

import { cn } from '@/lib/utils';

export type InventoryProductFormTabId =
  | 'general'
  | 'precios'
  | 'atributos'
  | 'fotos'
  | 'relacionados';

const TABS: {
  id: InventoryProductFormTabId;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'general', label: 'General', icon: ClipboardList },
  { id: 'precios', label: 'Precios', icon: CircleDollarSign },
  { id: 'atributos', label: 'Atributos', icon: ListTree },
  { id: 'fotos', label: 'Fotos', icon: Camera },
  { id: 'relacionados', label: 'Relacionados', icon: Link2 },
];

type InventoryProductFormTabsProps = {
  activeTab: InventoryProductFormTabId;
  onTabChange: (tab: InventoryProductFormTabId) => void;
};

export function InventoryProductFormTabs({
  activeTab,
  onTabChange,
}: InventoryProductFormTabsProps) {
  return (
    <div
      className="shrink-0 border-b border-border/60 bg-card px-4 sm:px-6"
      role="tablist"
      aria-label="Secciones del producto"
    >
      <div className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`inv-tab-${tab.id}`}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                isActive
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
