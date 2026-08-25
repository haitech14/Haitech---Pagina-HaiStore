import { useState } from 'react';
import { Heart } from 'lucide-react';

import { formatQtcPen, QTC, type QtcProductCardData } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

export function QtcProductCard({
  product,
  className,
}: {
  product: QtcProductCardData;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <article
      className={cn(
        'flex h-[360px] w-full flex-col rounded-[15px] border bg-white p-3.5',
        className,
      )}
      style={{ borderColor: QTC.cardBorder }}
    >
      <div className="flex h-[150px] w-full shrink-0 items-center justify-center overflow-hidden bg-white">
        {!imgError ? (
          <img
            src={product.image}
            alt=""
            width={200}
            height={150}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex size-full items-center justify-center rounded-lg text-sm font-bold text-[#999]"
            style={{ backgroundColor: '#F0F0F0' }}
            aria-hidden="true"
          >
            {product.name.slice(0, 1)}
          </div>
        )}
      </div>

      <h3
        className="mt-2 line-clamp-2 min-h-[2.4em] text-[13px] font-medium leading-snug sm:text-[14px]"
        style={{ color: QTC.text }}
        title={product.name}
      >
        {product.name}
      </h3>

      {product.colorSwatch ? (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="size-3.5 shrink-0 rounded-full border border-black/10"
            style={{ backgroundColor: product.colorSwatch }}
            title={product.colorLabel || 'Color'}
            aria-hidden="true"
          />
          {product.colorLabel ? (
            <span className="text-[11px]" style={{ color: QTC.textMuted }}>
              {product.colorLabel}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="mt-2 h-3.5" />
      )}

      <div className="mt-2 flex items-baseline gap-2">
        {product.compareAt != null ? (
          <span className="text-[12px] text-[#B0B0B0] line-through">
            {formatQtcPen(product.compareAt)}
          </span>
        ) : null}
        {product.discountLabel ? (
          <span
            className="text-[11px] font-semibold"
            style={{ color: QTC.discountRed }}
          >
            {product.discountLabel}
          </span>
        ) : null}
      </div>

      <p className="mt-0.5 text-[18px] font-bold leading-tight text-black">
        {formatQtcPen(product.price)}
      </p>

      {product.promoTag ? (
        <span
          className="mt-2 inline-flex w-fit max-w-full truncate rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: QTC.promoGreenBg, color: QTC.promoGreenText }}
        >
          {product.promoTag}
        </span>
      ) : (
        <span className="mt-2 h-[18px]" aria-hidden="true" />
      )}

      <div className="mt-auto flex items-center gap-2 pt-3">
        <button
          type="button"
          className="inline-flex h-[35px] w-[110px] shrink-0 items-center justify-center rounded-lg bg-black text-[11px] font-semibold leading-none text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
        >
          Añadir al carrito
        </button>
        <button
          type="button"
          aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          aria-pressed={liked}
          onClick={() => setLiked((v) => !v)}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#9A9A9A] transition-colors hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <Heart
            className="size-5"
            strokeWidth={1.75}
            fill={liked ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
}
