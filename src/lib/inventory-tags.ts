/** Lista separada por comas guardada en inventario (categoría / marca). */
export function parseInventoryTagList(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return [
    ...new Set(
      value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  ];
}

export function joinInventoryTagList(values: readonly string[]): string {
  const unique = [...new Set(values.map((part) => part.trim()).filter(Boolean))];
  return unique.join(', ');
}
