import { Router } from 'express';

import { requireAdmin, requireAuth } from '../lib/auth-store.js';
import {
  listHaiSupportClients,
  mergeStoreAndHaiSupportCustomers,
  searchHaiSupportClients,
} from '../lib/haisupport-customers.js';
import {
  getHaiSupportSupabaseAdmin,
  isHaiSupportSupabaseConfigured,
} from '../lib/haisupport-supabase.js';
import { notifyHaiSupportChange } from '../lib/haisupport-sync.js';
import { ensureStoreCustomerFromHaitechClient } from '../lib/haisupport-bridge.js';
import {
  checkoutPreferencesFromBilling,
  inboundPayloadToHaitechClient,
  storeCustomerRowToHaitechClient,
} from '../lib/haitech-mappers.js';
import { resolvePriceRole } from '../lib/roles.js';
import {
  importPersonaCustomerRows,
  parsePersonaWorkbook,
  personaRowToHaitechClient,
  sanitizePersonaData,
  STORE_CUSTOMER_ADMIN_SELECT,
} from '../lib/persona-excel.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';

export const customersRouter = Router();

const STORE_CUSTOMERS_MIGRATION_HINT =
  'Falta la tabla store_customers en Supabase. Ejecuta las migraciones 003, 008, 009 y 010 (npm run db:migrate:customers) o aplica los SQL en supabase/migrations/ desde el SQL Editor del proyecto.';

/** @param {{ code?: string; message?: string } | null | undefined} error */
function isMissingStoreCustomersTable(error) {
  if (!error) return false;
  if (error.code === 'PGRST205') return true;
  const message = String(error.message ?? '').toLowerCase();
  return message.includes('store_customers') && message.includes('schema cache');
}

function cityFromBilling(billing) {
  if (!billing || typeof billing !== 'object') return '';
  const raw = billing.city ?? billing.ciudad ?? billing.address_level2;
  return typeof raw === 'string' ? raw.trim() : '';
}

function companyOrRucFromRow(row) {
  const tax = row?.tax_id?.trim() ?? '';
  const company = row?.company_name?.trim() ?? '';
  if (tax && company) return `${tax} · ${company}`;
  return company || tax || '';
}

function contactFromCustomerRow(row, fallbackName = '') {
  return {
    name: row?.full_name?.trim() || fallbackName,
    companyOrRuc: companyOrRucFromRow(row),
    city: row?.ciudad?.trim() || cityFromBilling(row?.default_billing),
  };
}

