import { Router } from 'express';

import { hasAdminApiAccess } from '../lib/admin-access.js';
import { authenticateDemo, destroyDemoSession, requireAuth } from '../lib/auth-store.js';
import {
  isSupabaseAuthEnabled,
  upsertProfileFromAuth,
  verifySupabaseToken,
  getSupabaseAdmin,
} from '../lib/supabase-auth.js';

export const authRouter = Router();

/** Login demo (fallback sin Supabase o para pruebas locales). */
authRouter.post('/login-demo', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const result = authenticateDemo(email, password);
  if (!result) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  res.json(result);
});

authRouter.post('/logout', requireAuth, (req, res) => {
  destroyDemoSession(req.token);
  res.json({ ok: true });
});

authRouter.get('/me', async (req, res) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.json({ user: null, role: 'public', authProvider: null });
  }

  const user = await verifySupabaseToken(token);
  if (user) {
    return res.json({ user, role: user.role, authProvider: 'supabase' });
  }

  const demoUser = await import('../lib/auth-store.js').then((m) => m.getDemoSession(token));
  if (demoUser) {
    return res.json({ user: demoUser, role: demoUser.role, authProvider: 'demo' });
  }

  res.json({ user: null, role: 'public', authProvider: null });
});

/** Sincroniza perfil tras registro/login en Supabase (cliente envía JWT). */
authRouter.post('/sync-profile', async (req, res, next) => {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token || !isSupabaseAuthEnabled()) {
      return res.status(400).json({ error: 'Supabase no configurado o sin token' });
    }

    const client = getSupabaseAdmin();
    const {
      data: { user },
      error,
    } = await client.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const profile = await upsertProfileFromAuth(user);
    const sessionUser = await verifySupabaseToken(token);
    res.json({ user: sessionUser, profile });
  } catch (err) {
    next(err);
  }
});

/** Lista perfiles (solo admin). */
authRouter.get('/profiles', requireAuth, async (req, res, next) => {
  try {
    if (!hasAdminApiAccess(req.user)) {
      return res.status(403).json({ error: 'Se requiere rol de administrador' });
    }

    const client = getSupabaseAdmin();
    if (!client) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }

    const { data, error } = await client
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .order('email');

    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    next(err);
  }
});

/** Actualizar rol de un usuario (solo admin). */
authRouter.patch('/profiles/:id', requireAuth, async (req, res, next) => {
  try {
    if (!hasAdminApiAccess(req.user)) {
      return res.status(403).json({ error: 'Se requiere rol de administrador' });
    }

    const client = getSupabaseAdmin();
    if (!client) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }

    const { role, full_name } = req.body ?? {};
    if (!role) {
      return res.status(400).json({ error: 'El campo role es obligatorio' });
    }

    const { data, error } = await client
      .from('profiles')
      .update({
        role,
        ...(full_name != null ? { full_name } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await client.auth.admin.updateUserById(req.params.id, {
      app_metadata: { role },
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});
