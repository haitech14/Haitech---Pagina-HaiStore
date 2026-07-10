import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  buildAdminInventoryHoverPreviewCandidates,
  withProductImageCacheBust,
} from '@/lib/admin-inventory-product-image';
import type { InventoryProduct } from '@/types/product';

const PREVIEW_SIZE = 280;
const GAP = 12;
const VIEWPORT_PAD = 8;

function computePreviewPosition(anchor: DOMRect): { top: number; left: number } {
  const maxLeft = window.innerWidth - PREVIEW_SIZE - VIEWPORT_PAD;
  const maxTop = window.innerHeight - PREVIEW_SIZE - VIEWPORT_PAD;

  // Prefer right of thumb, vertically centered.
  let left = anchor.right + GAP;
  let top = anchor.top + anchor.height / 2 - PREVIEW_SIZE / 2;

  if (left > maxLeft) {
    // Try left of thumb.
    left = anchor.left - GAP - PREVIEW_SIZE;
  }

  if (left < VIEWPORT_PAD) {
    // Fall back above (or below if no room).
    left = Math.min(
      Math.max(VIEWPORT_PAD, anchor.left + anchor.width / 2 - PREVIEW_SIZE / 2),
      maxLeft,
    );
    top = anchor.top - GAP - PREVIEW_SIZE;
    if (top < VIEWPORT_PAD) {
      top = anchor.bottom + GAP;
    }
  }

  return {
    left: Math.min(Math.max(VIEWPORT_PAD, left), maxLeft),
    top: Math.min(Math.max(VIEWPORT_PAD, top), maxTop),
  };
}

interface AdminInventoryProductThumbHoverPreviewProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  product: InventoryProduct;
  optimisticSrc?: string | null;
  productName: string;
}

export function AdminInventoryProductThumbHoverPreview({
  open,
  anchorEl,
  product,
  optimisticSrc = null,
  productName,
}: AdminInventoryProductThumbHoverPreviewProps) {
  const candidates = useMemo(
    () => buildAdminInventoryHoverPreviewCandidates(product, optimisticSrc),
    [optimisticSrc, product.gallery, product.image_url],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const rawSrc = candidates[candidateIndex] ?? null;
  const displaySrc = rawSrc
    ? withProductImageCacheBust(rawSrc, product.updated_at)
    : null;

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  useEffect(() => {
    if (!open || !anchorEl || candidates.length === 0) {
      setPosition(null);
      return;
    }

    const update = () => {
      setPosition(computePreviewPosition(anchorEl.getBoundingClientRect()));
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorEl, candidates.length, open]);

  if (!open || !position || !displaySrc || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      aria-hidden="true"
      className="pointer-events-none fixed z-[200] overflow-hidden rounded-lg border border-border/80 bg-background shadow-xl animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        top: position.top,
        left: position.left,
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
      }}
    >
      <img
        key={`${displaySrc}-${candidateIndex}`}
        src={displaySrc}
        alt={productName}
        className="size-full object-contain bg-muted/40"
        decoding="async"
        onError={() => {
          if (candidateIndex + 1 < candidates.length) {
            setCandidateIndex((current) => current + 1);
          }
        }}
      />
    </div>,
    document.body,
  );
}
