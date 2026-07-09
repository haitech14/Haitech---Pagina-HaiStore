import { HomeCategoryShowcaseSection } from '@/components/home/home-category-showcase-section';
import { HOME_CONSUMIBLES_SHOWCASE } from '@/data/home-consumibles';

export function HomeConsumiblesSection() {
  return <HomeCategoryShowcaseSection config={HOME_CONSUMIBLES_SHOWCASE} />;
}
