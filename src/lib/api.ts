import { authHeaders, setDemoToken } from '@/lib/auth-storage';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}

function apiConnectionErrorMessage(): string {
  return import.meta.env.PROD
    ? 'No hay conexión con el servidor. Revisa el despliegue de la API en Vercel.'
    : 'No hay conexión con la API admin. Ejecuta «npm run dev:all» o «npm run server» (puerto 3080).';
}

function isTransientApiError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /502|504|conexión con la api|failed to fetch|networkerror|load failed|econnrefused/i.test(
    error.message,
  );
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  let response: Response;

  try {
    response = await fetch(resolveApiUrl(path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(apiConnectionErrorMessage());
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };

    if (response.status === 401) {
      setDemoToken(null);
      throw new Error(
        body.error ??
          'Sesión expirada o no válida. Vuelve a iniciar sesión como administrador.',
      );
    }

    if (response.status === 403) {
      throw new Error(
        body.error ?? 'No tienes permisos de administrador para ver el inventario.',
      );
    }

    if (response.status === 503) {
      throw new Error(
        body.error ??
          'Servicio temporalmente no disponible. Revisa la configuración de Supabase o migraciones.',
      );
    }

    if (response.status === 502 || response.status === 504) {
      throw new Error(apiConnectionErrorMessage());
    }
    throw new Error(body.error ?? `Error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/** Reintenta errores transitorios (API reiniciando, proxy caído, etc.). */
export async function apiFetchWithRetry<T>(
  path: string,
  init?: RequestInit,
  options: { retries?: number; delayMs?: number } = {},
): Promise<T> {
  const { retries = 4, delayMs = 700 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await apiFetch<T>(path, init);
    } catch (error) {
      lastError = error;
      if (!isTransientApiError(error) || attempt >= retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }

  throw lastError;
}
