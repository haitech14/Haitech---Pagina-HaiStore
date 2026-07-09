export interface IntegrationConnectionStatus {
  configured: boolean;
  connected: boolean;
  mode: string;
  url?: string | null;
  remote?: boolean;
  table?: string;
  tables?: Record<string, string>;
  error?: string;
}

export interface IntegrationsHealthResponse {
  ok: boolean;
  ts: string;
  auth: {
    unified: boolean;
    warnings: string[];
  };
  haisupport: IntegrationConnectionStatus;
  haisales: IntegrationConnectionStatus;
}
