import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/product';

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
}

const DEMO_TOKEN_KEY = 'haistore_demo_token';

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
