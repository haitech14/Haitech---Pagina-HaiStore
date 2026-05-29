/**
 * Cliente ligero para la integración con HaiSupport.
 *
 * Si HAISUPPORT_API_URL / HAISUPPORT_API_KEY no están configuradas,
 * funciona en modo "demo" y solo registra el ticket en consola.
 */

const API_URL = process.env.HAISUPPORT_API_URL;
const API_KEY = process.env.HAISUPPORT_API_KEY;

export async function createSupportTicket({ name, email, message }) {
  if (!API_URL || !API_KEY) {
    console.log('[haisupport] modo demo — ticket simulado:', { name, email });
    return { id: `demo-${Date.now()}`, status: 'queued', demo: true };
  }

  const response = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ name, email, message, source: 'haistore-web' }),
  });

  if (!response.ok) {
    throw new Error(`HaiSupport respondió ${response.status}`);
  }

  return response.json();
}
