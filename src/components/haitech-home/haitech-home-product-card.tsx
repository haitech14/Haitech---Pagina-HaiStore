import { useState } from 'react';
import {
  BadgeCheck,
  Copy,
  Droplets,
  Flame,
  Gauge,
  Printer,
  ScanLine,
  ShoppingCart,
} from 'lucide-react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Link } from 'react-router-dom';

import { useCart } from '@/context/cart-context';
import {
  formatHaitechPen,
  HAITECH_SHOP,
  HAITECH_SHOP_EQUIPMENT_FEATURES,
  type HaitechShopFeatureId,
  type HaitechShopProduct,
} from '@/data/haitech-home-shop';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { penToUsd, cn } from '@/lib/utils';
import type { Product } from '@/types/product';

function EquipmentFeatureIcon({
  featureId,
  className,
}: {
  featureId: HaitechShopFeatureId;
  className?: string;
}) {
  const props = { className, strokeWidth: 1.6 as const, 'aria-hidden': true as const };
  switch (featureId) {
    case 'copia':
      return <Copy {...props} />;
    case 'escanea':
      return <ScanLine {...props} />;
    case 'imprime':
      return <Printer {...props} />;
    case 'rendimiento':
      return <Gauge {...props} />;
    default:
      return <Copy {...props} />;
  }
}

function resolveEquipmentFeatureValue(
  featureId: HaitechShopFeatureId,
  equipment: HaitechShopProduct['equipment'],
): string | null {
  if (!equipment) return null;
  if (featureId === 'escanea') return equipment.scannerType ?? null;
  if (featureId === 'imprime') return equipment.speedPpm ?? null;
  if (featureId === 'rendimiento') return equipment.monthlyYield ?? null;
  return null;
}

function toCartProduct(product: HaitechShopProduct): Product {
  const priceUsd = Math.round(penToUsd(product.price) * 100) / 100;
  return {
    id: product.id,
    name: product.name,
    description: product.name,
    price: priceUsd,
    currency: 'USD',
    image_url: product.image,
    stock: 1,
    category: 'Equipos',
    brand: product.brand ?? 'RICOH',
    created_at: new Date().toISOString(),
  };
}

