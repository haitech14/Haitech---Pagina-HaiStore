/** Lista separada por comas (categoría / marca en inventario). */
export function parseInventoryTagList(value) {
  if (value == null || typeof value !== 'string' || !value.trim()) return [];
  return [
    ...new Set(
      value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  ];
}

export function joinInventoryTagList(values) {
  const unique = [...new Set(values.map((part) => String(part).trim()).filter(Boolean))];
  return unique.join(', ');
}