function parseCompanyOrRucForStorage(companyOrRuc) {
  const trimmed = String(companyOrRuc ?? '').trim();
  if (!trimmed) return { companyName: null, taxId: null };
  const digitsOnly = trimmed.replace(/\D/g, '');
  const looksLikeRuc =
    digitsOnly.length >= 8 && digitsOnly.length <= 11 && digitsOnly === trimmed.replace(/\s/g, '');
  if (looksLikeRuc) {
    return { companyName: null, taxId: digitsOnly };
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

function trimOrNull(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function profileRoleFromCustomerRow(row) {
  const profile = row?.profiles;
  if (Array.isArray(profile)) return profile[0]?.role;
  if (profile && typeof profile === 'object') return profile.role;
  return null;
}

function checkoutClientFromSession(req, row) {
  const profileRole = resolvePriceRole(profileRoleFromCustomerRow(row) ?? req.user?.role ?? 'public');
  const sessionEmail = req.user?.email?.trim() ?? '';

  if (row) {
    const mapped = storeCustomerRowToHaitechClient({
      ...row,
      email: row.email ?? sessionEmail,
    });
    const tipoCliente =
      mapped.tipoCliente && mapped.tipoCliente !== 'public'
        ? mapped.tipoCliente
        : profileRole;

    const billing =
      row.default_billing && typeof row.default_billing === 'object' ? row.default_billing : {};
    const checkoutPrefs = checkoutPreferencesFromBilling(billing);

    return {
      storeCustomerId: mapped.storeCustomerId,
      haisupportClientId: mapped.haisupportClientId,
      nombre: mapped.nombre,
      nombreContacto: mapped.nombreContacto,
      rucDni: mapped.rucDni,
      telefono: mapped.telefono,
      direccion: mapped.direccion,
      ciudad: mapped.ciudad || 'Lima',
      tipoCliente,
      email: mapped.email ?? sessionEmail,
      notas: mapped.notas ?? '',
      tipoComprobante: checkoutPrefs.tipoComprobante ?? 'boleta',
      destinoEnvio: checkoutPrefs.destinoEnvio ?? 'lima',
      transporteLima: checkoutPrefs.transporteLima ?? null,
      agenciaProvincia: checkoutPrefs.agenciaProvincia ?? null,
      modalidadProvincia: checkoutPrefs.modalidadProvincia ?? null,
      atencionEntrega: mapped.nombreContacto || '',
      dniEntrega: mapped.rucDni?.length === 8 ? mapped.rucDni : '',
    };
  }

  const fallbackName = req.user?.name?.trim() ?? '';
  return {
    storeCustomerId: null,
    haisupportClientId: null,
    nombre: fallbackName,
    nombreContacto: fallbackName,
    rucDni: '',
    telefono: '',
    direccion: '',
    ciudad: 'Lima',
    tipoCliente: profileRole,
    email: sessionEmail,
    notas: '',
  };
}

customersRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const fallbackName = req.user?.name?.trim() ?? '';
    const supabase = getSupabaseAdmin();

    if (!supabase || !req.user?.id) {
      const checkoutClient = checkoutClientFromSession(req, null);
      return res.json({
        contact: {
          name: fallbackName,
          companyOrRuc: '',
          city: checkoutClient.ciudad || '',
          source: 'session',
        },
        checkoutClient,
      });
    }

    const { data, error } = await supabase
      .from('store_customers')
      .select(
        `
        id,
        email,
        full_name,
        phone,
        company_name,
        tax_id,
        ciudad,
        direccion,
        nombre_contacto,
        tipo_cliente,
        default_billing,
        haisupport_client_id,
        profiles ( role )
      `,
      )
      .eq('profile_id', req.user.id)
      .maybeSingle();

    if (error) {
      console.error('[customers] me:', error);
      return res.status(500).json({ error: 'No se pudo cargar tu perfil de contacto' });
    }

    const contact = contactFromCustomerRow(data, fallbackName);
    const checkoutClient = checkoutClientFromSession(req, data);
    res.json({
      contact: { ...contact, source: 'account' },
      checkoutClient,
    });
  } catch (error) {
    next(error);
  }
});

customersRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase || !req.user?.id) {
      return res.status(400).json({ error: 'Inicia sesión con una cuenta registrada para guardar tus datos' });
    }

    const name = trimOrNull(req.body?.name);
    const companyOrRuc = trimOrNull(req.body?.companyOrRuc);
    const city = trimOrNull(req.body?.city);
    const { companyName, taxId } = parseCompanyOrRucForStorage(companyOrRuc ?? '');

    if (!name || !companyOrRuc || !city) {
      return res.status(400).json({ error: 'Nombre, RUC/empresa y ciudad son obligatorios' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('store_customers')
      .select('id, default_billing')
      .eq('profile_id', req.user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('[customers] me patch fetch:', fetchError);
      return res.status(500).json({ error: 'No se pudo actualizar el contacto' });
    }

    const billing =
      existing?.default_billing && typeof existing.default_billing === 'object'
        ? { ...existing.default_billing, city, ciudad: city }
        : { city, ciudad: city };

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from('store_customers')
        .update({
          full_name: name,
          company_name: companyName,
          tax_id: taxId,
          ciudad: city,
          default_billing: billing,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('[customers] me patch:', updateError);
        return res.status(500).json({ error: 'No se pudo guardar el contacto' });
      }
    } else {
      const { error: insertError } = await supabase.from('store_customers').insert({
        profile_id: req.user.id,
        email: req.user.email,
        full_name: name,
        company_name: companyName,
        tax_id: taxId,
        ciudad: city,
        default_billing: billing,
      });

      if (insertError) {
        console.error('[customers] me insert:', insertError);
        return res.status(500).json({ error: 'No se pudo crear el contacto' });
      }
    }

    await supabase.from('profiles').update({ full_name: name }).eq('id', req.user.id);

    res.json({ contact: { name, companyOrRuc, city, source: 'account' } });
  } catch (error) {
    next(error);
  }
});

