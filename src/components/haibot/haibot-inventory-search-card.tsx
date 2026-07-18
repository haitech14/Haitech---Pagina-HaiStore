import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';

import { HaibotAgentAvatar } from '@/components/haibot/haibot-agent-avatar';
import {
  formatHaibotInventorySearchHeader,
  HAIBOT_INVENTORY_SEARCH_LIMIT,
  type HaibotInventorySearchItem,
  type HaibotInventorySearchPayload,
} from '@/lib/haibot-inventory-search';
import { getSearchCategoryEmoji } from '@/lib/product-search';
import { cn } from '@/lib/utils';

function HaibotProductThumb({ item }: { item: HaibotInventorySearchItem }) {
  const [failed, setFailed] = useState(false);
  const src = item.imageUrl?.trim() || '';

  if (!src || failed) {
    return (
      <span
        className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#e9edef] bg-[#f5f6f6]"
        aria-hidden="true"
      >
        <Package className="size-5 text-[#8696a0]" />
      </span>
    );
  }

  return (
    <span className="relative size-14 shrink-0 overflow-hidden rounded-md border border-[#e9edef] bg-white">
      <img
        src={src}
        alt=""
        width={56}
        height={56}
        loading="lazy"
        decoding="async"
        className="size-full object-contain p-0.5"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function groupVisibleItems(items: HaibotInventorySearchItem[]) {
  const groups: { category: string; products: HaibotInventorySearchItem[] }[] = [];
  const indexByCategory = new Map<string, number>();

  for (const item of items) {
    const existing = indexByCategory.get(item.category);
    if (existing != null) {
      groups[existing]?.products.push(item);
      continue;
    }
    indexByCategory.set(item.category, groups.length);
    groups.push({ category: item.category, products: [item] });
  }

  return groups;
}

interface HaibotInventorySearchCardProps {
  payload: HaibotInventorySearchPayload;
  onNavigateAway?: () => void;
}

export function HaibotInventorySearchCard({
  payload,
  onNavigateAway,
}: HaibotInventorySearchCardProps) {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(HAIBOT_INVENTORY_SEARCH_LIMIT);

  const visibleItems = payload.items.slice(0, visibleCount);
  const hasMoreInPayload = visibleCount < payload.items.length;
  const hasMoreInStore = payload.total > payload.items.length;
  const showVerMas = hasMoreInPayload || hasMoreInStore || payload.total > visibleCount;

  const groups = groupVisibleItems(visibleItems);
  let itemIndex = 0;

  const handleVerMas = () => {
    if (hasMoreInPayload) {
      setVisibleCount((current) =>
        Math.min(current + HAIBOT_INVENTORY_SEARCH_LIMIT, payload.items.length),
      );
      return;
    }

    onNavigateAway?.();
    void navigate(payload.storeSearchHref);
  };

  return (
    <div className="w-full space-y-2.5">
      <p className="flex items-start gap-1.5 text-[0.8125rem] font-semibold leading-snug text-[#111b21]">
        <HaibotAgentAvatar size="xs" className="mt-0.5 size-5" />
        <span>
          {formatHaibotInventorySearchHeader(payload.query, visibleItems.length, payload.total)}
        </span>
      </p>

      <ul className="space-y-2.5" role="list">
        {groups.map((group) => (
          <li key={group.category} className="space-y-1.5">
            <p className="text-[0.7rem] font-semibold text-[#54656f]">
              {getSearchCategoryEmoji(group.category)} {group.category}
            </p>
            <ul className="space-y-1.5" role="list">
              {group.products.map((item) => {
                itemIndex += 1;
                return (
                  <li key={item.id}>
                    <Link
                      to={item.href}
                      onClick={onNavigateAway}
                      className={cn(
                        'flex gap-2.5 rounded-lg border border-[#e9edef] bg-white p-2 shadow-sm',
                        'transition-colors hover:border-[#075e54]/35 hover:bg-[#f0faf8]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54]',
                      )}
                    >
                      <HaibotProductThumb item={item} />
                      <span className="min-w-0 flex-1 space-y-0.5">
                        <span className="block text-[0.75rem] font-semibold leading-snug text-[#111b21]">
                          {itemIndex}. {item.name}
                        </span>
                        {item.code ? (
                          <span className="block truncate text-[0.65rem] text-[#667781]">
                            📋 {item.code}
                          </span>
                        ) : null}
                        {item.priceLabel ? (
                          <span className="block text-[0.65rem] font-medium text-[#128c7e]">
                            💲 {item.priceLabel}
                          </span>
                        ) : null}
                        {item.stockLabel ? (
                          <span className="block text-[0.65rem] text-[#667781]">
                            📦 {item.stockLabel}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      {showVerMas ? (
        <button
          type="button"
          onClick={handleVerMas}
          className={cn(
            'inline-flex min-h-8 w-full items-center justify-center rounded-lg border border-[#d1d7db] bg-white px-3 py-1.5 text-xs font-semibold text-[#075e54] shadow-sm',
            'transition-colors hover:border-[#075e54]/35 hover:bg-[#f0faf8]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54]',
          )}
        >
          Ver más
          {hasMoreInPayload
            ? ` (${Math.min(HAIBOT_INVENTORY_SEARCH_LIMIT, payload.items.length - visibleCount)} más)`
            : ` en tienda (${payload.total - visibleItems.length})`}
        </button>
      ) : (
        <p className="text-[0.7rem] text-[#667781]">
          Escribe otro modelo o código para seguir consultando.
        </p>
      )}
    </div>
  );
}
