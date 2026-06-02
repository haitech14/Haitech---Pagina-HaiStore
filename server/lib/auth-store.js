import { createHmac, timingSafeEqual } from 'crypto';

import { hasAdminApiAccess } from './admin-access.js';
import { resolvePriceRole } from './roles.js';
import { isSupabaseAuthEnabled, verifySupabaseToken } from './supabase-auth.js';

/** @type {Map<string, { id?: string; email: string; name: string; role: string }>} */
const demoSessions = new Map();
/** @type {Set<string>} */
const revokedDemoTokens = new Set();
const DEMO_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días
const DEMO_TOKEN_SECRET =
  process.env.HAISTORE_DEMO_TOKEN_SECRET?.trim() || 'haistore-demo-token-dev-secret';

const demoUsers = [
  { email: 'admin@haitech.pe', password: 'admin123', name: 'Administrador', role: 'admin' },
  { email: 'soporte@haitech.pe', password: 'demo123', name: 'Soporte Haitech', role: 'admin' },
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

  const token = createDemoToken(user);
  const sessionUser = { email: user.email, name: user.name, role: user.role };
  demoSessions.set(token, sessionUser);
  revokedDemoTokens.delete(token);
  return { token, user: sessionUser };
}

export function getDemoSession(token) {
  if (!token) return null;
  if (revokedDemoTokens.has(token)) return null;

  const inMemory = demoSessions.get(token);
  if (inMemory) return inMemory;

  return parseDemoToken(token);
}

export function destroyDemoSession(token) {
  demoSessions.delete(token);
  if (token) {
    revokedDemoTokens.add(token);
  }
}

function base64urlEncode(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function signPart(part) {
  return createHmac('sha256', DEMO_TOKEN_SECRET).update(part).digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function createDemoToken(user) {
  const payload = {
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + DEMO_TOKEN_TTL_SECONDS,
  };
  const payloadPart = base64urlEncode(JSON.stringify(payload));
  const signature = signPart(payloadPart);
  return `demo.${payloadPart}.${signature}`;
}

function parseDemoToken(token) {
  if (typeof token !== 'string' || !token.startsWith('demo.')) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [, payloadPart, signature] = parts;
  const expected = signPart(payloadPart);
  if (!safeEqual(signature, expected)) return null;

  try {
    const decoded = Buffer.from(payloadPart, 'base64url').toString('utf8');
    const payload = JSON.parse(decoded);
    if (!payload?.email || !payload?.name || !payload?.role || !payload?.exp) return null;
    if (Number(payload.exp) < Math.floor(Date.now() / 1000)) return null;
    return {
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
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
    if (!hasAdminApiAccess(req.user)) {
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
