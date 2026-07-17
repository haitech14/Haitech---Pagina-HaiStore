import {
  HOME_STOREFRONT_TRUST_ITEMS,
  STOREFRONT_BLUE,
  STOREFRONT_TRUST_BG,
} from '@/data/home-storefront-mockup';

export function HomeStorefrontTrustBar() {
  return (
    <section aria-label="Ventajas HaiStore" style={{ backgroundColor: STOREFRONT_TRUST_BG }}>
      <div className="container py-5 sm:py-6">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5" role="list">
          {HOME_STOREFRONT_TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center"
                  aria-hidden="true"
                >
                  <Icon className="size-6" style={{ color: STOREFRONT_BLUE }} strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-snug text-[#111111]">{item.title}</p>
                  <p className="mt-0.5 text-pretty text-xs leading-snug text-[#6B7280]">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
