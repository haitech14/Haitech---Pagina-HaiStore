import { mapHaiSupportTipoClienteToRole } from './haisupport-customers.js';

const VALID_ROLES = new Set([
  'public',
  'corporativo',
  'tecnico',
  'mayorista',
  'distribuidor',
  'vip',
  'admin',
]);

/** @param {string | null | undefined} role */
export function mapRoleToHaiSupportTipoCliente(role) {
  const norm = String(role ?? 'public').trim().toLowerCase();
  if (norm === 'tecnico') return 'tecnico';
  if (norm === 'distribuidor') return 'distribuidor';
  if (norm === 'mayorista') return 'mayorista';
  if (norm === 'corporativo') return 'corporativo';
  if (norm === 'vip') return 'vip';
  return 'cliente_publico';
}

function cityFromBilling(billing) {
  if (!billing || typeof billing !== 'object') return '';
  const raw = billing.city ?? billing.ciudad ?? billing.address_level2;
  return typeof raw === 'string' ? raw.trim() : '';
}

function addressFromBilling(billing) {
  if (!billing || typeof billing !== 'object') return '';
  const raw = billing.address ?? billing.direccion ?? billing.line1;
  return typeof raw === 'string' ? raw.trim() : '';
}

/** @param {Record<string, unknown>} row store_customers */
export function storeCustomerRowToHaitechClient(row) {
  const billing = row.default_billing && typeof row.default_billing === 'object' ? row.default_billing : {};
  const tipo =
    row.tipo_cliente && VALID_ROLES.has(String(row.tipo_cliente))
      ? String(row.tipo_cliente)
      : mapHaiSupportTipoClienteToRole(row.tipo_cliente);

  return {
    id: row.id ? String(row.id) : null,
    storeCustomerId: row.id ? String(row.id) : null,
    haisupportClientId: row.haisupport_client_id ? String(row.haisupport_client_id) : null,
    nombre: String(row.company_name ?? row.full_name ?? '').trim(),
    nombreContacto: String(row.nombre_contacto ?? row.full_name ?? row.company_name ?? '').trim(),
    rucDni: String(row.tax_id ?? '').trim(),
    telefono: String(row.phone ?? '').trim(),
    direccion: String(row.direccion ?? addressFromBilling(billing)).trim(),
    ciudad: String(row.ciudad ?? cityFromBilling(billing)).trim(),
    tipoCliente: VALID_ROLES.has(tipo) ? tipo : 'public',
    email: row.email ? String(row.email).trim() : null,
    notas: row.notes ? String(row.notes).trim() : null,
    persona_data:
      row.persona_data && typeof row.persona_data === 'object' ? row.persona_data : {},
    source: row.source === 'haisupport' ? 'haisupport' : 'haistore',
  };
}

/** @param {import('./haitech-mappers.js').HaitechClientLike} client */
export function haitechClientToStoreCustomerRow(client, existingId) {
  const role = client.tipoCliente ?? client.tipo_cliente ?? 'public';
  const email =
    client.email?.trim() ||
    (client.rucDni ? `${String(client.rucDni).replace(/\W/g, '')}@cliente.haitech.pe` : null) ||
    `${Date.now()}@cliente.haitech.pe`;

  return {
    id: existingId ?? client.storeCustomerId ?? client.id ?? undefined,
    email,
    full_name: client.nombreContacto || client.nombre,
    phone: client.telefono || null,
    company_name: client.nombre || null,
    tax_id: client.rucDni || null,
    nombre_contacto: client.nombreContacto || null,
    direccion: client.direccion || null,
    ciudad: client.ciudad || null,
    tipo_cliente: VALID_ROLES.has(role) ? role : 'public',
    notes: client.notas || null,
    source: client.source === 'haisupport' ? 'haisupport' : 'haistore',
    haisupport_client_id: client.haisupportClientId ?? null,
    persona_data:
      client.persona_data && typeof client.persona_data === 'object'
        ? client.persona_data
        : {},
    default_billing: {
      city: client.ciudad || null,
      ciudad: client.ciudad || null,
      address: client.direccion || null,
      direccion: client.direccion || null,
      price_list: VALID_ROLES.has(role) ? role : 'public',
    },
    updated_at: new Date().toISOString(),
  };
}

