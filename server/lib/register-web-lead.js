/**
 * Registra un lead web como cotización (proforma) + upsert en store_customers.
 * Canales: WhatsApp, formularios, login, cotizaciones PDF, etc.
 */

import { randomUUID } from 'crypto';

import { createProformaFromBody, saveProforma } from './proformas-store.js';
import {
  upsertStoreCustomerFromWebLead,
  webLeadChannelLabel,
} from './store-web-lead.js';

/**
 * @param {import('express').Request} req
 */
export function captureFromRequest(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string' && forwarded.trim()
      ? forwarded.split(',')[0].trim()
      : (req.socket?.remoteAddress ?? 'unknown');

  return {
    ip: String(ip),
    userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '',
    referer: typeof req.headers.referer === 'string' ? req.headers.referer : '',
  };
}

/**
 * @param {{
 *   name?: string | null;
 *   email?: string | null;
 *   phone?: string | null;
 *   companyOrRuc?: string | null;
 *   city?: string | null;
 *   direccion?: string | null;
 *   channel?: string | null;
 *   message?: string | null;
 *   productName?: string | null;
 *   productId?: string | null;
 *   ticketId?: string | null;
 *   ticketCode?: string | null;
 *   createProforma?: boolean;
 *   capture?: { ip?: string; userAgent?: string; referer?: string; path?: string } | null;
 * }} input
 */
export async function registerWebLead(input) {
  const name = String(input.name ?? '').trim();
  if (name.length < 2) {
    throw new Error('El nombre debe tener al menos 2 caracteres.');
  }

  const channel = String(input.channel ?? 'contact').trim() || 'contact';
  const channelLabel = webLeadChannelLabel(channel);
  const city = String(input.city ?? '').trim();
  const direccion = String(input.direccion ?? '').trim();
  const phone = String(input.phone ?? '').trim();
  const companyOrRuc = String(input.companyOrRuc ?? '').trim();
  const productName = String(input.productName ?? '').trim();
  const productId = String(input.productId ?? '').trim();
  const message = String(input.message ?? '').trim();
  const capture = input.capture && typeof input.capture === 'object' ? input.capture : {};
  const createProforma = input.createProforma !== false;

  const customerUpsert = await upsertStoreCustomerFromWebLead({
    name,
    email: input.email,
    phone: phone || null,
    companyOrRuc: companyOrRuc || null,
    city: city || null,
    channel,
    message: message || null,
    productName: productName || null,
    productId: productId || null,
    ticketId: input.ticketId ?? null,
    ticketCode: input.ticketCode ?? null,
    metadata: {
      ip: capture.ip ?? null,
      userAgent: capture.userAgent ?? null,
      referer: capture.referer ?? null,
      path: capture.path ?? null,
      direccion: direccion || null,
    },
  });

  /** @type {Awaited<ReturnType<typeof saveProforma>> | null} */
  let proforma = null;

  if (createProforma) {
    const stamp = new Date();
    const docNum = `WEB-${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(stamp.getDate()).padStart(2, '0')}-${randomUUID().slice(0, 6).toUpperCase()}`;

    const lineLabel = productName
      ? `Consulta: ${productName}`
      : `Lead web · ${channelLabel}`;

    const notesParts = [
      `Canal: ${channelLabel}`,
      message ? `Mensaje: ${message.slice(0, 500)}` : null,
      capture.ip ? `IP: ${capture.ip}` : null,
      capture.userAgent ? `UA: ${String(capture.userAgent).slice(0, 180)}` : null,
      capture.referer ? `Referer: ${String(capture.referer).slice(0, 200)}` : null,
      capture.path ? `Ruta: ${capture.path}` : null,
    ].filter(Boolean);

    const created = createProformaFromBody(
      {
        documentNumber: docNum,
        source: 'web',
        documentType: 'proforma',
        customer: {
          razonSocial: companyOrRuc || name,
          documento: /^\d{8,11}$/.test(companyOrRuc.replace(/\D/g, ''))
            ? companyOrRuc.replace(/\D/g, '')
            : '',
          atencion: name,
          celular: phone || '—',
          direccion: direccion || city || undefined,
          ciudad: city || undefined,
          storeCustomerId: customerUpsert?.id ?? null,
        },
        lineItems: [
          {
            productId: productId || undefined,
            name: lineLabel,
            sku: productId || 'LEAD-WEB',
            brand: 'HAITECH',
            quantity: 1,
            unitPricePen: 0,
          },
        ],
        currency: 'PEN',
        subtotalPen: 0,
        totalPen: 0,
        notes: notesParts.join('\n'),
        validityDays: 7,
        sellerName: 'Tienda en línea',
        sellerEmail: '',
        capture: {
          ip: capture.ip ?? '',
          userAgent: capture.userAgent ?? '',
          referer: capture.referer ?? '',
          path: capture.path ?? '',
          channel,
          channelLabel,
        },
        channel,
      },
      { user: { name: 'Tienda en línea', email: '' } },
    );

    proforma = await saveProforma(created, 'create');
  }

  return {
    customerId: customerUpsert?.id ?? null,
    customerCreated: customerUpsert?.created ?? false,
    proforma,
  };
}
