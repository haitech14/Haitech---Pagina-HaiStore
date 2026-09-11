/**
 * Agenda de visita técnica → cliente, equipos y service_requests de HaiSupport.
 */

import { getHaiSupportSupabaseAdmin, isHaiSupportSupabaseConfigured } from './haisupport-supabase.js';

const COMPANY_FALLBACK_QUERY = 'company_id';

/**
 * @param {string} value
 */
function trimOrNull(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * @param {string} ciudad
 * @param {string | null | undefined} distrito
 */
export function parseHaiSupportPlace(ciudad, distrito) {
  const dist = trimOrNull(distrito) ?? '';
  const cityRaw = trimOrNull(ciudad) ?? '';
  const parts = cityRaw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return { city: parts[0] ?? 'Lima', district: dist || parts[parts.length - 1] || '' };
  }
  if (parts.length === 2) {
    return { city: parts[0] ?? 'Lima', district: dist || parts[1] || '' };
  }
  return { city: parts[0] || cityRaw || 'Lima', district: dist };
}

/**
 * @param {string} ruc
 */
export async function lookupHaiSupportVisitClient(ruc) {
  if (!isHaiSupportSupabaseConfigured()) {
    return { found: false, configured: false, client: null, equipment: [] };
  }

  const numero = String(ruc ?? '').replace(/\D/g, '');
  if (!/^\d{8,11}$/.test(numero)) {
    return { found: false, configured: true, client: null, equipment: [] };
  }

  const sb = getHaiSupportSupabaseAdmin();
  const { data: clientRow, error: clientError } = await sb
    .from('clients')
    .select(
      'id, nombre, nombre_contacto, telefono, email, direccion, ciudad, distrito, provincia, ruc_dni, tipo_cliente, company_id, referencia',
    )
    .eq('ruc_dni', numero)
    .limit(1)
    .maybeSingle();

  if (clientError) {
    console.warn('[haisupport-visit] client:', clientError.message);
  }

  const equipmentRows = await listRegisteredEquipment(sb, numero, clientRow?.id ?? null);
  const latestVisit = await latestServiceContact(sb, numero, clientRow?.id ?? null);

  if (!clientRow && equipmentRows.length === 0 && !latestVisit) {
    return { found: false, configured: true, client: null, equipment: [] };
  }

  const place = parseHaiSupportPlace(
    latestVisit?.ciudad || clientRow?.ciudad,
    latestVisit?.distrito || clientRow?.distrito,
  );

  const companyName = trimOrNull(clientRow?.nombre) || trimOrNull(latestVisit?.razon_social) || '';
  const contactFromVisit = trimOrNull(latestVisit?.nombre_contacto);
  const contactFromClient = trimOrNull(clientRow?.nombre_contacto);
  const nombreContacto =
    (contactFromVisit && contactFromVisit !== companyName ? contactFromVisit : null) ||
    contactFromClient ||
    contactFromVisit ||
    companyName;

  const telefono =
    trimOrNull(latestVisit?.celular_contacto) || trimOrNull(clientRow?.telefono) || '';

  return {
    found: true,
    configured: true,
    client: {
      id: clientRow?.id ?? null,
      nombre: companyName,
      nombreContacto,
      telefono,
      email: trimOrNull(clientRow?.email),
      direccion: trimOrNull(latestVisit?.direccion) || trimOrNull(clientRow?.direccion) || '',
      referencia: trimOrNull(latestVisit?.referencia) || trimOrNull(clientRow?.referencia) || '',
      ciudad: place.city,
      distrito: place.district,
      tipoCliente: trimOrNull(clientRow?.tipo_cliente) || 'publico',
      companyId: clientRow?.company_id ?? null,
    },
    equipment: equipmentRows,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string} ruc
 * @param {string | null} clientId
 */
async function latestServiceContact(sb, ruc, clientId) {
  let query = sb
    .from('service_requests')
    .select(
      'nombre_contacto, celular_contacto, direccion, referencia, ciudad, distrito, razon_social, created_at',
    )
    .is('deleted_at', null)
    .neq('status', 'eliminado');

  query = clientId
    ? query.or(`ruc_dni.eq.${ruc},client_id.eq.${clientId}`)
    : query.eq('ruc_dni', ruc);

  const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) {
    console.warn('[haisupport-visit] latest contact:', error.message);
    return null;
  }
  return data;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string} ruc
 * @param {string | null} clientId
 */
