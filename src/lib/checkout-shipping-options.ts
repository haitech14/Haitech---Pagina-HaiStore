import type {
  CheckoutDestinoEnvio,
  CheckoutLimaTransporte,
  CheckoutProvinciaAgencia,
  CheckoutProvinciaEntrega,
  HaitechClientFormValues,
} from '@/lib/haitech-client-schema';

export const CHECKOUT_LIMA_TRANSPORTE_OPTIONS: ReadonlyArray<{
  id: CheckoutLimaTransporte;
  label: string;
  approxPen: number;
  description: string;
}> = [
  {
    id: 'camioneta',
    label: 'Camioneta',
    approxPen: 100,
    description: 'Según distrito seleccionado',
  },
  {
    id: 'minivan',
    label: 'Minivan',
    approxPen: 70,
    description: 'Entrega estándar en Lima',
  },
  {
    id: 'motorizado',
    label: 'Motorizado',
    approxPen: 18,
    description: 'Paquetes livianos y urgentes',
  },
];

export const CHECKOUT_PROVINCIA_AGENCIA_OPTIONS: ReadonlyArray<{
  id: CheckoutProvinciaAgencia;
  label: string;
}> = [
  { id: 'olva', label: 'Olva Courier' },
  { id: 'shalom', label: 'Shalom' },
  { id: 'urbano', label: 'Urbano' },
];

export const CHECKOUT_PROVINCIA_ENTREGA_OPTIONS: ReadonlyArray<{
  id: CheckoutProvinciaEntrega;
  label: string;
  description: string;
}> = [
  {
    id: 'agencia',
    label: 'Recojo en agencia',
    description: 'Retiras el pedido en la sede de la agencia',
  },
  {
    id: 'domicilio',
    label: 'Entrega a domicilio',
    description: 'Envío a la dirección indicada (costo adicional)',
  },
];

export function formatLimaTransportApprox(
  transport: CheckoutLimaTransporte,
  ciudad?: string | null,
): string {
  const option = CHECKOUT_LIMA_TRANSPORTE_OPTIONS.find((row) => row.id === transport);
  if (!option) return '';
  const base = `~S/ ${option.approxPen} aprox.`;
  if (transport === 'camioneta' && ciudad?.trim()) {
    return `${base} (${ciudad.trim()})`;
  }
  return base;
}

const PROVINCIA_AGENCIA_COST_PEN: Record<CheckoutProvinciaAgencia, number> = {
  olva: 35,
  shalom: 28,
  urbano: 45,
};

const PROVINCIA_DOMICILIO_EXTRA_PEN = 25;

export interface CheckoutShippingQuote {
  pen: number;
  label: string;
}

export function resolveCheckoutShippingQuote(
  client: Pick<
    HaitechClientFormValues,
    'destinoEnvio' | 'transporteLima' | 'agenciaProvincia' | 'modalidadProvincia' | 'ciudad'
  >,
  options?: { freeShipping?: boolean },
): CheckoutShippingQuote | null {
  if (options?.freeShipping) {
    return { pen: 0, label: 'Cupón envío gratis' };
  }

  const destino = client.destinoEnvio ?? 'lima';

  if (destino === 'lima') {
    if (!client.transporteLima) return null;
    const option = CHECKOUT_LIMA_TRANSPORTE_OPTIONS.find((row) => row.id === client.transporteLima);
    if (!option) return null;
    return { pen: option.approxPen, label: option.label };
  }

  if (!client.agenciaProvincia) return null;

  const agency =
    CHECKOUT_PROVINCIA_AGENCIA_OPTIONS.find((row) => row.id === client.agenciaProvincia)?.label ??
    client.agenciaProvincia;
  const basePen = PROVINCIA_AGENCIA_COST_PEN[client.agenciaProvincia] ?? 35;
  const pen =
    client.modalidadProvincia === 'domicilio'
      ? basePen + PROVINCIA_DOMICILIO_EXTRA_PEN
      : basePen;
  const mode =
    client.modalidadProvincia === 'domicilio' ? 'a domicilio' : 'recojo en agencia';

  return { pen, label: `${agency} · ${mode}` };
}

export function buildCheckoutShippingNotes(input: {
  destinoEnvio?: CheckoutDestinoEnvio;
  transporteLima?: CheckoutLimaTransporte | null;
  agenciaProvincia?: CheckoutProvinciaAgencia | null;
  modalidadProvincia?: CheckoutProvinciaEntrega | null;
  atencionEntrega?: string | null;
  dniEntrega?: string | null;
  ciudad?: string | null;
}): string | null {
  const parts: string[] = [];
  const destino = input.destinoEnvio ?? 'lima';

  if (destino === 'lima' && input.transporteLima) {
    const label =
      CHECKOUT_LIMA_TRANSPORTE_OPTIONS.find((row) => row.id === input.transporteLima)?.label ??
      input.transporteLima;
    parts.push(
      `Envío Lima: ${label} (${formatLimaTransportApprox(input.transporteLima, input.ciudad)})`,
    );
  }

  if (destino === 'provincia') {
    if (input.agenciaProvincia) {
      const agency =
        CHECKOUT_PROVINCIA_AGENCIA_OPTIONS.find((row) => row.id === input.agenciaProvincia)?.label ??
        input.agenciaProvincia;
      parts.push(`Agencia: ${agency}`);
    }
    if (input.modalidadProvincia) {
      const mode =
        CHECKOUT_PROVINCIA_ENTREGA_OPTIONS.find((row) => row.id === input.modalidadProvincia)?.label ??
        input.modalidadProvincia;
      parts.push(`Entrega: ${mode}`);
    }
    if (input.atencionEntrega?.trim()) {
      parts.push(`Atención: ${input.atencionEntrega.trim()}`);
    }
    if (input.dniEntrega?.trim()) {
      parts.push(`DNI entrega: ${input.dniEntrega.trim()}`);
    }
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}
