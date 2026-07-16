import { resolveHeroBulletIcon } from '@/lib/product-storefront-detail';
import { cn } from '@/lib/utils';
import type { ProductHeroSpecBullet } from '@/types/product-detail';

interface ProductDetailHeroSpecsProps {
  bullets: ProductHeroSpecBullet[];
  className?: string;
}

function splitBulletCopy(bullet: ProductHeroSpecBullet): { label: string; description: string } | null {
  if (bullet.label && bullet.value) {
    return { label: bullet.label, description: bullet.value };
  }

  if (bullet.parts?.length) {
    const label = bullet.parts.map((part) => `${part.label}:`).join(' ');
    const description = bullet.parts.map((part) => part.value).join(' · ');
    return { label, description };
  }

  const text = bullet.text?.trim();
  if (!text) return null;

  const colonIndex = text.indexOf(':');
  if (colonIndex > 0) {
    return {
      label: text.slice(0, colonIndex).trim(),
      description: text.slice(colonIndex + 1).trim(),
    };
  }

  return { label: text, description: '' };
}

function renderSpecItem(bullet: ProductHeroSpecBullet, index: number) {
  const key =
    bullet.parts?.map((part) => part.label).join('-') ??
    bullet.label ??
    bullet.text ??
    `spec-${index}`;
  const IconComponent = resolveHeroBulletIcon(bullet);
  const copy = splitBulletCopy(bullet);

  if (!copy) return null;

  return (
    <li key={key} className="flex flex-row items-center gap-2">
      <IconComponent
        className="size-3.5 shrink-0 text-red-600"
        strokeWidth={2}
        aria-hidden="true"
      />
      <p className="min-w-0 text-pretty text-[13px] leading-snug">
        <span className="text-[#0f1f3d]">{copy.label}:</span>
        {copy.description ? (
          <>
            {' '}
            <span className="text-xs text-neutral-500">{copy.description}</span>
          </>
        ) : null}
      </p>
    </li>
  );
}

export function ProductDetailHeroSpecs({ bullets, className }: ProductDetailHeroSpecsProps) {
  if (bullets.length === 0) return null;

  return (
    <section
      className={cn('rounded-lg bg-white', className)}
      aria-label="Características destacadas"
    >
      <ul className="flex flex-col gap-1">
        {bullets.map((bullet, index) => renderSpecItem(bullet, index))}
      </ul>
    </section>
  );
}
