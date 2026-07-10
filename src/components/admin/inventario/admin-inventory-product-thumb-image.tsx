import { useEffect, useMemo, useRef, useState } from 'react';

import {
  buildAdminInventoryImageCandidates,
  withProductImageCacheBust,
} from '@/lib/admin-inventory-product-image';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

interface AdminInventoryProductThumbImageProps {
  product: InventoryProduct;
  optimisticSrc?: string | null;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function AdminInventoryProductThumbImage({
  product,
  optimisticSrc = null,
  className,
  loading = 'eager',
}: AdminInventoryProductThumbImageProps) {
  const candidates = useMemo(
    () => buildAdminInventoryImageCandidates(product, optimisticSrc),
    [optimisticSrc, product.gallery, product.image_url],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const previousSrcRef = useRef<string | null>(null);

  const rawSrc = exhausted ? null : (candidates[candidateIndex] ?? null);
  const displaySrc = rawSrc
    ? withProductImageCacheBust(rawSrc, product.updated_at)
    : null;

  useEffect(() => {
    setCandidateIndex(0);
    setLoaded(false);
    setExhausted(false);
  }, [candidates]);

  const handleLoad = () => {
    if (displaySrc) previousSrcRef.current = displaySrc;
    setLoaded(true);
  };

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((current) => current + 1);
      setLoaded(false);
      return;
    }
    setExhausted(true);
    setLoaded(true);
  };

  if (!displaySrc && !previousSrcRef.current) return null;

  const showSkeleton = Boolean(displaySrc) && !loaded && !previousSrcRef.current;
  const showPrevious = !loaded && Boolean(previousSrcRef.current);

  return (
    <>
      {showSkeleton ? (
        <div
          className="absolute inset-0 animate-pulse bg-muted"
          aria-hidden="true"
        />
      ) : null}
      {showPrevious ? (
        <img
          src={previousSrcRef.current ?? undefined}
          alt=""
          className={cn(
            'absolute inset-0 size-full object-cover object-center',
            className,
          )}
          aria-hidden="true"
        />
      ) : null}
      {displaySrc && !exhausted ? (
        <img
          key={`${displaySrc}-${candidateIndex}`}
          src={displaySrc}
          alt=""
          className={cn(
            'absolute inset-0 size-full object-cover object-center transition-opacity duration-200',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : null}
    </>
  );
}
