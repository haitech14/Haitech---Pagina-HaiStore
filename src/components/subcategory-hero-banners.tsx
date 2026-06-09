import { SubcategoryTabs } from '@/components/subcategory-tabs';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';
import type { ResolvedCategoryHero } from '@/data/category-hero';

interface SubcategoryHeroBannersProps {
  parentName: string;
  parentSlug: string;
  parentTagline: string;
  parentImage?: string | null;
  parentHero?: ResolvedCategoryHero;
  subcategories: StoreCategoryTreeNode[];
  activeSubSlug: string | null;
  products?: Product[];
  onSelectSub: (subSlug: string | null) => void;
}

export function SubcategoryHeroBanners({
  parentName,
  subcategories,
  activeSubSlug,
  onSelectSub,
}: SubcategoryHeroBannersProps) {
  return (
    <SubcategoryTabs
      subcategories={subcategories}
      activeSubSlug={activeSubSlug}
      onSelect={onSelectSub}
      verTodoLabel={`Todo ${parentName}`}
    />
  );
}
