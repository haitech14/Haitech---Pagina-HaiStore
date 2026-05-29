import { randomBytes } from 'crypto';

import { resolvePriceRole } from './roles.js';
import { isSupabaseAuthEnabled, verifySupabaseToken } from './supabase-auth.js';

/** @type {Map<string, { id?: string; email: string; name: string; role: string }>} */
const demoSessions = new Map();

const demoUsers = [
  { email: 'admin@haitech.pe', password: 'admin123', name: 'Administrador', role: 'admin' },
  { email: 'mayorista@haitech.pe', password: 'demo123', name: 'Cliente Mayorista', role: 'mayorista' },
  {
    email: 'distribuidor@haitech.pe',
    password: 'demo123',
    name: 'Cliente Distribuidor',
    role: 'distribuidor',
  },
  { email: 'corporativo@haitech.pe', password: 'demo123', name: 'Cliente Corporativo', role: 'corporativo' },
  { email: 'tecnico@haitech.pe', password: 'demo123', name: 'Cliente Técnico', role: 'tecnico' },
  { email: 'vip@haitech.pe', password: 'demo123', name: 'Cliente VIP', role: 'vip' },
  { email: 'publico@haitech.pe', password: 'demo123', name: 'Cliente Público', role: 'public' },
];

export function authenticateDemo(email, password) {
  const user = demoUsers.find(
    (entry) => entry.email === email.trim().toLowerCase() && entry.password === password,
  );
  if (!user) return null;

  const token = randomBytes(32).toString('hex');
  const sessionUser = { email: user.email, name: user.name, role: user.role };
  demoSessions.set(token, sessionUser);
  return { token, user: sessionUser };
}

export function getDemoSession(token) {
  if (!token) return null;
  return demoSessions.get(token) ?? null;
}

export function destroyDemoSession(token) {
  demoSessions.delete(token);
}

export async function resolveUserFromToken(token) {
  if (!token) return null;

  if (isSupabaseAuthEnabled()) {
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) return supabaseUser;
  }

  return getDemoSession(token);
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = await resolveUserFromToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Sesión no válida o expirada' });
  }

  req.user = user;
  req.token = token;
  next();
}

export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Se requiere rol de administrador' });
    }
    next();
  });
}

export async function resolveRequestRole(req) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = await resolveUserFromToken(token);
  if (user) return resolvePriceRole(user.role);
  return 'public';
}
