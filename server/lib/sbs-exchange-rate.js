/**
 * Tipo de cambio oficial USD/PEN (SBS vía publicación SUNAT).
 * SUNAT publica el cierre SBS del día hábil anterior.
 */

const SUNAT_TC_URL = 'https://api.apis.net.pe/v1/tipo-cambio-sunat';

function normalizeRate(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 10000) / 10000;
}

/**
 * @returns {Promise<{ compra: number, venta: number, fecha: string | null, origen: string }>}
 */
export async function fetchSbsUsdToPenRates() {
  const response = await fetch(SUNAT_TC_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`No se pudo consultar el tipo de cambio SBS/SUNAT (${response.status}).`);
  }

  const data = await response.json();
  const compra = normalizeRate(data?.compra);
  const venta = normalizeRate(data?.venta);

  if (compra == null || venta == null) {
    throw new Error('Respuesta inválida del tipo de cambio SBS/SUNAT.');
  }

  return {
    compra,
    venta,
    fecha: data?.fecha ? String(data.fecha) : null,
    origen: String(data?.origen ?? 'SBS/SUNAT'),
  };
}
