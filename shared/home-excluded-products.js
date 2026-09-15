/** Duplicados de vitrina; la ficha principal de cada modelo sí se muestra. */
export const HOME_CAROUSEL_EXCLUDED_PRODUCT_IDS = new Set([
  'ricoh-im-c320f-a4',
  '7459b432-72a0-420a-8bff-015a0072f5ac',
  // IM 9000 comparte COD-PART 418787 con IM C320F y se hidrata como duplicado.
  'ffbec10e-aaf3-4a6f-995c-9bcbfb9d39e2',
  // Variantes de voltaje (IDs locales y vivos) que duplican la ficha seminueva.
  'e392ea82-ebec-461f-8361-a81359bace28',
  '0f073d45-5785-4b43-8c22-bba5faeedc6d',
  'ee249761-a942-4397-8170-ee156acd06cf',
  '07452fe5-4610-49a6-a73f-980107810f9b',
  '22adb983-c986-4b33-ad5e-4ff9fbd1fb17',
  'ee76352f-8494-4070-b64b-db50a0f43dac',
  '03b408ff-0b06-4ec5-90ed-94dcb40fd67c',
  '4950b07c-50aa-4884-9e40-e7c9cd1362cb',
  'dd5efa36-73f6-4241-b2ad-6e74ef058733',
  'b0811a6f-0f94-4bea-8804-3f7dd0d28a1c',
  'a853cd99-17e7-445a-a6b2-4f527753db6f',
  'im-c400f-reman',
  'e8f574f7-c70c-44b6-8d28-95023f47f72d',
  // MP C2504 (cilindro mg, cuchilla) retirada de vitrina.
  '2ae814f0-ec1e-41cb-b557-20ebe3a31094',
]);

const HOME_CAROUSEL_EXCLUDED_NAME_PATTERNS = [
  /im\s*2500\s*220\s*v/i,
  /mp\s*5055\s*110\s*v/i,
  /im\s*4000\s*\(\s*120\s*v\s*\)\s*220\s*v/i,
  /impresora\s+multifuncional.*seminuev.*\bim\s*c300f\b/i,
  /impresora\s+multifuncional.*seminuev.*\bim\s*c400f\b/i,
  /multifuncional\s+remanufacturada.*\bim\s*c400f\b/i,
  /mp\s*c2504.*cilindro\s*mg/i,
];

export function isHomeCarouselExcludedProduct(product) {
  const id = String(product?.id ?? '').trim();
  if (id && HOME_CAROUSEL_EXCLUDED_PRODUCT_IDS.has(id)) return true;
  const name = String(product?.name ?? '');
  return HOME_CAROUSEL_EXCLUDED_NAME_PATTERNS.some((pattern) => pattern.test(name));
}