customersRouter.get('/admin/search', requireAdmin, async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '')
      .trim()
      .replace(/,/g, ' ')
      .slice(0, 80);
    if (q.length < 2) {
      return res.json({ customers: [] });
    }

    const supabase = getSupabaseAdmin();
    /** @type {Array<Record<string, unknown>>} */
    let storeCustomers = [];

    if (supabase) {
      const pattern = `%${q.replace(/,/g, ' ')}%`;
      const { data, error } = await supabase
        .from('store_customers')
        .select(
          `
        id,
        email,
        full_name,
        phone,
        company_name,
        tax_id,
        default_billing,
        profiles ( role )
      `,
        )
        .or(
          `company_name.ilike.${pattern},tax_id.ilike.${pattern},full_name.ilike.${pattern},email.ilike.${pattern}`,
        )
        .order('company_name', { ascending: true, nullsFirst: false })
        .limit(12);

      if (error) {
        console.error('[customers] search error:', error);
        return res.status(500).json({ error: 'No se pudo buscar clientes' });
      }

      storeCustomers = (data ?? []).map((row) => ({
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        phone: row.phone,
        company_name: row.company_name,
        tax_id: row.tax_id,
        default_billing: row.default_billing,
        profile_role: row.profiles?.role ?? null,
        source: 'haistore',
      }));
    }

    const haisupportMatches = await searchHaiSupportClients(q, 12);
    const customers = mergeStoreAndHaiSupportCustomers(storeCustomers, haisupportMatches).slice(
      0,
      12,
    );

    res.json({ customers, source: 'merged' });
  } catch (error) {
    next(error);
  }
});

