function stableDailyOrderKey(id: string, dayKey: string): number {
  let hash = 2166136261;
  for (const char of `${dayKey}:${id}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Orden pseudoaleatorio estable por día (America/Lima), sin saltar en cada refetch. */
export function shuffleProductsDaily<T extends { id: string }>(
  items: readonly T[],
  now = new Date(),
): T[] {
  const dayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  return [...items].sort(
    (a, b) => stableDailyOrderKey(a.id, dayKey) - stableDailyOrderKey(b.id, dayKey),
  );
}
