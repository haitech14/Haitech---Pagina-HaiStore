/**
 * Leads de CRM persistidos en disco (WhatsApp / web) para seguimiento
 * compartido en el panel, no solo en localStorage del navegador.
 */

import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

import { getCrmPipelineLeadsPath } from './server-paths.js';

async function ensureFile() {
  const filePath = getCrmPipelineLeadsPath();
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ leads: [] }, null, 2));
  }
}

async function readAll() {
  await ensureFile();
  try {
    const raw = await fs.readFile(getCrmPipelineLeadsPath(), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.leads) ? parsed.leads : [];
  } catch {
    return [];
  }
}

async function writeAll(leads) {
  await ensureFile();
  await fs.writeFile(getCrmPipelineLeadsPath(), JSON.stringify({ leads }, null, 2));
}

function initialsFromName(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'WA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function stableWebLeadId(input) {
  const tax = String(input.taxId ?? '').replace(/\D/g, '');
  if (tax.length >= 8) return `wa-${tax}`;
  const slug = String(input.name ?? 'lead')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
  const city = String(input.city ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 16);
  return `wa-${slug || randomUUID().slice(0, 8)}${city ? `-${city}` : ''}`;
}

/**
 * @param {{
 *   name: string;
 *   companyOrRuc?: string | null;
 *   city?: string | null;
 *   phone?: string | null;
 *   email?: string | null;
 *   channelLabel: string;
 *   channel: string;
 *   message?: string | null;
 *   campaign?: string | null;
 *   productName?: string | null;
 *   taxId?: string | null;
 *   customerId?: string | null;
 * }} input
 */
export function buildWhatsAppPipelineLead(input) {
  const name = String(input.name ?? '').trim();
  const organization = String(input.companyOrRuc ?? '').trim() || name;
  const city = String(input.city ?? '').trim();
  const phone = String(input.phone ?? '').trim();
  const email = String(input.email ?? '').trim();
  const now = new Date().toISOString();
  const id = stableWebLeadId({ name, city, taxId: input.taxId });
  const notes = [
    `Canal: ${input.channelLabel}`,
    input.campaign ? `Referencia: ${input.campaign}` : null,
    input.productName ? `Interés: ${input.productName}` : null,
    input.message ? `Mensaje WhatsApp:\n${String(input.message).slice(0, 1200)}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const formSnapshot = {
    contactName: name,
    organization,
    address: '',
    district: '',
    city: city || 'Lima',
    province: city || 'Lima',
    title: `WhatsApp — ${name}`,
    productName: input.productName ?? '',
    lineItems: [],
    valueAmount: '',
    currency: 'PEN',
    customerRole: 'public',
    contactEmail: email && !email.endsWith('@lead.haistore.local') ? email : '',
    website: '',
    tags: 'whatsapp',
    ownerId: '',
    ownerLabel: 'Tienda en línea',
    expectedCloseDate: '',
    sourceChannel: 'whatsapp',
    visibility: 'proyecto',
    phones: phone
      ? [{ id: `${id}-phone`, countryCode: '+51', number: phone.replace(/\D/g, ''), type: 'celular' }]
      : [{ id: `${id}-phone`, countryCode: '+51', number: '', type: 'celular' }],
    emails: [
      {
        id: `${id}-email`,
        address: email && !email.endsWith('@lead.haistore.local') ? email : '',
        type: 'trabajo',
      },
    ],
    notes,
    tasks: [
      {
        id: `${id}-task-followup`,
        title: 'Dar seguimiento por WhatsApp',
        done: false,
        createdAt: now,
      },
    ],
    stageId: 'leads',
  };

  return {
    id,
    stageId: 'leads',
    title: formSnapshot.title,
    contactName: name,
    organization,
    valueAmount: 0,
    currency: 'PEN',
    initials: initialsFromName(name),
    avatarClass: 'bg-violet-100 text-violet-700',
    priority: 'media',
    followUpLabel: 'Seguimiento: Hoy',
    createdAt: now,
    productName: input.productName ?? '',
    lineItems: [],
    sellerName: 'Tienda en línea',
    tasks: formSnapshot.tasks,
    formSnapshot,
    storeCustomerId: input.customerId ?? null,
    webChannel: input.channel,
  };
}

export async function upsertCrmPipelineLeadFile(lead) {
  const leads = await readAll();
  const index = leads.findIndex((row) => row?.id === lead.id);
  if (index >= 0) {
    const existing = leads[index];
    leads[index] = {
      ...lead,
      stageId: existing.stageId || lead.stageId,
      followUpLabel: existing.followUpLabel || lead.followUpLabel,
      sellerName: existing.sellerName && existing.sellerName !== 'Tienda en línea'
        ? existing.sellerName
        : lead.sellerName,
      createdAt: existing.createdAt || lead.createdAt,
      formSnapshot: {
        ...lead.formSnapshot,
        stageId: existing.stageId || lead.stageId,
        ownerLabel: existing.sellerName || lead.sellerName,
        notes: [existing.formSnapshot?.notes, lead.formSnapshot?.notes]
          .filter(Boolean)
          .filter((value, i, arr) => arr.indexOf(value) === i)
          .join('\n\n')
          .slice(0, 4000),
      },
    };
  } else {
    leads.unshift(lead);
  }
  await writeAll(leads.slice(0, 400));
  return lead.id;
}

export async function listCrmPipelineLeadsFile() {
  return readAll();
}

export async function updateCrmPipelineLeadFile(id, patch) {
  const leads = await readAll();
  const index = leads.findIndex((row) => row?.id === id);
  if (index < 0) return null;
  leads[index] = { ...leads[index], ...patch, id };
  await writeAll(leads);
  return leads[index];
}

export async function deleteCrmPipelineLeadFile(id) {
  const leads = await readAll();
  const next = leads.filter((row) => row?.id !== id);
  if (next.length === leads.length) return false;
  await writeAll(next);
  return true;
}