customersRouter.get('/admin/all', requireAdmin, async (_req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    /** @type {Array<Record<string, unknown>>} */
    let storeCustomers = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('store_customers')
        .select(STORE_CUSTOMER_ADMIN_SELECT)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[customers] list error:', error);
        if (isMissingStoreCustomersTable(error)) {
          return res.status(503).json({ error: STORE_CUSTOMERS_MIGRATION_HINT });
        }
        return res.status(500).json({ error: 'No se pudieron cargar los clientes' });
      }

      const rows = data ?? [];
      const profileIds = [...new Set(rows.map((row) => row.profile_id).filter(Boolean))];
      /** @type {Map<string, { role: string, full_name: string | null }>} */
      const profileById = new Map();

      if (profileIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, role, full_name')
          .in('id', profileIds);

        if (profilesError) {
          console.error('[customers] profiles error:', profilesError);
        } else {
          for (const profile of profiles ?? []) {
            profileById.set(profile.id, profile);
          }
        }
      }

      storeCustomers = rows.map((row) => {
        const profile = row.profile_id ? profileById.get(row.profile_id) : null;
        const productosInteres = Array.isArray(row.productos_interes)
          ? row.productos_interes.filter((id) => typeof id === 'string')
          : [];
        return {
          ...row,
          full_name: row.full_name ?? profile?.full_name ?? null,
          profile_role: row.tipo_cliente ?? profile?.role ?? null,
          source: row.source ?? 'haistore',
          persona_data: row.persona_data ?? {},
          productos_interes: productosInteres,
        };
      });
    }

    const haisupportCustomers = isHaiSupportSupabaseConfigured()
      ? await listHaiSupportClients()
      : [];

    const customers = mergeStoreAndHaiSupportCustomers(storeCustomers, haisupportCustomers);

    res.json({
      customers,
      source: supabase || haisupportCustomers.length > 0 ? 'merged' : 'unavailable',
      counts: {
        haistore: storeCustomers.length,
        haisupport: haisupportCustomers.length,
        merged: customers.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

const PROFILE_ROLES = new Set([
  'public',
  'corporativo',
  'tecnico',
  'mayorista',
  'distribuidor',
  'vip',
  'admin',
]);

customersRouter.patch('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }

    const { id } = req.params;
    const body = req.body ?? {};

    const { data: existing, error: fetchError } = await supabase
      .from('store_customers')
      .select(STORE_CUSTOMER_ADMIN_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('[customers] fetch for patch:', fetchError);
      return res.status(500).json({ error: 'No se pudo cargar el cliente' });
    }
    if (!existing) {
      if (isHaiSupportSupabaseConfigured()) {
        const hs = getHaiSupportSupabaseAdmin();
        const { data: hsRow } = await hs.from('clients').select('id').eq('id', id).maybeSingle();
        if (hsRow) {
          return res.status(400).json({
            error: 'Este cliente pertenece a HaiSupport. Edítalo desde el panel de HaiSupport.',
          });
        }
      }
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const patch = {};
    if (body.email !== undefined) {
      const email = trimOrNull(body.email);
      if (!email) return res.status(400).json({ error: 'El correo es obligatorio' });
      patch.email = email;
    }
    if (body.full_name !== undefined) patch.full_name = trimOrNull(body.full_name);
    if (body.phone !== undefined) patch.phone = trimOrNull(body.phone);
    if (body.company_name !== undefined) patch.company_name = trimOrNull(body.company_name);
    if (body.tax_id !== undefined) patch.tax_id = trimOrNull(body.tax_id);
    if (body.notes !== undefined) patch.notes = trimOrNull(body.notes);
    if (body.nombre_contacto !== undefined) patch.nombre_contacto = trimOrNull(body.nombre_contacto);
    if (body.direccion !== undefined) patch.direccion = trimOrNull(body.direccion);
    if (body.ciudad !== undefined) patch.ciudad = trimOrNull(body.ciudad);
    if (body.tipo_cliente !== undefined) {
      const role = String(body.tipo_cliente).trim();
      if (!PROFILE_ROLES.has(role)) {
        return res.status(400).json({ error: 'Rol de cliente no válido' });
      }
      patch.tipo_cliente = role;
    }
    if (body.profile_role !== undefined && body.profile_role !== null && body.tipo_cliente === undefined) {
      const role = String(body.profile_role).trim();
      if (!PROFILE_ROLES.has(role)) {
        return res.status(400).json({ error: 'Rol de cliente no válido' });
      }
      patch.tipo_cliente = role;
    }
    if (body.productos_interes !== undefined) {
      const ids = Array.isArray(body.productos_interes)
        ? body.productos_interes.filter((id) => typeof id === 'string' && id.trim().length > 0)
        : [];
      patch.productos_interes = ids;
    }
    if (body.persona_data !== undefined && typeof body.persona_data === 'object') {
      patch.persona_data = sanitizePersonaData(body.persona_data);
    }

    let customerRow = existing;
    if (Object.keys(patch).length > 0) {
      const { data: updated, error: updateError } = await supabase
        .from('store_customers')
        .update(patch)
        .eq('id', id)
        .select(STORE_CUSTOMER_ADMIN_SELECT)
        .single();

      if (updateError) {
        console.error('[customers] patch error:', updateError);
        return res.status(500).json({ error: 'No se pudo actualizar el cliente' });
      }
      customerRow = updated;
    }

    let profileRole = customerRow.tipo_cliente ?? existing.tipo_cliente ?? null;
    if (existing.profile_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', existing.profile_id)
        .maybeSingle();

      if (profileError) {
        console.error('[customers] profile fetch:', profileError);
        return res.status(500).json({ error: 'No se pudo cargar el perfil del cliente' });
      }

      profileRole = customerRow.tipo_cliente ?? profile?.role ?? profileRole;

      if (body.profile_role !== undefined && body.profile_role !== null) {
        const nextRole = String(body.profile_role).trim();
        if (!PROFILE_ROLES.has(nextRole)) {
          return res.status(400).json({ error: 'Rol de cliente no válido' });
        }

        const profilePatch = { role: nextRole };
        if (body.full_name !== undefined) {
          profilePatch.full_name = trimOrNull(body.full_name);
        }

        const { error: roleError } = await supabase
          .from('profiles')
          .update(profilePatch)
          .eq('id', existing.profile_id);

        if (roleError) {
          console.error('[customers] profile role update:', roleError);
          return res.status(500).json({ error: 'No se pudo actualizar el tipo de cliente' });
        }

        profileRole = nextRole;
        if (!patch.tipo_cliente) {
          await supabase.from('store_customers').update({ tipo_cliente: nextRole }).eq('id', id);
          customerRow = { ...customerRow, tipo_cliente: nextRole };
        }
      } else if (body.full_name !== undefined && profile) {
        await supabase
          .from('profiles')
          .update({ full_name: trimOrNull(body.full_name) })
          .eq('id', existing.profile_id);
      }
    }

    const productosInteres = Array.isArray(customerRow.productos_interes)
      ? customerRow.productos_interes.filter((id) => typeof id === 'string')
      : [];

    res.json({
      customer: {
        ...customerRow,
        full_name: customerRow.full_name ?? null,
        profile_role: profileRole,
        persona_data: customerRow.persona_data ?? {},
        productos_interes: productosInteres,
      },
      source: 'supabase',
    });
    notifyHaiSupportChange('customers', 'update', {
      ...customerRow,
      profile_role: profileRole,
    });
  } catch (error) {
    next(error);
  }
});

customersRouter.post('/admin', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    let clientInput = body;

    if (body.persona_data && typeof body.persona_data === 'object') {
      const persona = sanitizePersonaData(body.persona_data);
      clientInput = {
        ...personaRowToHaitechClient(persona),
        ...body,
        persona_data: persona,
      };
    }

    const client = inboundPayloadToHaitechClient(clientInput);
    const { clientId, snapshot } = await ensureStoreCustomerFromHaitechClient({
      ...clientInput,
      ...client,
    });

    const supabase = getSupabaseAdmin();
    const { data: row } = await supabase
      .from('store_customers')
      .select(STORE_CUSTOMER_ADMIN_SELECT)
      .eq('id', clientId)
      .single();

    const customer = row
      ? {
          ...row,
          profile_role: row.tipo_cliente ?? client.tipoCliente ?? 'public',
          persona_data: row.persona_data ?? {},
        }
      : { ...snapshot, profile_role: client.tipoCliente ?? 'public' };

    notifyHaiSupportChange('customers', 'create', customer);
    res.status(201).json({ customer, source: 'haistore' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('obligatoria')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

customersRouter.post('/admin/import-persona', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    let rows = [];

    if (Array.isArray(body.rows)) {
      rows = body.rows.map((row) => sanitizePersonaData(row));
    } else if (body.fileBase64 && typeof body.fileBase64 === 'string') {
      const buffer = Buffer.from(body.fileBase64, 'base64');
      rows = parsePersonaWorkbook(buffer);
    } else {
      return res.status(400).json({
        error: 'Envía `rows` (array) o `fileBase64` con el Excel Persona.',
      });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: 'El archivo no contiene filas válidas.' });
    }

    const result = await importPersonaCustomerRows(rows);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

customersRouter.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(503).json({ error: 'Supabase no configurado' });

    const { data: existing } = await supabase
      .from('store_customers')
      .select('id, haisupport_client_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Cliente no encontrado' });

    const { error } = await supabase.from('store_customers').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'No se pudo eliminar el cliente' });

    notifyHaiSupportChange('customers', 'delete', { id: req.params.id });
    res.json({ ok: true, id: req.params.id });
  } catch (error) {
    next(error);
  }
});