/** @param {Record<string, unknown>} row HaiSupport clients */
export function haisupportClientRowToHaitechClient(row) {
  return {
    id: String(row.id),
    storeCustomerId: null,
    haisupportClientId: String(row.id),
    nombre: String(row.nombre ?? '').trim(),
    nombreContacto: String(row.nombre_contacto ?? row.nombre ?? '').trim(),
    rucDni: String(row.ruc_dni ?? '').trim(),
    telefono: String(row.telefono ?? '').trim(),
    direccion: String(row.direccion ?? '').trim(),
    ciudad: String(row.ciudad ?? '').trim(),
    tipoCliente: mapHaiSupportTipoClienteToRole(row.tipo_cliente),
    email: row.email ? String(row.email).trim() : null,
    notas: row.notas ? String(row.notas).trim() : null,
    source: 'haisupport',
  };
}

/** @param {import('./haitech-mappers.js').HaitechClientLike} client */
export function haitechClientToHaiSupportClientRow(client) {
  return {
    id: client.haisupportClientId ?? client.id ?? undefined,
    nombre: client.nombre,
    nombre_contacto: client.nombreContacto,
    ruc_dni: client.rucDni,
    telefono: client.telefono,
    direccion: client.direccion,
    ciudad: client.ciudad,
    tipo_cliente: mapRoleToHaiSupportTipoCliente(client.tipoCliente),
    email: client.email ?? null,
    notas: client.notas ?? null,
    updated_at: new Date().toISOString(),
  };
}

/** TPV / cotización → HaitechClient */
export function tpvCustomerToHaitechClient(customer) {
  return {
    storeCustomerId: customer.storeCustomerId ?? null,
    nombre: String(customer.razonSocial ?? '').trim(),
    nombreContacto: String(customer.atencion ?? customer.razonSocial ?? '').trim(),
    rucDni: String(customer.documento ?? '').trim(),
    telefono: String(customer.celular ?? '').trim(),
    direccion: String(customer.direccion ?? '').trim(),
    ciudad: String(customer.ciudad ?? 'Lima').trim(),
    tipoCliente: customer.priceList ?? 'public',
    source: 'haistore',
  };
}

/** HaitechClient → TPV customer partial */
export function haitechClientToTpvCustomer(client, currency = 'PEN') {
  return {
    storeCustomerId: client.storeCustomerId ?? client.id ?? null,
    razonSocial: client.nombre,
    documento: client.rucDni,
    atencion: client.nombreContacto,
    celular: client.telefono,
    direccion: client.direccion || 'Lima',
    ciudad: client.ciudad || 'Lima',
    priceList: client.tipoCliente ?? 'public',
    currency,
  };
}

/** @param {Record<string, unknown>} payload inbound webhook */
export function inboundPayloadToHaitechClient(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      nombre: '',
      nombreContacto: '',
      rucDni: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      tipoCliente: 'public',
    };
  }

  return {
    id: payload.id ? String(payload.id) : null,
    storeCustomerId: payload.storeCustomerId ?? payload.store_customer_id ?? null,
    haisupportClientId: payload.haisupportClientId ?? payload.haisupport_client_id ?? payload.id ?? null,
    nombre: String(payload.nombre ?? payload.company_name ?? payload.companyName ?? payload.razonSocial ?? '').trim(),
    nombreContacto: String(
      payload.nombre_contacto ?? payload.nombreContacto ?? payload.full_name ?? payload.fullName ?? payload.atencion ?? '',
    ).trim(),
    rucDni: String(payload.ruc_dni ?? payload.rucDni ?? payload.tax_id ?? payload.taxId ?? payload.documento ?? '').trim(),
    telefono: String(payload.telefono ?? payload.phone ?? payload.celular ?? '').trim(),
    direccion: String(payload.direccion ?? payload.address ?? '').trim(),
    ciudad: String(payload.ciudad ?? payload.city ?? '').trim(),
    tipoCliente: mapHaiSupportTipoClienteToRole(
      payload.tipo_cliente ?? payload.tipoCliente ?? payload.profile_role ?? payload.priceList,
    ),
    email: payload.email ? String(payload.email).trim() : null,
    notas: payload.notas ?? payload.notes ? String(payload.notas ?? payload.notes).trim() : null,
    persona_data:
      payload.persona_data && typeof payload.persona_data === 'object'
        ? payload.persona_data
        : payload.personaData && typeof payload.personaData === 'object'
          ? payload.personaData
          : {},
    source: payload.source === 'haisupport' ? 'haisupport' : 'haistore',
  };
}
