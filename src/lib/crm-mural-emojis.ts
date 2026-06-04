/** Emoticones frecuentes en mensajes de ventas / WhatsApp del mural. */
export const CRM_MURAL_QUICK_EMOJIS = [
  '👋',
  '🙋',
  '🙋‍♂️',
  '🙋‍♀️',
  '😊',
  '🙂',
  '👍',
  '✅',
  '✔️',
  '🎁',
  '📦',
  '🚚',
  '📲',
  '💬',
  '📋',
  '💰',
  '💵',
  '💳',
  '🖨️',
  '💻',
  '📄',
  '⚡',
  '🔥',
  '⭐',
  '🎉',
  '❤️',
  '🙏',
  '☎️',
  '📍',
  '🕐',
] as const;

export function insertEmojiInField(
  current: string,
  emoji: string,
  selectionStart: number,
  selectionEnd: number,
): { next: string; cursor: number } {
  const start = Math.min(selectionStart, current.length);
  const end = Math.min(selectionEnd, current.length);
  const next = current.slice(0, start) + emoji + current.slice(end);
  return { next, cursor: start + emoji.length };
}
