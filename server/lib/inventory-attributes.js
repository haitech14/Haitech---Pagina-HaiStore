import { randomUUID } from 'crypto';

export function normalizeAttributes(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const name = typeof entry.name === 'string' ? entry.name.trim() : '';
      const val = typeof entry.value === 'string' ? entry.value.trim() : '';
      const id =
        typeof entry.id === 'string' && entry.id.trim().length > 0
          ? entry.id.trim()
          : randomUUID();
      if (!name && !val) return null;
      return { id, name, value: val };
    })
    .filter(Boolean);
}
