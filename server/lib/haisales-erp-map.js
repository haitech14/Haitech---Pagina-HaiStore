/**
 * Adaptadores ERP HaiSales (`clientes` / `ventas`) → formato espejo HaiStore.
 */

/**
 * @param {Record<string, unknown>} row
 * @returns {Record<string, string> | null}
 */
export function mapErpClienteToPersonaRow(row) {
  const ruc = String(row.ruc ?? row.numero_documento ?? '').trim();
  const id = String(row.id ?? '').trim();
  const numeroDocumento = ruc || id;
  if (!numeroDocumento) return null;

  const digits = ruc.replace(/\D/g, '');
  const tipoDocumento =
    digits.length === 11 ? 'RUC' : digits.length === 8 ? 'DNI' : String(row.tipo_documento ?? 'OTRO');

  const nombre =
    String(row.razon_social ?? row.nombre_razon_social ?? row.nombre_comercial ?? '').trim() ||
    'Sin nombre';

  return {
    tipo_documento: tipoDocumento,
    numero_documento: numeroDocumento,
    nombre_razon_social: nombre,
    direccion: String(row.direccion ?? '').trim(),
    referencia: String(row.distrito ?? row.referencia ?? '').trim(),
    correo_principal: String(row.email ?? row.correo ?? row.correo_principal ?? '').trim(),
    correo_secundario: '',
    telefono_principal: String(row.telefono ?? row.telefono_principal ?? '').trim(),
    ubigeo: String(row.ciudad ?? row.ubigeo ?? '').trim(),
    pais_emisor: String(row.pais ?? row.pais_emisor ?? 'PE').trim() || 'PE',
    estado: row.activo === false ? 'INACTIVO' : String(row.estado ?? 'ACTIVO'),
    tipo_sunat: '',
    tipo_persona: String(row.tipo_cliente ?? row.tipo_persona ?? '').trim(),
    tipo_precio: '',
    categoria: String(row.segmento ?? row.categoria ?? '').trim(),
    canal_ruta: String(row.estado_comercial ?? row.canal_ruta ?? '').trim(),
    frecuencia_visita: '',
    dia_visita: '',
    linea_credito: '',
    fecha_nacimiento: row.cumpleanos ? String(row.cumpleanos) : '',
    contacto: String(row.contacto_nombre ?? row.contacto ?? '').trim(),
    vendedor: String(row.ejecutivo_nombre ?? row.vendedor ?? '').trim(),
    observaciones: String(row.observaciones ?? row.notas ?? '').trim(),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {Record<string, unknown> | null}
 */
export function mapErpVentaToMirrorRow(row) {
  const externalKey = String(
    row.codigo_comprobante ?? row.external_key ?? row.numero ?? row.id ?? '',
  ).trim();
  if (!externalKey) return null;

  const fechaRaw = row.fecha ?? row.invoice_date ?? row.created_at;
  const invoiceDate = fechaRaw ? new Date(String(fechaRaw)) : new Date();
  if (Number.isNaN(invoiceDate.getTime())) return null;

  const period = new Date(Date.UTC(invoiceDate.getUTCFullYear(), invoiceDate.getUTCMonth(), 1));
  const currency = String(row.moneda ?? row.currency ?? 'PEN').trim() || 'PEN';
  const total = Number(row.total ?? 0) || 0;

  return {
    external_key: externalKey,
    invoice_date: invoiceDate.toISOString(),
    report_period_month: period.toISOString().slice(0, 10),
    document_type: String(row.tipo_comprobante ?? row.document_type ?? '').trim(),
    serie: '',
    numero: String(row.numero ?? '').trim(),
    tax_id: String(row.cliente_ruc ?? row.tax_id ?? '').trim(),
    customer_name: String(row.cliente_nombre ?? row.customer_name ?? '').trim(),
    seller_name: String(row.vendedor_nombre ?? row.seller_name ?? '').trim(),
    currency,
    total,
    total_pen: currency.toUpperCase() === 'PEN' ? total : null,
    estado: String(row.estado ?? '').trim(),
    estado_sunat: String(row.estado_sunat ?? '').trim(),
    hora: row.hora_emision != null ? String(row.hora_emision) : '',
    observations: String(row.notas ?? row.observations ?? '').trim(),
  };
}

/**
 * Detecta si la fila ya viene en formato espejo Persona.
 * @param {Record<string, unknown>} row
 */
export function isPersonaMirrorRow(row) {
  return Boolean(row.numero_documento) && (row.nombre_razon_social != null || row.tipo_documento != null);
}

/**
 * Detecta si la fila ya viene en formato espejo Ventas.
 * @param {Record<string, unknown>} row
 */
export function isVentasMirrorRow(row) {
  return Boolean(row.external_key) && (row.payload != null || row.invoice_date != null);
}
