import type { ProformaRecord, ProformaSource } from '@/types/proforma';

export type CotizacionCanalFilter =
  | 'all'
  | 'pdf'
  | 'whatsapp'
  | 'tpv'
  | 'web'
  | 'referral';

/** Canal visible en Ventas → Cotizaciones / Resumen. */
export function cotizacionCanalLabel(proforma: ProformaRecord): string {
  const channel = (proforma.capture?.channelLabel || proforma.capture?.channel || proforma.channel || '')
    .trim()
    .toLowerCase();

  if (proforma.source === 'product' || channel.includes('pdf') || channel.includes('cotización pdf')) {
    return 'Cotización PDF';
  }
  if (channel.includes('whatsapp') || channel.startsWith('whatsapp')) {
    return proforma.capture?.channelLabel?.trim() || 'WhatsApp';
  }
  if (channel.includes('referido') || channel.includes('referral')) {
    return proforma.capture?.channelLabel?.trim() || 'Referido';
  }
  if (proforma.source === 'web') {
    return proforma.capture?.channelLabel?.trim() || 'Lead web';
  }
  if (proforma.source === 'tpv') {
    return 'Mostrador / TPV';
  }
  if (proforma.priceList) {
    return 'Mostrador';
  }
  return 'Cotización';
}

export function cotizacionOrigenBadge(proforma: ProformaRecord): {
  label: string;
  variant: 'default' | 'secondary' | 'outline';
} {
  const canal = cotizacionCanalLabel(proforma);
  if (canal.toLowerCase().includes('whatsapp')) {
    return { label: 'WhatsApp', variant: 'default' };
  }
  if (canal.toLowerCase().includes('pdf')) {
    return { label: 'PDF web', variant: 'secondary' };
  }
  if (canal.toLowerCase().includes('referido')) {
    return { label: 'Referido', variant: 'outline' };
  }
  if (proforma.source === 'web') {
    return { label: 'Lead web', variant: 'outline' };
  }
  return { label: 'Cotización', variant: 'outline' };
}

function channelHaystack(proforma: ProformaRecord): string {
  return [
    proforma.source,
    proforma.channel,
    proforma.capture?.channel,
    proforma.capture?.channelLabel,
    cotizacionCanalLabel(proforma),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function proformaMatchesCanalFilter(
  proforma: ProformaRecord,
  filter: CotizacionCanalFilter,
): boolean {
  if (filter === 'all') return true;
  const hay = channelHaystack(proforma);
  switch (filter) {
    case 'pdf':
      return proforma.source === 'product' || hay.includes('pdf');
    case 'whatsapp':
      return hay.includes('whatsapp');
    case 'referral':
      return hay.includes('referido') || hay.includes('referral');
    case 'tpv':
      return proforma.source === 'tpv' || (hay.includes('mostrador') && !hay.includes('whatsapp'));
    case 'web':
      return (
        proforma.source === 'web' &&
        !hay.includes('whatsapp') &&
        !hay.includes('pdf') &&
        !hay.includes('referido')
      );
    default: {
      const _exhaustive: never = filter;
      return _exhaustive;
    }
  }
}

export function isStorefrontProformaSource(source: ProformaSource | undefined): boolean {
  return source === 'product' || source === 'web';
}
