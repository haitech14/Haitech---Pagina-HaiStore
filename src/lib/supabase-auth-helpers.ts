import { getSupabaseClientAsync } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase-config';

const AUTH_OP_TIMEOUT_MS = 8_000;

function withAuthTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label}-timeout`)), AUTH_OP_TIMEOUT_MS);
    }),
  ]);
}

export async function signOutSupabaseSafely(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = await getSupabaseClientAsync();
    await withAuthTimeout(supabase.auth.signOut(), 'signout');
  } catch {
    try {
      const supabase = await getSupabaseClientAsync();
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      /* sin sesión remota que limpiar */
    }
  }
}

export async function getSupabaseSessionSafely() {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await getSupabaseClientAsync();
    const { data } = await withAuthTimeout(supabase.auth.getSession(), 'getSession');
    return data.session;
  } catch {
    return null;
  }
}

export async function signInWithPasswordSafely(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return {
      data: { session: null, user: null },
      error: { message: 'supabase-not-configured' } as { message: string },
    };
  }

  try {
    const supabase = await getSupabaseClientAsync();
    return await withAuthTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      'signin',
    );
  } catch {
    return {
      data: { session: null, user: null },
      error: { message: 'signin-timeout' } as { message: string },
    };
  }
}

export async function signUpWithPasswordSafely(
  email: string,
  password: string,
  fullName: string,
) {
  if (!isSupabaseConfigured()) {
    return {
      data: { session: null, user: null },
      error: { message: 'supabase-not-configured' } as { message: string },
    };
  }

  try {
    const supabase = await getSupabaseClientAsync();
    return await withAuthTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: 'public' },
        },
      }),
      'signup',
    );
  } catch {
    return {
      data: { session: null, user: null },
      error: { message: 'signup-timeout' } as { message: string },
    };
  }
}

export async function subscribeSupabaseAuthChanges(
  listener: (event: string, session: { access_token?: string } | null) => void,
): Promise<() => void> {
  if (!isSupabaseConfigured()) return () => undefined;

  const supabase = await getSupabaseClientAsync();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    listener(event, session);
  });

  return () => subscription.unsubscribe();
}
