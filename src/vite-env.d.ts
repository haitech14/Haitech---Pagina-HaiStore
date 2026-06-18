/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Vacío en Vercel (mismo origen). En dev opcional si la API está en otro host. */
  readonly VITE_API_BASE_URL?: string;
  /** URL del panel web HaiSupport (enlace opcional en flujo Soporte de Haibot). */
  readonly VITE_HAISUPPORT_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
