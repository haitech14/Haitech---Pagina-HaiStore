/**
 * Verifica round-trip de emojis WhatsApp (ejecutar: node scripts/test-whatsapp-emoji.mjs)
 */

function cp(...codePoints) {
  return String.fromCodePoint(...codePoints);
}

const WA_EMOJI = {
  get wave() {
    return cp(0x1f44b);
  },
  get package() {
    return cp(0x1f4e6);
  },
  get smile() {
    return cp(0x1f60a);
  },
};

function encodeWhatsAppText(text) {
  return encodeURIComponent(text.normalize('NFC'));
}

const contact = { name: 'Soporte Haitech', phone: '999888777', city: 'Lima' };
const product = {
  name: 'Ricoh IM 430F',
  priceUsd: 1200,
  brand: 'Ricoh',
  category: 'Multifuncionales',
  productUrl: 'https://haistore.example/p/1',
};

const msg = [
  `¡Hola! ${WA_EMOJI.wave} Soy *${contact.name}*`,
  '',
  `${WA_EMOJI.package} *${product.name}*`,
  `¿Podrían brindarme más información?`,
  `¡Gracias! ${WA_EMOJI.smile}`,
].join('\n');

const encoded = encodeWhatsAppText(msg);
const waveSeq = encoded.match(/%F0%9F%91%8B/i)?.[0] ?? 'MISSING';
const decoded = decodeURIComponent(encoded);
const hasReplacement = /[\uFFFD]/.test(msg);

console.log('--- WhatsApp emoji round-trip ---');
console.log('Message preview:', msg.split('\n')[0]);
console.log('Wave codepoint:', WA_EMOJI.wave.codePointAt(0).toString(16));
console.log('Expected wave UTF-8: %F0%9F%91%8B');
console.log('Encoded wave seq:', waveSeq);
console.log('Round-trip OK:', decoded === msg);
console.log('Has U+FFFD before encode:', hasReplacement);
console.log('PASS:', waveSeq === '%F0%9F%91%8B' && decoded === msg && !hasReplacement);
