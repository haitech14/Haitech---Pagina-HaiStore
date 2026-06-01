export const CATEGORY_HERO_ID = 'categoria-hero';

export function categoryPath(slug: string, subSlug?: string | null): string {
  const base = `/categoria/${slug}`;
  if (subSlug) return `${base}?sub=${encodeURIComponent(subSlug)}`;
  return `${base}#${CATEGORY_HERO_ID}`;
}

export function scrollToCategoryHero(behavior: ScrollBehavior = 'smooth') {
  const target = document.getElementById(CATEGORY_HERO_ID);
  if (!target) return;
  target.scrollIntoView({ behavior, block: 'start' });
}
