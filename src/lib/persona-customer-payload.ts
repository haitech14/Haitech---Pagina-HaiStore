import {
  emptyPersonaData,
  type PersonaData,
  type PersonaDataKey,
} from '@/lib/persona-report-columns';

export type { PersonaDataKey };
import type { StoreCustomerWithRole } from '@/types/store';

export type PersonaCustomerFormValues = PersonaData & {
  profile_role: string;
};

export function customerToPersonaForm(customer: StoreCustomerWithRole): PersonaCustomerFormValues {
  const base = emptyPersonaData();
  const fromJson: Partial<PersonaData> = customer.persona_data ?? {};

  for (const key of Object.keys(base) as PersonaDataKey[]) {
    const raw = fromJson[key];
    base[key] = typeof raw === 'string' ? raw.trim() : '';
  }

  if (!base.numero_documento) base.numero_documento = customer.tax_id?.trim() ?? '';
  if (!base.nombre_razon_social) base.nombre_razon_social = customer.company_name?.trim() ?? '';
  if (!base.contacto) base.contacto = customer.nombre_contacto?.trim() ?? customer.full_name?.trim() ?? '';
  if (!base.correo_principal) base.correo_principal = customer.email?.trim() ?? '';
  if (!base.telefono_principal) base.telefono_principal = customer.phone?.trim() ?? '';
  if (!base.direccion) base.direccion = customer.direccion?.trim() ?? '';
  if (!base.observaciones) base.observaciones = customer.notes?.trim() ?? '';

  return {
    ...base,
    profile_role: customer.profile_role ?? customer.tipo_cliente ?? 'public',
  };
}

export function emptyPersonaCustomerForm(): PersonaCustomerFormValues {
  return {
    ...emptyPersonaData(),
    profile_role: 'public',
  };
}

export function personaFormToApiBody(values: PersonaCustomerFormValues) {
  const persona_data = emptyPersonaData();
  for (const key of Object.keys(persona_data) as PersonaDataKey[]) {
    persona_data[key] = values[key].trim();
  }

  return {
    persona_data,
    profile_role: values.profile_role,
    email: values.correo_principal.trim() || undefined,
    full_name: values.contacto.trim() || values.nombre_razon_social.trim() || undefined,
    phone: values.telefono_principal.trim() || undefined,
    company_name: values.nombre_razon_social.trim() || undefined,
    tax_id: values.numero_documento.trim() || undefined,
    nombre_contacto: values.contacto.trim() || undefined,
    direccion: values.direccion.trim() || undefined,
    notes: values.observaciones.trim() || undefined,
    tipo_cliente: values.profile_role,
  };
}
