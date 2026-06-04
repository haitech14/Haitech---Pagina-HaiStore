/** Claves estables en `store_customers.persona_data` (espejo del Excel Persona). */
export type PersonaDataKey =
  | 'tipo_documento'
  | 'numero_documento'
  | 'nombre_razon_social'
  | 'direccion'
  | 'referencia'
  | 'correo_principal'
  | 'correo_secundario'
  | 'telefono_principal'
  | 'ubigeo'
  | 'pais_emisor'
  | 'estado'
  | 'tipo_sunat'
  | 'tipo_persona'
  | 'tipo_precio'
  | 'categoria'
  | 'canal_ruta'
  | 'frecuencia_visita'
  | 'dia_visita'
  | 'linea_credito'
  | 'fecha_nacimiento'
  | 'contacto'
  | 'vendedor'
  | 'observaciones';

export type PersonaData = Record<PersonaDataKey, string>;

/** Encabezados exactos del Excel (fila 1). */
export const PERSONA_EXCEL_HEADERS: Record<PersonaDataKey, string> = {
  tipo_documento: 'TIPO DE DOCUMENTO',
  numero_documento: 'NÚMERO DE DOCUMENTO',
  nombre_razon_social: 'NOMBRE O RAZÓN SOCIAL',
  direccion: 'DIRECCIÓN',
  referencia: 'REFERENCIA',
  correo_principal: 'CORREO PRINCIPAL',
  correo_secundario: 'CORREO SECUNDARIO',
  telefono_principal: 'TELÉFONO PRINCIPAL',
  ubigeo: 'UBIGEO',
  pais_emisor: 'PAÍS EMISOR',
  estado: 'ESTADO',
  tipo_sunat: 'TIPO SUNAT',
  tipo_persona: 'TIPO PERSONA',
  tipo_precio: 'TIPO PRECIO',
  categoria: 'CATEGORÍA',
  canal_ruta: 'CANAL RUTA',
  frecuencia_visita: 'FRECUENCIA VISITA',
  dia_visita: 'DÍA VISITA',
  linea_credito: 'LINEA DE CRÉDITO',
  fecha_nacimiento: 'FECHA NACIMIENTO',
  contacto: 'CONTACTO',
  vendedor: 'VENDEDOR',
  observaciones: 'OBSERVACIONES',
};

/** Columnas visibles en la tabla de clientes (listado operativo). */
export type CustomerListColumnKey =
  | 'tipo_cliente'
  | 'productos_interes'
  | Extract<
      PersonaDataKey,
      | 'numero_documento'
      | 'nombre_razon_social'
      | 'direccion'
      | 'correo_principal'
      | 'telefono_principal'
      | 'contacto'
    >;

export const CUSTOMER_LIST_COLUMNS: Array<{
  key: CustomerListColumnKey;
  label: string;
  minWidth?: string;
}> = [
  { key: 'tipo_cliente', label: 'Tipo de Cliente', minWidth: '10rem' },
  { key: 'numero_documento', label: 'Nro. Doc', minWidth: '7.5rem' },
  { key: 'nombre_razon_social', label: 'Nombre o Razón Social', minWidth: '12rem' },
  { key: 'direccion', label: 'Dirección', minWidth: '14rem' },
  { key: 'correo_principal', label: 'Correo Principal', minWidth: '10rem' },
  { key: 'telefono_principal', label: 'Celular', minWidth: '7rem' },
  { key: 'contacto', label: 'Contacto', minWidth: '7rem' },
  { key: 'productos_interes', label: 'Productos', minWidth: '10rem' },
];

