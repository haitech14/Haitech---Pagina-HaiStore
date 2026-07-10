import { roundSalePriceToNinety } from './toner-products-excel.js';

/** Proveedor canónico para listas LP Ricoh Web. */
export const SUPPLIER_RICOH_DEL_PERU = 'Ricoh del Perú';

/**
 * Margen público − compra en el rango [$10, $60] → +$12 a precios de venta.
 * @param {number} publico
 * @param {number} compra
 */
export function shouldBumpSalePricesByMargin(publico, compra) {
  const pub = Number(publico) || 0;
  const buy = Number(compra) || 0;
  if (pub <= 0 || buy <= 0) return false;
  const margin = pub - buy;
  return margin >= 10 && margin <= 60;
}

/**
 * Aplica +$12 a precios de venta (no compra) y re-redondea a .90.
 * @param {{ public?: number; tecnico?: number; mayorista?: number; distribuidor?: number }} prices
 * @param {number} compra
 * @param {{ round?: (n: number) => number }} [options]
 */
export function applyMarginSalePriceBump(prices, compra, options = {}) {
  const round = options.round ?? roundSalePriceToNinety;
  const next = {
    public: Number(prices?.public) || 0,
    tecnico: Number(prices?.tecnico) || 0,
    mayorista: Number(prices?.mayorista) || 0,
    distribuidor: Number(prices?.distribuidor) || 0,
  };

  if (!shouldBumpSalePricesByMargin(next.public, compra)) {
    return {
      prices: {
        public: round(next.public),
        tecnico: round(next.tecnico),
        mayorista: round(next.mayorista),
        distribuidor: round(next.distribuidor > 0 ? next.distribuidor : next.tecnico),
      },
      bumped: false,
    };
  }

  return {
    prices: {
      public: round(next.public + 12),
      tecnico: round(next.tecnico + 12),
      mayorista: round(next.mayorista + 12),
      distribuidor: round((next.distribuidor > 0 ? next.distribuidor : next.tecnico) + 12),
    },
    bumped: true,
  };
}

/**
 * Actualiza el nombre del proveedor principal sin tocar purchase_price_usd.
 * @param {Array<{ name?: string; purchase_price_usd?: number; id?: string }> | undefined} suppliers
 * @param {number} compra
 * @param {string} [supplierName]
 */
export function setPrimarySupplier(suppliers, compra, supplierName = SUPPLIER_RICOH_DEL_PERU) {
  const buy = Math.max(0, Number(compra) || 0);
  const list = Array.isArray(suppliers) ? [...suppliers] : [];
  const ricohLike = /ricoh/i;

  if (list.length === 0) {
    return buy > 0 ? [{ name: supplierName, purchase_price_usd: buy }] : [];
  }

  let replaced = false;
  const next = list.map((row) => {
    if (!replaced && ricohLike.test(String(row?.name ?? ''))) {
      replaced = true;
      return {
        ...row,
        name: supplierName,
        purchase_price_usd:
          buy > 0 ? buy : Math.max(0, Number(row.purchase_price_usd) || 0),
      };
    }
    return row;
  });

  if (!replaced && buy > 0) {
    next.unshift({ name: supplierName, purchase_price_usd: buy });
  } else if (!replaced) {
    next[0] = { ...next[0], name: supplierName };
  }

  return next;
}
