/**
 * Upsert de clientes en store_customers a partir de leads de la web
 * (formularios, WhatsApp, Haibot, etc.) con trazabilidad en persona_data.
 */

import { randomUUID } from 'crypto';

import { getSupabaseAdmin } from './supabase-auth.js';

/** @type {Record<string, string>} */
export const WEB_LEAD_CHANNEL_LABELS = {
  'contact-page': 'Contacto web',
  'header-soporte': 'Soporte (header)',
  haibot: 'Haibot',
  'services-landing': 'Cotizar servicios',
  'software-landing': 'Software a medida',
  'services-support-hero': 'Agenda soporte',
  subscription_ruleta: 'Ruleta / promo',
  'whatsapp-product': 'WhatsApp producto',
  'whatsapp-header': 'WhatsApp header',
  'whatsapp-cotizar': 'Cotizar WhatsApp',
  'whatsapp-hero': 'WhatsApp hero',
  'whatsapp-floating': 'WhatsApp flotante',
  'whatsapp-rental': 'WhatsApp alquiler',
  'whatsapp-home': 'WhatsApp home',
  'account-signup': 'Registro / inicio de sesión',
  'account-login': 'Inicio de sesión',
  'quote-pdf': 'Cotización PDF',
  contact: 'Contacto web',
};

/**
 * @param {unknown} channel
 * @returns {string}
 */
export function webLeadChannelLabel(channel) {
  const key = typeof channel === 'string' ? channel.trim() : '';
  if (!key) return 'Web';
  return WEB_LEAD_CHANNEL_LABELS[key] ?? key;
}

/**
 * @param {string | null | undefined} companyOrRuc
 * @param {string | null | undefined} name
 * @returns {{ companyName: string | null, taxId: string | null }}
 */
function parseCompanyOrRuc(companyOrRuc, name) {
  const trimmed = String(companyOrRuc ?? '').trim();
  if (!trimmed) return { companyName: null, taxId: null };
  const digitsOnly = trimmed.replace(/\D/g, '');
  const looksLikeRuc =
    digitsOnly.length >= 8 && digitsOnly.length <= 11 && digitsOnly === trimmed.replace(/\s/g, '');
  if (looksLikeRuc) {
    return { companyName: name?.trim() || null, taxId: digitsOnly };
  }
  const rucMatch = trimmed.match(/^(\d{8,11})\s*[·\-–]\s*(.+)$/);
  if (rucMatch) {
    return {
      taxId: rucMatch[1] ?? null,
      companyName: rucMatch[2]?.trim() || null,
    };
  }
  return { companyName: trimmed, taxId: null };
}

/**
 * Email estable para leads WhatsApp sin correo real.
 * @param {{ name?: string; companyOrRuc?: string; phone?: string; email?: string }} input
 */
export function resolveWebLeadEmail(input) {
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (email && email.includes('@') && !email.endsWith('@lead.haistore.local')) {
    return email;
  }

  const { taxId, companyName } = parseCompanyOrRuc(input.companyOrRuc, input.name);
  if (taxId) return `ruc.${taxId}@lead.haistore.local`;

  const phoneDigits = String(input.phone ?? '').replace(/\D/g, '');
  if (phoneDigits.length >= 7) return `tel.${phoneDigits}@lead.haistore.local`;

  const slug = String(companyName || input.name || 'anon')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `wa.${slug || randomUUID().slice(0, 8)}@lead.haistore.local`;
}

/**
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
function asPersonaObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return { ...value };
}

/**
 * @param {Record<string, unknown>} persona
 * @returns {Array<Record<string, unknown>>}
 */
function parseLeadHistory(persona) {
  const raw = persona.web_lead_history;
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === 'object') : [];
  } catch {
    return [];
  }
}

/**
 * @param {{
 *   name?: string | null;
 *   email?: string | null;
 *   phone?: string | null;
 *   companyOrRuc?: string | null;
 *   city?: string | null;
 *   channel?: string | null;
 *   message?: string | null;
 *   productName?: string | null;
 *   productId?: string | null;
 *   ticketId?: string | null;
 *   ticketCode?: string | null;
 *   metadata?: Record<string, unknown> | null;
 * }} lead
 * @returns {Promise<{ id: string; email: string; created: boolean } | null>}
 */
