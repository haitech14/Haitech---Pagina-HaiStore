import * as XLSX from 'xlsx';

import { PRICE_ROLE_LABELS, PRICE_ROLES_EDIT_ORDER, ensureFullPrices } from '@/lib/roles';
import type { InventoryProduct } from '@/types/product';

function formatAttributes(product: InventoryProduct): string {
  return (product.attributes ?? [])
    .map((attribute) => `${attribute.name}: ${attribute.value}`)
    .join('; ');
}

function formatSuppliers(product: InventoryProduct): string {
  return (product.suppliers ?? [])
    .map((supplier) => {
      const name = supplier.name?.trim() ?? '';
      const price = Number.isFinite(supplier.purchase_price_usd)
        ? ` USD ${supplier.purchase_price_usd}`
        : '';
      return name ? `${name}${price}` : '';
    })
    .filter(Boolean)
    .join(' | ');
}

function productToRow(product: InventoryProduct): Record<string, string | number> {
  const prices = ensureFullPrices(product.prices);
  const row: Record<string, string | number> = {
    ID: product.id,
    Código: product.code ?? '',
    Título: product.name,
    Marca: product.brand ?? '',
    Categoría: product.category ?? '',
    Stock: product.stock ?? 0,
    'Precio compra (USD)': product.purchase_price_usd ?? 0,
    Moneda: product.currency ?? 'USD',
    Destacado: product.is_featured ? 'Sí' : 'No',
    Visitas: product.view_count ?? 0,
    'Orden vitrina': product.sort_order ?? 0,
    'URL imagen': product.image_url ?? '',
    Atributos: formatAttributes(product),
    Proveedores: formatSuppliers(product),
  };

  for (const role of PRICE_ROLES_EDIT_ORDER) {
    row[`Precio ${PRICE_ROLE_LABELS[role]} (USD)`] = prices[role] ?? 0;
  }

  return row;
}

export function exportInventoryProductsToExcel(
  products: InventoryProduct[],
  filenamePrefix = 'productos-inventario',
): boolean {
  if (products.length === 0) return false;

  const worksheet = XLSX.utils.json_to_sheet(products.map(productToRow));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}-${date}.xlsx`);
  return true;
}
