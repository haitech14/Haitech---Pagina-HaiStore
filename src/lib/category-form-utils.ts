export function slugifyCategory(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function categoryImageFromSlug(slug: string): string {
  const normalized = slugifyCategory(slug);
  if (!normalized) return '';
  return `/categories/${normalized}.png`;
}

export function categoryFieldsFromName(name: string) {
  const trimmed = name.trim();
  const slug = slugifyCategory(trimmed);

  return {
    slug,
    inventoryLabels: trimmed,
    tagline: trimmed,
    image: categoryImageFromSlug(slug),
  };
}
