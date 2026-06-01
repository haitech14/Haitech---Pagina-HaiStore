export interface SubcategoryPalette {
  from: string;
  to: string;
  accent: string;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function subcategoryPalette(slug: string): SubcategoryPalette {
  const hue = hashString(slug) % 360;
  return {
    from: `hsl(${hue} 58% 48%)`,
    to: `hsl(${(hue + 28) % 360} 62% 32%)`,
    accent: `hsl(${(hue + 12) % 360} 70% 88%)`,
  };
}

export function subcategoryInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'HS';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

export type SubcategoryVisualKind = 'all' | 'new' | 'refurbished' | 'supplies' | 'default';

export function subcategoryVisualKind(name: string): SubcategoryVisualKind {
  const norm = name.toLowerCase();
  if (norm.includes('ver todo') || norm === 'todos') return 'all';
  if (norm.includes('nueva') || norm.includes('nuevo')) return 'new';
  if (norm.includes('remanufactur') || norm.includes('reacondicion')) return 'refurbished';
  if (norm.includes('tóner') || norm.includes('toner') || norm.includes('suministro')) {
    return 'supplies';
  }
  return 'default';
}
