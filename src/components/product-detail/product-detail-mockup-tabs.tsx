import { cn } from '@/lib/utils';

export interface ProductDetailMockupTab {
  id: string;
  label: string;
}

interface ProductDetailMockupTabsProps {
  tabs: ProductDetailMockupTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function ProductDetailMockupTabs({
  tabs,
  activeTab,
  onTabChange,
}: ProductDetailMockupTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Secciones del producto"
      className="flex flex-row flex-nowrap items-end gap-5 overflow-x-auto border-b border-neutral-200"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative shrink-0 pb-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
              isActive
                ? 'font-semibold text-red-600 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-red-600'
                : 'font-normal text-neutral-500 hover:text-neutral-700',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
