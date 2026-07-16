import { readFileSync } from 'node:fs';

const ps = JSON.parse(readFileSync('server/data/inventory.json', 'utf8')).products;

const checks = [
  ['m320', (n) => /nueva/i.test(n) && /\bM\s*320F?\b/i.test(n) && !/C320/i.test(n) && !/seminueva/i.test(n)],
  ['mp305', (n) => /nueva/i.test(n) && /MP\s*305\+/i.test(n) && !/seminueva/i.test(n)],
  ['im430', (n) => /IM\s*430F?\b/i.test(n) && !/seminueva/i.test(n) && !/toner|unidad|original|compatible|pad|roller|filter|fusing|photon|separation|paper feed|air filter/i.test(n)],
  ['im460', (n) => /nueva/i.test(n) && /IM\s*460F?\b/i.test(n) && !/seminueva/i.test(n)],
  ['im550', (n) => /nueva/i.test(n) && /IM\s*550F?\b/i.test(n) && !/seminueva/i.test(n)],
  ['im600f', (n) => /nueva/i.test(n) && /IM\s*600F?\b/i.test(n) && !/6000/i.test(n) && !/seminueva/i.test(n)],
  ['im2500', (n) => /nueva/i.test(n) && /IM\s*2500\b/i.test(n) && !/seminueva/i.test(n)],
  ['im3000', (n) => /nueva/i.test(n) && /IM\s*3000\b/i.test(n) && !/C3000/i.test(n) && !/seminueva/i.test(n)],
  ['im5000', (n) => /nueva/i.test(n) && /IM\s*5000\b/i.test(n) && !/seminueva/i.test(n)],
  ['im6010', (n) => /nueva/i.test(n) && /IM\s*6010\b/i.test(n) && !/seminueva/i.test(n)],
  ['im7000', (n) => /nueva/i.test(n) && /IM\s*7000\b/i.test(n) && !/seminueva/i.test(n)],
  ['mc320fw', (n) => /nueva/i.test(n) && /M\s*C320FW\b/i.test(n) && !/seminueva/i.test(n)],
  ['imc320f', (n) => /nueva/i.test(n) && /IM\s*C320F\b/i.test(n) && !/seminueva/i.test(n)],
  ['imc2010', (n) => /nueva/i.test(n) && /IM\s*C2010\b/i.test(n) && !/seminueva/i.test(n)],
  ['imc2510', (n) => /nueva/i.test(n) && /IM\s*C2510\b/i.test(n) && !/seminueva/i.test(n)],
  ['imc3010', (n) => /nueva/i.test(n) && /IM\s*C3010\b/i.test(n) && !/seminueva/i.test(n)],
  ['imc4510', (n) => /nueva/i.test(n) && /IM\s*C4510\b/i.test(n) && !/seminueva/i.test(n)],
  ['imc6010', (n) => /nueva/i.test(n) && /IM\s*C6010\b/i.test(n) && !/seminueva/i.test(n)],
];

for (const [key, match] of checks) {
  const hits = ps.filter((p) => match(String(p.name || '')));
  if (hits.length === 0) {
    console.log(`MISSING ${key}`);
    continue;
  }
  for (const p of hits) {
    const attrs = Object.fromEntries((p.attributes || []).map((a) => [a.name, a.value]));
    console.log(
      [
        key,
        p.name,
        `tec=${p.prices?.tecnico}`,
        `dis=${p.prices?.distribuidor}`,
        `stk=${p.stock}`,
        `vel=${attrs.Velocidad || '-'}`,
        `año=${attrs['Año'] || '-'}`,
        `fmt=${attrs['Formato papel'] || '-'}`,
        `A4=${attrs.A4 || '-'}`,
        `A3=${attrs.A3 || '-'}`,
      ].join(' | '),
    );
  }
}
