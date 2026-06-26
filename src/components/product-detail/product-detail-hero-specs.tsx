import { ProductQuickViewFeaturePills } from '@/components/product/product-quick-view-feature-pills';
import { resolveHeroBulletIcon } from '@/lib/product-storefront-detail';
import { cn } from '@/lib/utils';
import type { ProductDescriptionHighlight, ProductHeroSpecBullet } from '@/types/product-detail';

interface ProductDetailHeroSpecsProps {
  bullets: ProductHeroSpecBullet[];
  pills: ProductDescriptionHighlight[];
  className?: string;
}

function isRegaloBullet(bullet: ProductHeroSpecBullet): boolean {
  const haystack = `${bullet.text ?? ''} ${bullet.label ?? ''}`.toLowerCase();
  return haystack.includes('regalo');
}

function renderSpecBullets(bullets: ProductHeroSpecBullet[]) {
  if (bullets.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2 text-sm leading-snug text-[#0f1f3d]">
      {bullets.map((bullet) => {
        const key =
          bullet.parts?.map((part) => part.label).join('-') ??
          bullet.label ??
          bullet.text ??
          'spec';
        const IconComponent = resolveHeroBulletIcon(bullet);

        if (bullet.parts?.length) {
          return (
            <li key={key} className="flex items-start gap-2">
              <IconComponent
                className="mt-0.5 size-4 shrink-0 text-red-600"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="flex flex-col gap-1">
                {bullet.parts.map((part) => (
                  <span key={part.label}>
                    <span className="font-semibold">{part.label}:</span> {part.value}
                  </span>
                ))}
              </span>
            </li>
          );
        }

        if (bullet.label && bullet.value) {
          return (
            <li key={key} className="flex items-start gap-2">
              <IconComponent
                className="mt-0.5 size-4 shrink-0 text-red-600"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span>
                <span className="font-semibold">{bullet.label}:</span> {bullet.value}
              </span>
            </li>
          );
        }

        return (
          <li key={key} className="flex items-start gap-2">
            <IconComponent
              className="mt-0.5 size-4 shrink-0 text-red-600"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{bullet.text}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ProductDetailHeroSpecs({ bullets, pills, className }: ProductDetailHeroSpecsProps) {
  if (bullets.length === 0 && pills.length === 0) return null;

  const regaloIndex = bullets.findIndex(isRegaloBullet);
  const bulletsBefore = regaloIndex >= 0 ? bullets.slice(0, regaloIndex + 1) : bullets;
  const bulletsAfter = regaloIndex >= 0 ? bullets.slice(regaloIndex + 1) : [];

  return (
    <section
      className={cn('mt-3 space-y-3', className)}
      aria-label="Especificaciones del producto"
    >
      {renderSpecBullets(bulletsBefore)}
      {renderSpecBullets(bulletsAfter)}
      {pills.length > 0 ? <ProductQuickViewFeaturePills items={pills} /> : null}
    </section>
  );
}
