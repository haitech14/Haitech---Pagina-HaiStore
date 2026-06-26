import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/product';

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
}

const DEMO_TOKEN_KEY = 'haistore_demo_token';
const AUTH_SESSION_KEY = 'haistore_auth_session_v1';

export interface StoredAuthSession {
  user: AuthUser | null;
  role: UserRole | 'public';
  authProvider: 'supabase' | 'demo' | null;
}

export function readStoredAuthSession(): StoredAuthSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
}

export function writeStoredAuthSession(session: StoredAuthSession): void {
  try {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* quota / privado */
  }
}

export function clearStoredAuthSession(): void {
  try {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getDemoToken(): string | null {
  return localStorage.getItem(DEMO_TOKEN_KEY);
}

export function setDemoToken(token: string | null) {
  if (token) localStorage.setItem(DEMO_TOKEN_KEY, token);
  else localStorage.removeItem(DEMO_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) return data.session.access_token;
  const demo = getDemoToken();
  if (demo) return demo;
  return null;
}

export async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
