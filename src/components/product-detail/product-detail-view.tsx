import { useState } from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ProductDetailAttributeBadges } from '@/components/product-detail/product-detail-attribute-badges';
import { ProductDetailCombo } from '@/components/product-detail/product-detail-combo';
import { ProductDetailDescription } from '@/components/product-detail/product-detail-description';
import { ProductDetailFeatures } from '@/components/product-detail/product-detail-features';
import { ProductDetailGallery } from '@/components/product-detail/product-detail-gallery';
import { ProductDetailPurchaseBox } from '@/components/product-detail/product-detail-purchase-box';
import { ProductDetailRentalOption } from '@/components/product-detail/product-detail-rental-option';
import { ProductDetailResources } from '@/components/product-detail/product-detail-resources';
import { buildProductDetail } from '@/lib/build-product-detail';
import { cn } from '@/lib/utils';
import type { FeaturedProduct } from '@/data/featured-products';
import type { ProductSpecRow } from '@/types/product-detail';
import type { Product } from '@/types/product';

type DetailTab = 'description' | 'specs' | 'warranty' | 'consumables';

interface ProductDetailViewProps {
  product: Product;
  featuredMeta?: FeaturedProduct | undefined;
}

function SpecList({ specs }: { specs: ProductSpecRow[] }) {
  return (
    <ul className="space-y-2.5 text-sm text-neutral-600">
      {specs.map((row) => (
        <li key={row.label} className="flex gap-2.5">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
          <span>
            <span className="font-medium text-neutral-800">{row.label}:</span> {row.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <ul className="space-y-2.5 text-sm text-neutral-600">
      {bullets.map((bullet) => (
        <li key={bullet} className="flex gap-2.5">
          <span
            className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-600 text-[0.6rem] font-bold text-white"
            aria-hidden="true"
          >
            ✓
          </span>
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProductDetailView({ product, featuredMeta }: ProductDetailViewProps) {
  const detail = buildProductDetail(product, featuredMeta);
  const [activeTab, setActiveTab] = useState<DetailTab>('description');

  const tabs = [
    { id: 'description' as const, label: 'Descripción' },
    { id: 'specs' as const, label: 'Especificaciones' },
    { id: 'warranty' as const, label: 'Garantía' },
    { id: 'consumables' as const, label: 'Toner y Consumibles' },
  ];

  return (
    <div className="container py-4 sm:py-6">
      <nav aria-label="Migas de pan" className="mb-4 text-xs text-neutral-400 sm:text-sm">
        <ol className="flex flex-wrap items-center gap-1.5">
          {detail.breadcrumbs.map((crumb, index) => (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-neutral-300" aria-hidden="true">
                  &gt;
                </span>
              )}
              {index === 0 ? (
                crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="inline-flex items-center gap-1 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    <Home className="size-3.5" aria-hidden="true" />
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Home className="size-3.5" aria-hidden="true" />
                    {crumb.label}
                  </span>
                )
              ) : crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="line-clamp-1 max-w-[min(100%,28rem)] text-neutral-600">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="rounded-2xl bg-white p-4 sm:p-6 lg:p-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,520px)_1fr_minmax(0,300px)] lg:gap-6 xl:grid-cols-[minmax(0,580px)_1fr_minmax(0,320px)]">
          <div className="flex flex-col gap-3">
            <ProductDetailGallery items={detail.gallery} productName={product.name} />
            <ProductDetailFeatures features={detail.features} />
          </div>

          <div className="flex flex-col gap-4">
            {detail.isOnOffer && (
              <span className="inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                Oferta especial
              </span>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <h1 className="text-xl font-bold leading-tight text-neutral-900 sm:text-2xl lg:text-[1.65rem]">
                  {detail.displayTitle}
                </h1>

                <ProductDetailAttributeBadges product={product} />

                <p className="text-xs text-neutral-500">
                  Marca: {detail.brandLabel} | SKU: {detail.sku} | Color: {detail.colorLabel}
                </p>
              </div>

              {detail.bullets.length > 0 && (
                <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 px-3 py-3 sm:px-4">
                  <BulletList bullets={detail.bullets} />
                </div>
              )}
            </div>

            {detail.rentalPlans.length > 0 && (
              <ProductDetailRentalOption plans={detail.rentalPlans} className="w-full sm:max-w-md" />
            )}

            <ProductDetailResources
              links={detail.resourceLinks}
              product={product}
              displayTitle={detail.displayTitle}
              sku={detail.sku}
              brandLabel={detail.brandLabel}
            />
          </div>

          <div className="lg:row-span-2 lg:self-start">
            <ProductDetailPurchaseBox product={product} detail={detail} />
          </div>

        </div>

        <section
          className="mt-8 border-t border-neutral-200 pt-6"
          aria-label="Información del producto"
        >
          <div className="border-b border-neutral-200">
            <div
              role="tablist"
              aria-label="Secciones del producto"
              className="flex gap-4 overflow-x-auto sm:gap-6 lg:gap-8"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'shrink-0 border-b-2 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                    activeTab === tab.id
                      ? 'border-red-600 text-neutral-900'
                      : 'border-transparent text-neutral-400 hover:text-neutral-600',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="pt-5"
          >
            {activeTab === 'description' &&
              (detail.descriptionContent ? (
                <ProductDetailDescription content={detail.descriptionContent} />
              ) : (
                <BulletList bullets={detail.bullets} />
              ))}
            {activeTab === 'specs' && <SpecList specs={detail.specs} />}
            {activeTab === 'warranty' && <BulletList bullets={detail.warrantyBullets} />}
            {activeTab === 'consumables' &&
              (detail.comboItems.length > 0 ? (
                <ProductDetailCombo items={detail.comboItems} mainProduct={product} embedded />
              ) : (
                <p className="text-sm text-neutral-500">
                  No hay toner ni consumibles recomendados para este producto.
                </p>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
