import * as XLSX from 'xlsx';

const CATEGORY_LABEL = 'Multifuncionales Seminuevas, Multifuncionales';

function compact(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '');
}

/** MPC3003 → MP C3003, IMC2500 → IM C2500, IM430F → IM 430F */
export function formatEquipmentModelToken(rawModel) {
  const model = String(rawModel ?? '').trim().toUpperCase();
  if (!model) return '';

  if (/^MPC[A-Z0-9]+$/i.test(model)) return `MP C${model.slice(3)}`;
  if (/^IMC[A-Z0-9]+$/i.test(model)) return `IM C${model.slice(3)}`;
  if (/^IMAGEPRESSLITE/i.test(model)) {
    return model.replace(/^IMAGEPRESSLITE/i, 'imagePRESS Lite ');
  }
  if (/^IMAGEPRESS/i.test(model)) {
    return model.replace(/^IMAGEPRESS/i, 'imagePRESS ');
  }
  if (/^IRADXC/i.test(model)) return `imageRUNNER ADVANCE DX C${model.slice(6)}`;
  if (/^IRAC/i.test(model)) return `imageRUNNER ADVANCE C${model.slice(4)}`;
  if (/^IM\d/i.test(model)) return `IM ${model.slice(2)}`;
  if (/^MP\d/i.test(model)) return `MP ${model.slice(2)}`;
  if (/^SPC[A-Z0-9]+$/i.test(model)) return `SP C${model.slice(3)}`;

  return model;
}

export function buildEquipmentProductName(make, model) {
  const brand = String(make ?? 'RICOH').trim().toUpperCase();
  const formattedModel = formatEquipmentModelToken(model);
  return `Impresora Multifuncional Seminueva ${brand} ${formattedModel} 110V`;
}

export function buildEquipmentProductCode(make, model) {
  const base = compact(`${make}-${model}-110v`);
  return `EQ-${base.slice(0, 32).toUpperCase()}`;
}

export function modelMatchVariants(make, model) {
  const formatted = formatEquipmentModelToken(model);
  const variants = new Set([
    compact(model),
    compact(formatted),
    compact(`${make}${model}`),
    compact(`${make}${formatted}`),
  ]);

  const raw = compact(model);
  if (raw.startsWith('mpc')) {
    variants.add(compact(`mp${raw.slice(3)}`));
    variants.add(compact(`mpc${raw.slice(3)}`));
  }
  if (raw.startsWith('imc')) {
    variants.add(compact(`im${raw.slice(3)}`));
    variants.add(compact(`imc${raw.slice(3)}`));
  }

  return [...variants].filter((token) => token.length >= 4);
}

export function isMultifunctionEquipment(product) {
  const name = String(product.name ?? '').toLowerCase();
  const category = String(product.category ?? '').toLowerCase();
  if (category.includes('toner') || category.includes('repuesto')) return false;
  if (name.includes('toner') || name.includes('cartucho')) return false;
  return (
    category.includes('multifuncional') ||
    (name.includes('impresora') && name.includes('multifuncional'))
  );
}

export function modelMatchesProduct(model, productName) {
  const hay = compact(productName);
  const expected = compact(formatEquipmentModelToken(model));
  if (!expected || !hay.includes(expected)) return false;

  const idx = hay.indexOf(expected);
  const after = hay.slice(idx + expected.length);
  if (/^[a-z]{1,3}/.test(after)) return false;

  const importCode = compact(model);
  for (const suffix of ['fb', 'ftl', 'lt', 'ex', 'sp', 'dn']) {
    if (!importCode.includes(suffix) && hay.includes(`${expected}${suffix}`)) return false;
  }

  return true;
}

function brandsCompatible(make, productBrand) {
  const expected = compact(make);
  const actual = compact(productBrand);
  if (!expected || !actual) return true;
  return expected === actual;
}

export function findSimilarEquipmentProduct(products, make, model) {
  const variants = modelMatchVariants(make, model);

  const candidates = products
    .filter(isMultifunctionEquipment)
    .filter((product) => !compact(product.name).includes('agepresslite'))
    .filter((product) => brandsCompatible(make, product.brand))
    .filter((product) => modelMatchesProduct(model, product.name))
    .map((product) => {
      const haystack = compact(`${product.name} ${product.brand} ${product.code}`);
      const modelMatch = variants.some((token) => haystack.includes(token));
      if (!modelMatch) return null;

      const name = String(product.name ?? '').toLowerCase();
      let score = 0;
      if (name.includes('seminuev')) score += 20;
      if (brandsCompatible(make, product.brand)) score += 10;
      if (name.includes('110v')) score += 5;
      if (name.includes('220v')) score += 1;
      if (variants.some((token) => compact(product.name).includes(token))) score += 8;

      return { product, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.product ?? null;
}

export function parseEquiposResumenWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return rows
    .map((row) => {
      const make = String(row.MAKE ?? row.Make ?? row.Marca ?? '').trim();
      const model = String(row.MODEL ?? row.Model ?? row.Modelo ?? '').trim();
      const quantity = Math.max(0, Math.floor(Number(row.CANTIDAD ?? row.Cantidad ?? row.Stock ?? 0)));

      if (!make || !model) return null;
      if (/^total/i.test(model)) return null;

      return {
        make,
        model,
        quantity,
        name: buildEquipmentProductName(make, model),
        code: buildEquipmentProductCode(make, model),
        category: CATEGORY_LABEL,
        brand: make.charAt(0).toUpperCase() + make.slice(1).toLowerCase(),
      };
    })
    .filter(Boolean);
}

export { CATEGORY_LABEL };
