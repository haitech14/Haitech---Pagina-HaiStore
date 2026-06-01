import { Router } from 'express';

import { requireAdmin, requireAuth } from '../lib/auth-store.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';

export const customersRouter = Router();

function cityFromBilling(billing) {
  if (!billing || typeof billing !== 'object') return '';
  const raw = billing.city ?? billing.ciudad ?? billing.address_level2;
  return typeof raw === 'string' ? raw.trim() : '';
}

function contactFromCustomerRow(row, fallbackName = '') {
  return {
    name: row?.full_name?.trim() || fallbackName,
    phone: row?.phone?.trim() || '',
    city: cityFromBilling(row?.default_billing),
  };
}

function trimOrNull(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

customersRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const fallbackName = req.user?.name?.trim() ?? '';
    const supabase = getSupabaseAdmin();

    if (!supabase || !req.user?.id) {
      return res.json({
        contact: {
          name: fallbackName,
          phone: '',
          city: '',
          source: 'session',
        },
      });
    }

    const { data, error } = await supabase
      .from('store_customers')
      .select('full_name, phone, default_billing')
      .eq('profile_id', req.user.id)
      .maybeSingle();

    if (error) {
      console.error('[customers] me:', error);
      return res.status(500).json({ error: 'No se pudo cargar tu perfil de contacto' });
    }

    const contact = contactFromCustomerRow(data, fallbackName);
    res.json({ contact: { ...contact, source: 'account' } });
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
    const phone = trimOrNull(req.body?.phone);
    const city = trimOrNull(req.body?.city);

    if (!name || !phone || !city) {
      return res.status(400).json({ error: 'Nombre, celular y ciudad son obligatorios' });
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
          phone,
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
        phone,
        default_billing: billing,
      });

      if (insertError) {
        console.error('[customers] me insert:', insertError);
        return res.status(500).json({ error: 'No se pudo crear el contacto' });
      }
    }

    await supabase.from('profiles').update({ full_name: name }).eq('id', req.user.id);

    res.json({ contact: { name, phone, city, source: 'account' } });
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
    if (!supabase) {
      return res.json({ customers: [], source: 'unavailable' });
    }

    const pattern = `%${q}%`;
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

    const customers = (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      phone: row.phone,
      company_name: row.company_name,
      tax_id: row.tax_id,
      default_billing: row.default_billing,
      profile_role: row.profiles?.role ?? null,
    }));

    res.json({ customers, source: 'supabase' });
  } catch (error) {
    next(error);
  }
});

customersRouter.get('/admin/all', requireAdmin, async (_req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.json({ customers: [], source: 'unavailable' });
    }

    const { data, error } = await supabase
      .from('store_customers')
      .select(
        'id, profile_id, email, full_name, phone, company_name, tax_id, created_at, updated_at',
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[customers] list error:', error);
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

    const customers = rows.map((row) => {
      const profile = row.profile_id ? profileById.get(row.profile_id) : null;
      return {
        ...row,
        full_name: row.full_name ?? profile?.full_name ?? null,
        profile_role: profile?.role ?? null,
      };
    });

    res.json({ customers, source: 'supabase' });
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
      .select(
        'id, profile_id, email, full_name, phone, company_name, tax_id, notes, created_at, updated_at',
      )
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('[customers] fetch for patch:', fetchError);
      return res.status(500).json({ error: 'No se pudo cargar el cliente' });
    }
    if (!existing) {
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

    let customerRow = existing;
    if (Object.keys(patch).length > 0) {
      const { data: updated, error: updateError } = await supabase
        .from('store_customers')
        .update(patch)
        .eq('id', id)
        .select(
          'id, profile_id, email, full_name, phone, company_name, tax_id, notes, created_at, updated_at',
        )
        .single();

      if (updateError) {
        console.error('[customers] patch error:', updateError);
        return res.status(500).json({ error: 'No se pudo actualizar el cliente' });
      }
      customerRow = updated;
    }

    let profileRole = null;
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

      profileRole = profile?.role ?? null;

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
      } else if (body.full_name !== undefined && profile) {
        await supabase
          .from('profiles')
          .update({ full_name: trimOrNull(body.full_name) })
          .eq('id', existing.profile_id);
      }
    }

    res.json({
      customer: {
        ...customerRow,
        full_name: customerRow.full_name ?? null,
        profile_role: profileRole,
      },
      source: 'supabase',
    });
  } catch (error) {
    next(error);
  }
});
