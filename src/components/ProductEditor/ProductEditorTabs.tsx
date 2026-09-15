import {
  Camera,
  CircleDollarSign,
  ClipboardList,
  Info,
  Link2,
  Package,
} from 'lucide-react';

import type { ProductEditorTabId } from '@/components/ProductEditor/product-editor-ui';
import { cn } from '@/lib/utils';

const TABS: Array<{
  id: ProductEditorTabId;
  label: string;
  icon: typeof Info;
}> = [
  { id: 'informacion', label: 'Información', icon: Info },
  { id: 'precios', label: 'Precios', icon: CircleDollarSign },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'atributos', label: 'Atributos', icon: ClipboardList },
  { id: 'multimedia', label: 'Multimedia', icon: Camera },
  { id: 'relaciones', label: 'Relaciones', icon: Link2 },
];

interface ProductEditorTabsProps {
  activeTab: ProductEditorTabId;
  onChange: (tab: ProductEditorTabId) => void;
}

export function ProductEditorTabs({ activeTab, onChange }: ProductEditorTabsProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[#E5E7EB] px-5 sm:px-6"
      aria-label="Secciones del producto"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
              active
                ? 'border-[#EF233C] text-[#EF233C]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827]',
            )}
          >
            <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