async function listRegisteredEquipment(sb, ruc, clientId) {
  let query = sb
    .from('service_requests')
    .select('id, modelo_maquina, serie_equipo, numero_ticket, status, created_at')
    .is('deleted_at', null)
    .neq('status', 'eliminado');

  query = clientId
    ? query.or(`ruc_dni.eq.${ruc},client_id.eq.${clientId}`)
    : query.eq('ruc_dni', ruc);

  const { data, error } = await query.order('created_at', { ascending: false }).limit(40);
  if (error) {
    console.warn('[haisupport-visit] equipment:', error.message);
    return [];
  }

  /** @type {Map<string, { id: string; model: string; serial: string; lastTicket: string | null; lastStatus: string | null }>} */
  const unique = new Map();
  for (const row of data ?? []) {
    const model = trimOrNull(row.modelo_maquina);
    if (!model) continue;
    const serial = trimOrNull(row.serie_equipo) || '';
    const key = `${model.toLowerCase()}|${serial.toLowerCase()}`;
    if (unique.has(key)) continue;
    unique.set(key, {
      id: String(row.id),
      model,
      serial,
      lastTicket: trimOrNull(row.numero_ticket),
      lastStatus: trimOrNull(row.status),
    });
  }
  return [...unique.values()];
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 */
async function nextNumeroTicket(sb) {
  const { data } = await sb
    .from('service_requests')
    .select('numero_ticket')
    .not('numero_ticket', 'is', null)
    .order('created_at', { ascending: false })
    .limit(40);

  let max = 0;
  for (const row of data ?? []) {
    const match = String(row.numero_ticket ?? '').match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `TK01-${String(max + 1).padStart(5, '0')}`;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string} name
 */
async function findTechnicianId(sb, name) {
  const needle = trimOrNull(name);
  if (!needle || /aleatorio/i.test(needle)) return null;
  const { data } = await sb.from('technicians').select('id, nombre').ilike('nombre', `%${needle}%`).limit(5);
  const exact = (data ?? []).find((row) => String(row.nombre).trim().toLowerCase() === needle.toLowerCase());
  return exact?.id ?? data?.[0]?.id ?? null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string | null} fromClient
 */
async function resolveCompanyId(sb, fromClient) {
  if (fromClient) return fromClient;
  const { data } = await sb
    .from('service_requests')
    .select(COMPANY_FALLBACK_QUERY)
    .not('company_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.company_id ?? null;
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createHaiSupportVisitRequest(payload) {
  if (!isHaiSupportSupabaseConfigured()) {
    throw new Error('HaiSupport no está conectado.');
  }

  const sb = getHaiSupportSupabaseAdmin();
  const lookup = await lookupHaiSupportVisitClient(String(payload.ruc ?? ''));
  const client = lookup.client;

  const technicianName = String(payload.technicianName ?? '');
  const technicianId = await findTechnicianId(sb, technicianName);
  const companyId = await resolveCompanyId(sb, client?.companyId ?? null);
  const numeroTicket = await nextNumeroTicket(sb);
  const now = new Date().toISOString();

  const visitDate = String(payload.visitDate ?? '');
  const visitHour = Number(payload.visitHour);
  const fechaAgendada =
    visitDate && Number.isFinite(visitHour)
      ? new Date(`${visitDate}T${String(visitHour).padStart(2, '0')}:00:00-05:00`).toISOString()
      : null;

  const row = {
    ruc_dni: String(payload.ruc ?? '').replace(/\D/g, ''),
    razon_social: trimOrNull(payload.razonSocial) || client?.nombre || '',
    correo_cliente: client?.email ?? null,
    defecto_equipo: trimOrNull(payload.defecto) || trimOrNull(payload.serviceLabel) || 'Visita técnica',
    modelo_maquina: trimOrNull(payload.modelLabel) || '',
    celular_contacto: trimOrNull(payload.celular) || client?.telefono || '',
    direccion: trimOrNull(payload.address) || client?.direccion || '',
    referencia: trimOrNull(payload.reference),
    garantia: payload.includesPackage === true,
    serie_equipo: trimOrNull(payload.serialNumber),
    horario_atencion: trimOrNull(payload.horarioAtencion),
    factura: null,
    ciudad: trimOrNull(payload.city) || client?.ciudad || 'Lima',
    tipo_cliente: client?.tipoCliente || 'publico',
    status: 'pendiente',
    fecha_agendada: fechaAgendada,
    tecnico_asignado_id: technicianId,
    costo_servicio: Number(payload.visitPen) || 0,
    servicios_detalle: [
      {
        tipo: String(payload.defectId ?? 'correctivo'),
        precio: Number(payload.visitPen) || 0,
        cortesia: false,
        estadoPago: 'por_cobrar',
      },
    ],
    nombre_contacto: trimOrNull(payload.atencion) || client?.nombreContacto || '',
    distrito: trimOrNull(payload.district) || client?.distrito || '',
    priority: 'normal',
    numero_ticket: numeroTicket,
    estado_equipo: 'operativo',
    company_id: companyId,
    metadata: {
      origen: 'haistore-agenda',
      tipo_registro: 'servicio',
      print_type: payload.printType ?? null,
      paper_format: payload.paperFormat ?? null,
      quantity: payload.quantity ?? 1,
      includes_package: payload.includesPackage === true,
      image_name: trimOrNull(payload.imageName),
      shift: trimOrNull(payload.shiftLabel),
      contador: trimOrNull(payload.counter),
    },
    provincia: trimOrNull(payload.city) || client?.ciudad || 'Lima',
    es_proforma: true,
    pre_diagnostico: trimOrNull(payload.defecto) || trimOrNull(payload.serviceLabel),
    client_id: client?.id ?? null,
    created_from: 'haistore',
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await sb.from('service_requests').insert(row).select('id, numero_ticket').maybeSingle();
  if (error) {
    console.error('[haisupport-visit] insert:', error.message);
    throw new Error('No se pudo registrar la visita en HaiSupport.');
  }

  return {
    id: data?.id ?? null,
    numeroTicket: data?.numero_ticket ?? numeroTicket,
    connected: true,
  };
}
