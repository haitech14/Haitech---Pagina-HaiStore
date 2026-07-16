export type HaibotSupportSlot = {
  start: string;
  label: string;
};

export async function fetchHaibotSupportAvailability(): Promise<HaibotSupportSlot[]> {
  const response = await fetch('/api/support/availability');
  if (!response.ok) {
    throw new Error('No se pudieron cargar los horarios disponibles.');
  }

  const body = (await response.json().catch(() => ({}))) as {
    slots?: HaibotSupportSlot[];
  };

  if (!Array.isArray(body.slots)) {
    throw new Error('Respuesta inválida de disponibilidad.');
  }

  return body.slots.filter(
    (slot): slot is HaibotSupportSlot =>
      typeof slot?.start === 'string' && typeof slot?.label === 'string',
  );
}
