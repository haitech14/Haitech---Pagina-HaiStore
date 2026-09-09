import type { Product } from '@/types/product';

const MC320FW_EQUIPMENT_PRODUCT_ID = 'cb1e47b2-d784-4bef-ae18-d4dae08723e4';
const IM_C320F_EQUIPMENT_PRODUCT_ID = '481dbc77-436b-464d-b76f-930f7d79f4ff';
const IM_C401F_EQUIPMENT_PRODUCT_ID = '5a142c47-521c-47af-92ec-dda8808907c9';

export type ListedTonerColor = 'Negro' | 'Cyan' | 'Magenta' | 'Amarillo';

export interface ListedOriginalTonerRow {
  id: string;
  code: string;
  color: ListedTonerColor;
  yieldPages: string;
  equipmentModels: string;
  description: string;
  name: string;
  public: number;
  dist: number;
  equipmentIds: readonly string[];
}

export const LISTED_ORIGINAL_TONER_ROWS: readonly ListedOriginalTonerRow[] = [
  {
    id: '842687',
    code: '842687',
    color: 'Negro',
    yieldPages: '10,500',
    equipmentModels: 'M C320 / M C320FW',
    description: 'PRINT CARTRIDGE BLACK M C320H',
    name: 'Toner Original RICOH Negro M C320 (10,500 págs al 5%)',
    public: 185,
    dist: 168.18,
    equipmentIds: [MC320FW_EQUIPMENT_PRODUCT_ID, 'mc320fw'],
  },
  {
    id: '842688',
    code: '842688',
    color: 'Cyan',
    yieldPages: '7,500',
    equipmentModels: 'M C320 / M C320FW',
    description: 'PRINT CARTRIDGE CYAN M C320H',
    name: 'Toner Original RICOH Cyan M C320 (7,500 págs al 5%)',
    public: 210,
    dist: 190.91,
    equipmentIds: [MC320FW_EQUIPMENT_PRODUCT_ID, 'mc320fw'],
  },
  {
    id: '842689',
    code: '842689',
    color: 'Magenta',
    yieldPages: '7,500',
    equipmentModels: 'M C320 / M C320FW',
    description: 'PRINT CARTRIDGE MAGENTA MC320H',
    name: 'Toner Original RICOH Magenta M C320 (7,500 págs al 5%)',
    public: 210,
    dist: 190.91,
    equipmentIds: [MC320FW_EQUIPMENT_PRODUCT_ID, 'mc320fw'],
  },
  {
    id: '842690',
    code: '842690',
    color: 'Amarillo',
    yieldPages: '7,500',
    equipmentModels: 'M C320 / M C320FW',
    description: 'PRINT CARTRIDGE YELLOW MC320H',
    name: 'Toner Original RICOH Amarillo M C320 (7,500 págs al 5%)',
    public: 210,
    dist: 190.91,
    equipmentIds: [MC320FW_EQUIPMENT_PRODUCT_ID, 'mc320fw'],
  },
  {
    id: '842725',
    code: '842725',
    color: 'Negro',
    yieldPages: '16,000',
    equipmentModels: 'IM C320F / IM C320',
    description: 'PRINT CARTRIDGE BLACK IMC320',
    name: 'Toner Original RICOH Negro IM C320F (16,000 págs al 5%)',
    public: 65,
    dist: 59.09,
    equipmentIds: [IM_C320F_EQUIPMENT_PRODUCT_ID, 'im-c320f', 'ricoh-im-c320f-a4'],
  },
  {
    id: '842718',
    code: '842718',
    color: 'Cyan',
    yieldPages: '10,000',
    equipmentModels: 'IM C320F / IM C320',
    description: 'PRINT CARTRIDGE CYAN IM C320',
    name: 'Toner Original RICOH Cyan IM C320F (10,000 págs al 5%)',
    public: 175,
    dist: 159.09,
    equipmentIds: [IM_C320F_EQUIPMENT_PRODUCT_ID, 'im-c320f', 'ricoh-im-c320f-a4'],
  },
  {
    id: '842719',
    code: '842719',
    color: 'Magenta',
    yieldPages: '10,000',
    equipmentModels: 'IM C320F / IM C320',
    description: 'PRINT CARTRIDGE MAGENTA',
    name: 'Toner Original RICOH Magenta IM C320F (10,000 págs al 5%)',
    public: 175,
    dist: 159.09,
    equipmentIds: [IM_C320F_EQUIPMENT_PRODUCT_ID, 'im-c320f', 'ricoh-im-c320f-a4'],
  },
  {
    id: '842720',
    code: '842720',
    color: 'Amarillo',
    yieldPages: '10,000',
    equipmentModels: 'IM C320F / IM C320',
    description: 'PRINT CARTRIDGE YELLOW IMC320',
    name: 'Toner Original RICOH Amarillo IM C320F (10,000 págs al 5%)',
    public: 175,
    dist: 159.09,
    equipmentIds: [IM_C320F_EQUIPMENT_PRODUCT_ID, 'im-c320f', 'ricoh-im-c320f-a4'],
  },
  {
    id: '842394',
    code: '842394',
    color: 'Negro',
    yieldPages: '17,500',
    equipmentModels: 'IM C401 / IM C401F',
    description: 'PRINT CARTRIDGE BLACK IM C401',
    name: 'Toner Original RICOH Negro IM C401 (17,500 págs al 5%)',
    public: 68,
    dist: 61.82,
    equipmentIds: [IM_C401F_EQUIPMENT_PRODUCT_ID, 'im-c401f'],
  },
  {
    id: '842395',
    code: '842395',
    color: 'Cyan',
    yieldPages: '8,000',
    equipmentModels: 'IM C401 / IM C401F',
    description: 'PRINT CARTRIDGE CYAN IM C401',
    name: 'Toner Original RICOH Cyan IM C401 (8,000 págs al 5%)',
    public: 155,
    dist: 140.91,
    equipmentIds: [IM_C401F_EQUIPMENT_PRODUCT_ID, 'im-c401f'],
  },
  {
    id: '842396',
    code: '842396',
    color: 'Magenta',
    yieldPages: '8,000',
    equipmentModels: 'IM C401 / IM C401F',
    description: 'PRINT CARTRIDGE MAGENTA IMC401',
    name: 'Toner Original RICOH Magenta IM C401 (8,000 págs al 5%)',
    public: 155,
    dist: 140.91,
    equipmentIds: [IM_C401F_EQUIPMENT_PRODUCT_ID, 'im-c401f'],
  },
  {
    id: '842397',
    code: '842397',
    color: 'Amarillo',
    yieldPages: '8,000',
    equipmentModels: 'IM C401 / IM C401F',
    description: 'PRINT CARTRIDGE YELLOW IM C401',
    name: 'Toner Original RICOH Amarillo IM C401 (8,000 págs al 5%)',
    public: 155,
    dist: 140.91,
    equipmentIds: [IM_C401F_EQUIPMENT_PRODUCT_ID, 'im-c401f'],
  },
];

