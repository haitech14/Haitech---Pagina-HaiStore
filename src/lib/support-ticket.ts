export type SupportTicketType = 'contact' | 'subscription_ruleta';

export interface SupportTicketPayload {
  name: string;
  email: string;
  message: string;
  phone?: string;
  country?: string;
  type?: SupportTicketType;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface SupportTicketResponse {
  id: string;
  status?: string;
  code?: string;
  connected?: boolean;
  demo?: boolean;
  local?: boolean;
}

export class SupportTicketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupportTicketError';
  }
}

export async function submitSupportTicket(
  payload: SupportTicketPayload,
): Promise<SupportTicketResponse> {
  const response = await fetch('/api/support/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    id?: string;
    status?: string;
    code?: string;
    connected?: boolean;
    demo?: boolean;
    local?: boolean;
  };

  if (!response.ok) {
    throw new SupportTicketError(
      body.error ??
        (response.status === 429
          ? 'Demasiados envíos. Espera un momento e intenta de nuevo.'
          : 'No se pudo enviar el mensaje. Intenta de nuevo.'),
    );
  }

  if (!body.id) {
    throw new SupportTicketError('Respuesta inválida del servidor.');
  }

  return {
    id: body.id,
    ...(body.status ? { status: body.status } : {}),
    ...(body.code ? { code: body.code } : {}),
    ...(body.connected === true ? { connected: true } : {}),
    ...(body.demo === true || body.local === true ? { demo: true } : {}),
    ...(body.local === true ? { local: true } : {}),
  };
}