export async function upsertStoreCustomerFromWebLead(lead) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const name = String(lead.name ?? '').trim();
  if (name.length < 2) return null;

  const channel = String(lead.channel ?? 'contact').trim() || 'contact';
  const channelLabel = webLeadChannelLabel(channel);
  const email = resolveWebLeadEmail({
    name,
    email: lead.email,
    phone: lead.phone,
    companyOrRuc: lead.companyOrRuc,
  });
  const { companyName, taxId } = parseCompanyOrRuc(lead.companyOrRuc, name);
  const city = String(lead.city ?? '').trim() || null;
  const phone = String(lead.phone ?? '').trim() || null;
  const message = String(lead.message ?? '').trim();
  const productName = String(lead.productName ?? '').trim() || null;
  const productId = String(lead.productId ?? '').trim() || null;
  const meta = lead.metadata && typeof lead.metadata === 'object' ? lead.metadata : {};
  const ip = typeof meta.ip === 'string' ? meta.ip.trim() : '';
  const userAgent = typeof meta.userAgent === 'string' ? meta.userAgent.trim() : '';
  const direccion =
    typeof meta.direccion === 'string' ? meta.direccion.trim() : '';
  const now = new Date().toISOString();

  /** @type {Record<string, unknown> | null} */
  let existing = null;

  if (taxId) {
    const { data } = await supabase
      .from('store_customers')
      .select('id, email, persona_data, notes, full_name, phone, company_name, tax_id, ciudad, direccion')
      .eq('tax_id', taxId)
      .maybeSingle();
    if (data) existing = data;
  }

  if (!existing) {
    const { data } = await supabase
      .from('store_customers')
      .select('id, email, persona_data, notes, full_name, phone, company_name, tax_id, ciudad, direccion')
      .eq('email', email)
      .maybeSingle();
    if (data) existing = data;
  }

  const persona = asPersonaObject(existing?.persona_data);
  const history = parseLeadHistory(persona);
  history.unshift({
    at: now,
    channel,
    channelLabel,
    message: message ? message.slice(0, 280) : null,
    productName,
    productId,
    ticketId: lead.ticketId ?? null,
    ticketCode: lead.ticketCode ?? null,
    ip: ip || null,
    userAgent: userAgent ? userAgent.slice(0, 240) : null,
    direccion: direccion || null,
  });
  const trimmedHistory = history.slice(0, 25);

  const obsParts = [
    typeof persona.observaciones === 'string' ? persona.observaciones.trim() : '',
    `[${now.slice(0, 16).replace('T', ' ')}] ${channelLabel}${productName ? ` · ${productName}` : ''}${ip ? ` · IP ${ip}` : ''}${message ? `: ${message.slice(0, 120)}` : ''}`,
  ].filter(Boolean);

  const nextPersona = {
    ...persona,
    canal_ruta: channelLabel,
    web_lead_last_at: now,
    web_lead_last_channel: channel,
    web_lead_last_ip: ip || persona.web_lead_last_ip || null,
    web_lead_last_ua: userAgent ? userAgent.slice(0, 240) : persona.web_lead_last_ua || null,
    web_lead_history: JSON.stringify(trimmedHistory),
    observaciones: obsParts.join('\n').slice(0, 4000),
    ...(taxId ? { numero_documento: taxId, tipo_documento: taxId.length === 11 ? 'RUC' : 'DNI' } : {}),
    ...(companyName || name
      ? { nombre_razon_social: companyName || name, contacto: name }
      : {}),
    ...(city ? { ubigeo: city } : {}),
    ...(phone ? { telefono_principal: phone } : {}),
    ...(direccion ? { direccion } : {}),
    ...(email && !email.endsWith('@lead.haistore.local')
      ? { correo_principal: email }
      : {}),
  };

  const noteLine = `${now.slice(0, 16).replace('T', ' ')} · ${channelLabel}${productName ? ` · ${productName}` : ''}`;
  const prevNotes = typeof existing?.notes === 'string' ? existing.notes.trim() : '';
  const notes = [noteLine, prevNotes].filter(Boolean).join('\n').slice(0, 4000);

  const payload = {
    email: existing?.email && !String(existing.email).endsWith('@lead.haistore.local')
      ? existing.email
      : email,
    full_name: name,
    phone: phone ?? existing?.phone ?? null,
    company_name: companyName ?? existing?.company_name ?? null,
    tax_id: taxId ?? existing?.tax_id ?? null,
    nombre_contacto: name,
    ciudad: city ?? existing?.ciudad ?? null,
    direccion: direccion || existing?.direccion || null,
    tipo_cliente: 'public',
    source: 'haistore',
    persona_data: nextPersona,
    notes,
    updated_at: now,
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from('store_customers')
      .update(payload)
      .eq('id', existing.id)
      .select('id, email')
      .single();
    if (error) {
      console.warn('[store-web-lead] update:', error.message);
      return null;
    }
    return { id: data.id, email: data.email, created: false };
  }

  const { data, error } = await supabase
    .from('store_customers')
    .insert({
      id: randomUUID(),
      ...payload,
      created_at: now,
    })
    .select('id, email')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: again } = await supabase
        .from('store_customers')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();
      if (again?.id) {
        await supabase.from('store_customers').update(payload).eq('id', again.id);
        return { id: again.id, email: again.email, created: false };
      }
    }
    console.warn('[store-web-lead] insert:', error.message);
    return null;
  }

  return { id: data.id, email: data.email, created: true };
}

/**
 * @param {unknown} personaData
 * @returns {boolean}
 */
export function personaHasWebLead(personaData) {
  const persona = asPersonaObject(personaData);
  if (typeof persona.web_lead_last_at === 'string' && persona.web_lead_last_at) return true;
  return parseLeadHistory(persona).length > 0;
}