function equipmentHaystack(equipment: Pick<Product, 'id' | 'name' | 'code'>): string {
  return `${equipment.id ?? ''} ${equipment.name ?? ''} ${equipment.code ?? ''}`;
}

/** Filas de lista para un equipo (M C320FW, IM C320F o IM C401F). */
export function listedTonersForEquipment(
  equipment: Pick<Product, 'id' | 'name' | 'code'>,
): ListedOriginalTonerRow[] {
  const id = String(equipment.id ?? '').trim();
  if (id) {
    const byId = LISTED_ORIGINAL_TONER_ROWS.filter((row) => row.equipmentIds.includes(id));
    if (byId.length > 0) return [...byId];
  }

  const haystack = equipmentHaystack(equipment);
  if (/\bm\s*c\s*320/i.test(haystack) && !/\bim\s*c\s*320/i.test(haystack)) {
    return LISTED_ORIGINAL_TONER_ROWS.filter((row) =>
      row.equipmentIds.includes(MC320FW_EQUIPMENT_PRODUCT_ID),
    );
  }
  if (/\bim\s*c\s*401/i.test(haystack)) {
    return LISTED_ORIGINAL_TONER_ROWS.filter((row) =>
      row.equipmentIds.includes(IM_C401F_EQUIPMENT_PRODUCT_ID),
    );
  }
  if (/\bim\s*c\s*320/i.test(haystack)) {
    return LISTED_ORIGINAL_TONER_ROWS.filter((row) =>
      row.equipmentIds.includes(IM_C320F_EQUIPMENT_PRODUCT_ID),
    );
  }
  return [];
}