function formatHaitechUsd(usd: number): string {
  return `US$ ${usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildProductPurchaseWhatsAppMessage(product: HaitechShopProduct, priceUsd: number): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://haitech.pe';
  const productUrl = product.href ? `${origin}${product.href}` : origin;
  const lines = [
    '¡Hola HAITECH! 👋',
    '',
    'Quiero *comprar* este producto:',
    '',
    `*${product.name}*`,
    `Precio: *${formatHaitechPen(product.price)}* · *${formatHaitechUsd(priceUsd)}*`,
  ];

  if (product.discountLabel) {
    lines.push(`Descuento: ${product.discountLabel}`);
  }

  if (product.toner) {
    lines.push(
      `Tipo: *${product.toner.original ? 'Original' : 'Compatible'}*`,
      `Rendimiento: *${product.toner.yieldLabel}*`,
      `Color: *${product.toner.colorLabel}*`,
    );
  }

  lines.push('', `Link: ${productUrl}`, '', '¿Me ayudan a cerrar la compra por WhatsApp? ¡Gracias!');

  return lines.join('\n');
}

/** Card de producto — layout mockup HAITECH (badge, features, precio rojo, WhatsApp). */
export function HaitechHomeProductCard({
  product,
  className,
}: {
  product: HaitechShopProduct;
  className?: string;
}) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const usdApprox = penToUsd(product.price);
  const whatsappHref = buildHaitechWhatsAppUrl(
    buildProductPurchaseWhatsAppMessage(product, usdApprox),
  );
  const brand = product.brand ?? 'RICOH';
  const features = product.features?.length
    ? HAITECH_SHOP_EQUIPMENT_FEATURES.filter((f) => product.features?.includes(f.id))
    : [];

  return (
    <article
      className={cn(
        'group/card relative flex h-full min-h-[420px] w-full flex-col rounded-2xl border bg-white p-3.5',
        'shadow-[0_8px_24px_rgba(15,31,61,0.08)] transition-shadow duration-300 hover:shadow-[0_12px_28px_rgba(15,31,61,0.12)]',
        'sm:min-h-[460px] sm:p-4',
        className,
      )}
      style={{ borderColor: HAITECH_SHOP.cardBorder }}
    >
      {(product.condition === 'nuevo' ||
        product.condition === 'seminuevo' ||
        product.badge) && (
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5 sm:left-3.5 sm:top-3.5">
          {product.condition === 'nuevo' || product.condition === 'seminuevo' ? (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white sm:text-[10px]',
                product.condition === 'nuevo' ? 'bg-[#111]' : 'bg-[#555]',
              )}
            >
              {product.condition === 'nuevo' ? 'Nuevo' : 'Seminuevo'}
            </span>
          ) : null}
          {product.badge ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white sm:text-[10px]"
              style={{ backgroundColor: HAITECH_SHOP.brand }}
            >
              <Flame className="size-3 fill-white" strokeWidth={0} aria-hidden="true" />
              {product.badge}
            </span>
          ) : null}
        </div>
      )}

      {product.href ? (
        <Link
          to={product.href}
          className="flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/30"
        >
          <CardMedia product={product} imgError={imgError} onImgError={() => setImgError(true)} />
          <CardInfo product={product} brand={brand} features={features} usdApprox={usdApprox} />
        </Link>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <CardMedia product={product} imgError={imgError} onImgError={() => setImgError(true)} />
          <CardInfo product={product} brand={brand} features={features} usdApprox={usdApprox} />
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-3">
        <button
          type="button"
          onClick={() => addItem(toCartProduct(product), { openDrawer: true })}
          className={cn(
            'inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3',
            'text-[12px] font-bold text-white sm:text-[13px]',
            'transition-colors hover:bg-[#c90511]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
          )}
          style={{ backgroundColor: HAITECH_SHOP.brand }}
        >
          <ShoppingCart className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="truncate">Añadir al carrito</span>
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          title="Comprar por Whatsapp"
          aria-label="Comprar por Whatsapp"
          className={cn(
            'group relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl',
            'border border-[#E8E8E8] bg-[#F7F7F7] text-[#25D366]',
            'transition-colors hover:border-[#25D366]/40 hover:bg-[#25D366]/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40',
          )}
        >
          <Icon path={mdiWhatsapp} size={0.95} aria-hidden="true" />
          <span
            className={cn(
              'pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2',
              'whitespace-nowrap rounded-md bg-[#111] px-2 py-1 text-[10px] font-medium text-white',
              'opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
            )}
            role="tooltip"
          >
            Comprar por Whatsapp
          </span>
        </a>
      </div>
    </article>
  );
}

function CardMedia({
  product,
  imgError,
  onImgError,
}: {
  product: HaitechShopProduct;
  imgError: boolean;
  onImgError: () => void;
}) {
  return (
    <div className="relative mt-1 flex h-[148px] w-full shrink-0 items-center justify-center overflow-hidden sm:h-[168px]">
      {!imgError ? (
        <img
          src={product.image}
          alt=""
          width={220}
          height={168}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/card:scale-105"
          loading="lazy"
          decoding="async"
          onError={onImgError}
        />
      ) : (
        <div
          className="flex size-full items-center justify-center rounded-lg bg-[#F0F0F0] text-sm font-bold text-[#999]"
          aria-hidden="true"
        >
          {product.name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}

function CardInfo({
  product,
  brand,
  features,
  usdApprox,
}: {
  product: HaitechShopProduct;
  brand: string;
  features: typeof HAITECH_SHOP_EQUIPMENT_FEATURES;
  usdApprox: number;
}) {
  return (
    <div className="mt-2 flex min-h-0 flex-1 flex-col">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.08em] sm:text-[11px]"
        style={{ color: HAITECH_SHOP.brand }}
      >
        {brand}
      </p>
      <h3
        className="mt-0.5 line-clamp-2 min-h-[2.5em] text-[13px] font-bold leading-snug text-[#111] sm:text-[14px]"
        title={product.name}
      >
        {product.name}
      </h3>

      {features.length > 0 ? (
        <ul className="mt-2.5 grid grid-cols-4 gap-1" aria-label="Funciones del equipo">
          {features.map((feature) => {
            const value = resolveEquipmentFeatureValue(feature.id, product.equipment);
            return (
              <li key={feature.id} className="flex flex-col items-center gap-0.5 text-center">
                <EquipmentFeatureIcon
                  featureId={feature.id}
                  className="size-4 text-[#9A9A9A] sm:size-[18px]"
                />
                {value ? (
                  <span className="text-[9px] font-semibold leading-tight text-[#555] sm:text-[10px]">
                    {value}
                  </span>
                ) : null}
                <span className="text-[8px] font-medium uppercase tracking-wide text-[#9A9A9A] sm:text-[9px]">
                  {feature.label}
                </span>
              </li>
            );
          })}
        </ul>
      ) : product.toner ? (
        <div
          className={cn(
            'mt-2.5 min-h-[52px] grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out',
            'group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100',
            'group-focus-within/card:grid-rows-[1fr] group-focus-within/card:opacity-100',
            'max-md:grid-rows-[1fr] max-md:opacity-100',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <ul
              className="grid grid-cols-3 gap-1.5 rounded-lg bg-[#F7F7F7] px-2 py-2"
              aria-label="Especificaciones de tóner"
            >
              <li className="flex flex-col items-center gap-0.5 text-center">
                <BadgeCheck
                  className="size-4 sm:size-[18px]"
                  style={{ color: product.toner.original ? HAITECH_SHOP.brand : '#9A9A9A' }}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-[9px] font-semibold leading-tight text-[#555] sm:text-[10px]">
                  {product.toner.original ? 'Original' : 'Compatible'}
                </span>
              </li>
              <li className="flex flex-col items-center gap-0.5 text-center">
                <Gauge className="size-4 text-[#9A9A9A] sm:size-[18px]" strokeWidth={1.6} aria-hidden="true" />
                <span className="text-[9px] font-medium leading-tight text-[#555] sm:text-[10px]">
                  {product.toner.yieldLabel}
                </span>
                <span className="text-[8px] uppercase tracking-wide text-[#9A9A9A]">Rendimiento</span>
              </li>
              <li className="flex flex-col items-center gap-0.5 text-center">
                <span className="relative flex size-4 items-center justify-center sm:size-[18px]">
                  <Droplets className="size-full text-[#9A9A9A]" strokeWidth={1.6} aria-hidden="true" />
                  {product.colorSwatch ? (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-white"
                      style={{ backgroundColor: product.colorSwatch }}
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
                <span className="text-[9px] font-medium leading-tight text-[#555] sm:text-[10px]">
                  {product.toner.colorLabel}
                </span>
                <span className="text-[8px] uppercase tracking-wide text-[#9A9A9A]">Color</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-2.5 h-[34px]" aria-hidden="true" />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {product.compareAt != null ? (
          <span className="font-price text-[10px] tabular-nums tracking-wide text-[#A0A0A0] line-through sm:text-[11px]">
            {formatHaitechPen(product.compareAt)}
          </span>
        ) : null}
        {product.discountLabel ? (
          <span
            className="inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-semibold tracking-wide text-white sm:text-[9px]"
            style={{ backgroundColor: HAITECH_SHOP.brand }}
          >
            {product.discountLabel}
          </span>
        ) : null}
      </div>

      <p
        className="mt-1.5 font-price text-[17px] font-semibold leading-none tracking-tight tabular-nums sm:text-[18px]"
        style={{ color: HAITECH_SHOP.brand }}
      >
        <span className="mr-1 text-[0.78em] font-semibold tracking-normal opacity-90">S/</span>
        {product.price.toLocaleString('es-PE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      {usdApprox > 0 ? (
        <p className="mt-1 font-price text-[11px] font-medium tracking-normal tabular-nums text-[#8A8A8A] sm:text-[12px]">
          {formatHaitechUsd(usdApprox)}
        </p>
      ) : null}
    </div>
  );
}
