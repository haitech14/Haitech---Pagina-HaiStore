export interface HaibotSupportFormValues {
  clientName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  equipment: string;
  problem: string;
}

export function generateHaibotServiceOrderCode(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `SV-${year}-${seq}`;
}

function formatServiceDate(): string {
  return new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Texto operativo de orden de servicio para copiar / WhatsApp. */
export function buildHaibotServiceOrderMessage(
  form: HaibotSupportFormValues,
  code: string,
): string {
  const client = form.clientName.trim();
  const contact = form.contactName.trim();
  const phone = form.phone.trim();
  const city = form.city.trim();
  const address = form.address.trim();
  const equipment = form.equipment.trim();
  const problem = form.problem.trim();

  return [
    `🔧 *Orden de servicio ${code}*`,
    `📅 ${formatServiceDate()}`,
    '',
    '🙋 *Datos del cliente:*',
    `*Cliente:* ${client}`,
    contact ? `*Contacto:* ${contact}` : null,
    form.email.trim() ? `*Correo:* ${form.email.trim()}` : null,
    phone ? `*Teléfono:* ${phone}` : null,
    city ? `*Ciudad:* ${city}` : null,
    address ? `*Dirección:* ${address}` : null,
    '',
    '🖨️ *Equipo:*',
    equipment,
    '',
    '⚠️ *Problema reportado:*',
    problem,
    '',
    '— Registrado vía Haibot · HaiStore',
  ]
    .filter((line): line is string => line != null && line.length > 0)
    .join('\n');
}

export function emptyHaibotSupportForm(): HaibotSupportFormValues {
  return {
    clientName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    equipment: '',
    problem: '',
  };
}

export function validateHaibotSupportForm(form: HaibotSupportFormValues): string | null {
  if (!form.clientName.trim()) return 'Indica el nombre del cliente o empresa.';
  if (!form.equipment.trim()) return 'Indica el modelo del equipo.';
  if (!form.problem.trim()) return 'Describe el problema o servicio solicitado.';
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Introduce un correo válido o déjalo vacío.';
  }
  return null;
}
