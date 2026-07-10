import { Cloud, Leaf, Smartphone } from 'lucide-react';

import { cn } from '@/lib/utils';
import type {
  ProductDescriptionStoryBlock,
  ProductDescriptionStoryCta,
} from '@/types/product-detail';

interface ProductDetailDescriptionStoryProps {
  blocks: ProductDescriptionStoryBlock[];
  cta?: ProductDescriptionStoryCta;
  className?: string;
}

function StoryVisual({ block }: { block: ProductDescriptionStoryBlock }) {
  if (block.visual === 'smartphone-cloud') {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-[#e85d04] sm:aspect-[5/4]"
        role="img"
        aria-label={block.imageAlt ?? block.title}
      >
        <div className="flex size-28 items-center justify-center rounded-2xl border-2 border-white/90 bg-white/10 sm:size-32">
          <div className="relative text-white">
            <Smartphone className="size-14 sm:size-16" strokeWidth={1.5} aria-hidden="true" />
            <Cloud
              className="absolute -right-2 -top-1 size-6 text-white sm:size-7"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    );
  }

  if (block.visual === 'sustainability') {
    return (
      <div
        className="relative flex aspect-[4/3] w-full items-end overflow-hidden rounded-xl bg-gradient-to-br from-sky-300 via-emerald-200 to-lime-200 sm:aspect-[5/4]"
        role="img"
        aria-label={block.imageAlt ?? block.title}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_45%)]" />
        <div className="relative m-4 flex items-center gap-2 rounded-lg bg-white/85 px-3 py-2 text-emerald-800 shadow-sm backdrop-blur-sm">
          <Leaf className="size-5 shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold sm:text-sm">ENERGY STAR® · EPEAT® Silver</span>
        </div>
      </div>
    );
  }

  if (!block.imageSrc) return null;

  return (
    <div className="overflow-hidden rounded-xl bg-neutral-100">
      <img
        src={block.imageSrc}
        alt={block.imageAlt ?? ''}
        className="aspect-[4/3] w-full object-cover sm:aspect-[5/4]"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function StoryBlockCard({ block }: { block: ProductDescriptionStoryBlock }) {
  const imageFirst = block.imagePosition === 'start';

  const text = (
    <div className="min-w-0 space-y-2">
      <h3 className="text-balance text-base font-bold leading-snug text-[#0f1f3d] sm:text-lg">
        {block.title}
      </h3>
      <p className="text-xs leading-relaxed text-neutral-600 sm:text-[0.8125rem] sm:leading-relaxed">
        {block.body}
      </p>
      {block.footnote ? (
        <p className="text-[0.625rem] leading-snug text-neutral-500 sm:text-[0.6875rem]">{block.footnote}</p>
      ) : null}
    </div>
  );

  const media = <StoryVisual block={block} />;

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
      <div className="grid items-center gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-5">
        {imageFirst ? (
          <>
            <div className="order-2 lg:order-1">{media}</div>
            <div className="order-1 lg:order-2">{text}</div>
          </>
        ) : (
          <>
            <div>{text}</div>
            <div>{media}</div>
          </>
        )}
      </div>
    </article>
  );
}

export function ProductDetailDescriptionStory({
  blocks,
  cta,
  className,
}: ProductDetailDescriptionStoryProps) {
  if (blocks.length === 0) return null;

  return (
    <div className={cn('space-y-4 sm:space-y-5', className)}>
      {blocks.map((block) => (
        <StoryBlockCard key={block.id} block={block} />
      ))}

      {cta ? (
        <aside className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 sm:px-5 sm:py-5">
          <h3 className="text-base font-bold text-[#0f1f3d] sm:text-lg">{cta.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 sm:text-[0.8125rem]">
            {cta.body}
          </p>
        </aside>
      ) : null}
    </div>
  );
}
