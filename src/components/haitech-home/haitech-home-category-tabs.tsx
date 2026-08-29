import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HAITECH_HOME, HAITECH_PRODUCT_TABS } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

type TabId = (typeof HAITECH_PRODUCT_TABS)[number]['id'];

export function HaitechHomeCategoryTabs({ className }: { className?: string }) {
  const [active, setActive] = useState<TabId>('ofertas');

  return (
    <section className={cn('w-full', className)} style={{ backgroundColor: HAITECH_HOME.grayBg }}>
      <div
        className="mx-auto flex flex-col gap-4 px-4 pb-16 pt-[30px] sm:flex-row sm:items-center sm:justify-between xl:px-6"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <h2 className="text-[22px] font-bold text-black sm:text-[24px]">
          Nuestros Productos Más Vendidos
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {HAITECH_PRODUCT_TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <Link
                key={tab.id}
                to={tab.to}
                onClick={() => setActive(tab.id)}
                className={cn(
                  'inline-flex h-9 items-center rounded-[5px] px-3.5 text-[13px] font-semibold transition-colors duration-200',
                  isActive
                    ? 'text-white'
                    : 'border border-[#D0D0D0] bg-white text-[#222] hover:border-[#BDBDBD]',
                )}
                style={isActive ? { backgroundColor: HAITECH_HOME.brand } : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
