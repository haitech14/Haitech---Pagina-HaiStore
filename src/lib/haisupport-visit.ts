import { apiFetch } from '@/lib/api';
import type { MaintenanceVisitState } from '@/data/maintenance-visit';
import type { MaintenanceVisitQuote } from '@/data/maintenance-visit';
import { VISIT_ATTENTION_HOURS } from '@/data/maintenance-visit';

export interface HaiSupportRegisteredEquipment {
  id: string;
  model: string;
  serial: string;
  lastTicket: string | null;
  lastStatus: string | null;
}

export interface HaiSupportVisitClient {
  id: string | null;
  nombre: string;
  nombreContacto: string;
  telefono: string;
  email: string | null;
  direccion: string;
  referencia: string;
  ciudad: string;
  distrito: string;
  tipoCliente: string;
  companyId: string | null;
}

export interface HaiSupportClientLookup {
  found: boolean;
  configured: boolean;
  client: HaiSupportVisitClient | null;
  equipment: HaiSupportRegisteredEquipment[];
}

export interface HaiSupportVisitCreated {
  id: string | null;
  numeroTicket: string;
  connected: boolean;
}

export function applyHaiSupportToVisitFields<
  T extends {
    atencion: string;
    celular: string;
    address: string;
    reference: string;
    city: string;
    district: string;
    razonSocial: string;
  },
>(current: T, lookup: HaiSupportClientLookup): T {
  const client = lookup.client;
  if (!client) return current;

  return {
    ...current,
    razonSocial: current.razonSocial.trim() ? current.razonSocial : client.nombre || current.razonSocial,
    atencion: client.nombreContacto || current.atencion,
    celular: client.telefono || current.celular,
    address: current.address.trim() ? current.address : client.direccion || current.address,
    reference: current.reference.trim() ? current.reference : client.referencia || current.reference,
    city: current.city.trim() && current.city.trim().toLowerCase() !== 'lima' ? current.city : client.ciudad || current.city,
    district: current.district.trim() ? current.district : client.distrito || current.district,
  };
}

export async function fetchHaiSupportVisitClient(ruc: string): Promise<HaiSupportClientLookup> {
  const numero = ruc.replace(/\D/g, '');
  return apiFetch<HaiSupportClientLookup>(`/api/haisupport/client?ruc=${encodeURIComponent(numero)}`);
}

export async function createHaiSupportVisit(
  state: MaintenanceVisitState,
  quote: MaintenanceVisitQuote,
): Promise<HaiSupportVisitCreated> {
  return apiFetch<HaiSupportVisitCreated>('/api/haisupport/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ruc: state.ruc,
      razonSocial: state.razonSocial,
      atencion: state.atencion,
      celular: state.celular,
      address: state.address,
      reference: state.reference,
      city: state.city,
      district: state.district,
      modelLabel: quote.modelLabel,
      serialNumber: state.serialNumber,
      counter: state.counter,
      defecto: quote.faultLabel || quote.serviceLabel,
      serviceLabel: quote.serviceLabel,
      defectId: state.defectId,
      technicianName: quote.technicianName,
      visitDate: state.visitDate,
      visitHour: state.visitHour,
      visitPen: quote.visitPen,
      printType: quote.printType,
      paperFormat: quote.paperFormat,
      quantity: state.quantity,
      includesPackage: quote.includesPackage,
      imageName: state.imageName,
      shiftLabel: quote.shiftLabel,
      horarioAtencion: `${VISIT_ATTENTION_HOURS} · ${quote.shiftLabel} · ${quote.slotLabel}`,
    }),
  });
}
