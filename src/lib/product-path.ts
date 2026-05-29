/** Ruta canónica de ficha de producto en la tienda. */
export function productPath(id: string): string {
  return `/tienda/producto/${encodeURIComponent(id)}`;
}