export const PERSONA_REPORT_COLUMNS: Array<{
  key: PersonaDataKey;
  label: string;
  minWidth?: string;
}> = [
  { key: 'tipo_documento', label: 'Tipo doc.', minWidth: '6.5rem' },
  { key: 'numero_documento', label: 'Nº documento', minWidth: '7.5rem' },
  { key: 'nombre_razon_social', label: 'Razón social', minWidth: '12rem' },
  { key: 'direccion', label: 'Dirección', minWidth: '14rem' },
  { key: 'referencia', label: 'Referencia', minWidth: '7rem' },
  { key: 'correo_principal', label: 'Correo principal', minWidth: '10rem' },
  { key: 'correo_secundario', label: 'Correo secundario', minWidth: '10rem' },
  { key: 'telefono_principal', label: 'Teléfono', minWidth: '7rem' },
  { key: 'ubigeo', label: 'Ubigeo', minWidth: '5.5rem' },
  { key: 'pais_emisor', label: 'País', minWidth: '4.5rem' },
  { key: 'estado', label: 'Estado', minWidth: '6.5rem' },
  { key: 'tipo_sunat', label: 'Tipo SUNAT', minWidth: '6.5rem' },
  { key: 'tipo_persona', label: 'Tipo persona', minWidth: '6.5rem' },
  { key: 'tipo_precio', label: 'Tipo precio', minWidth: '7rem' },
  { key: 'categoria', label: 'Categoría', minWidth: '7rem' },
  { key: 'canal_ruta', label: 'Canal ruta', minWidth: '7rem' },
  { key: 'frecuencia_visita', label: 'Frecuencia', minWidth: '6.5rem' },
  { key: 'dia_visita', label: 'Día visita', minWidth: '6rem' },
  { key: 'linea_credito', label: 'Línea crédito', minWidth: '6.5rem' },
  { key: 'fecha_nacimiento', label: 'F. nacimiento', minWidth: '6.5rem' },
  { key: 'contacto', label: 'Contacto', minWidth: '7rem' },
  { key: 'vendedor', label: 'Vendedor', minWidth: '6.5rem' },
  { key: 'observaciones', label: 'Observaciones', minWidth: '10rem' },
];

const HEADER_TO_KEY = new Map(
  Object.entries(PERSONA_EXCEL_HEADERS).map(([key, header]) => [
    normalizeHeader(header),
    key as PersonaDataKey,
  ]),
);

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function excelHeaderToPersonaKey(header: string): PersonaDataKey | null {
  return HEADER_TO_KEY.get(normalizeHeader(header)) ?? null;
}

export function emptyPersonaData(): PersonaData {
  return Object.fromEntries(
    PERSONA_REPORT_COLUMNS.map(({ key }) => [key, '']),
  ) as PersonaData;
}

type PersonaCustomerSource = {
  persona_data?: PersonaData | null;
  company_name?: string | null;
  full_name?: string | null;
  email?: string;
  phone?: string | null;
  tax_id?: string | null;
  direccion?: string | null;
  nombre_contacto?: string | null;
  notes?: string | null;
  tipo_cliente?: string | null;
  profile_role?: string | null;
  created_at?: string;
};

export function getCustomerListCellValue(
  customer: PersonaCustomerSource,
  key: CustomerListColumnKey,
): string {
  if (key === 'tipo_cliente' || key === 'productos_interes') {
    return '';
  }
  return getPersonaCellValue(customer, key);
}

export function getPersonaCellValue(
  customer: PersonaCustomerSource,
  key: PersonaDataKey,
): string {
  const fromJson = customer.persona_data?.[key]?.trim();
  if (fromJson) return fromJson;

  switch (key) {
    case 'numero_documento':
      return customer.tax_id?.trim() ?? '';
    case 'nombre_razon_social':
      return customer.company_name?.trim() ?? '';
    case 'contacto':
      return customer.nombre_contacto?.trim() ?? customer.full_name?.trim() ?? '';
    case 'correo_principal':
      return customer.email?.trim() ?? '';
    case 'telefono_principal':
      return customer.phone?.trim() ?? '';
    case 'direccion':
      return customer.direccion?.trim() ?? '';
    case 'tipo_precio':
      return customer.persona_data?.tipo_precio?.trim() ?? customer.tipo_cliente ?? customer.profile_role ?? '';
    case 'observaciones':
      return customer.notes?.trim() ?? '';
    default:
      return '';
  }
}

export function personaDataToSearchBlob(persona: PersonaData | null | undefined): string {
  if (!persona) return '';
  return Object.values(persona).join(' ').toLowerCase();
}
