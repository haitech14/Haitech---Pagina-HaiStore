import { HomeCategoryBestsellersCarousel } from '@/components/home/home-category-bestsellers-carousel';
import { HomeCategorySpotlightSection } from '@/components/home/home-category-spotlight-section';
import { HOME_CATEGORY_SPOTLIGHTS } from '@/data/home-category-spotlights';
import { cn } from '@/lib/utils';

export function HomeCategorySpotlightsBlock({ className }: { className?: string }) {
  return (
    <div className={cn('home-landing-sans', className)}>
      {HOME_CATEGORY_SPOTLIGHTS.map((config) => (
        <div key={config.id}>
          <HomeCategorySpotlightSection config={config} />
          <HomeCategoryBestsellersCarousel config={config} />
        </div>
      ))}
    </div>
  );
}
