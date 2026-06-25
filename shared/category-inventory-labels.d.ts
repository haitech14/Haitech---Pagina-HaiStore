export function catalogFamilyForSlug(slug: string): string | null;
export function applyEquipmentSubcategorySlugFilter<T>(
  products: readonly T[],
  subSlug: string | null | undefined,
): T[];

