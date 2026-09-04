import { useLayoutEffect, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { ProductDetailView } from '@/components/product-detail/product-detail-view';
import { useSeo } from '@/hooks/use-seo';
import { useProduct } from '@/hooks/use-product';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { buildProductBreadcrumbs } from '@/lib/build-product-breadcrumbs';
import { buildProductSeoConfig } from '@/lib/build-product-seo';
import { productCanonicalSlug, productPath } from '@/lib/product-path';
import { recordProductView } from '@/lib/product-views';

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const id = rawSlug ? decodeURIComponent(rawSlug) : undefined;
  const { product, featuredMeta, isLoading, notFound } = useProduct(id);
  const { data: categoryTree = [] } = useStoreCategoriesTree();

  const breadcrumbs = useMemo(() => {
    if (!product) return [];
    return buildProductBreadcrumbs(product, product.name, categoryTree);
  }, [product, categoryTree]);

  const seoConfig = useMemo(() => {
    if (product) return buildProductSeoConfig(product, breadcrumbs, { featuredMeta });
    return null;
  }, [product, breadcrumbs, featuredMeta]);

  useSeo(seoConfig);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  useLayoutEffect(() => {
    if (!product?.id) return;
    void recordProductView(product.id);
  }, [product?.id]);

  useLayoutEffect(() => {
    if (!product || !id) return;
    const canonicalSlug = productCanonicalSlug(product);
    if (id.toLowerCase() !== canonicalSlug.toLowerCase()) {
      navigate(productPath(product), { replace: true });
    }
  }, [product, id, navigate]);

  if (isLoading) {
    return (
      <div className="container py-8" role="status" aria-live="polite">
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="aspect-square animate-pulse rounded-xl bg-muted lg:col-span-1" />
          <div className="space-y-4 lg:col-span-1">
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-muted lg:col-span-1" />
        </div>
        <span className="sr-only">Cargando producto…</span>
      </div>
    );
  }

  if (notFound || !product) {
    return <Navigate to="/tienda" replace />;
  }

  return <ProductDetailView product={product} featuredMeta={featuredMeta} />;
}
