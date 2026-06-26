export function inferRicohModelNumberBlock(name: string): string | null;
export function inferPpmDigitsFromRicohModelName(name: string): string | null;
export function formatPpmLabel(ppmDigits: string | null | undefined): string | null;
export function inferPpmLabelFromRicohModelName(name: string): string | null;
export function inferMonthlyProductionPagesFromRicohModelName(name: string): number | null;
export function formatMonthlyProductionLabel(pages: number | null | undefined): string | null;
export function inferMonthlyProductionLabelFromRicohModelName(name: string): string | null;
export function inferProduccionTierFromMonthlyPages(pages: number | null | undefined): string;
export function inferProduccionTierFromRicohModelName(name: string): string;
export function isRicohImMpCatalogEquipment(product: {
  category?: string | null;
  name?: string | null;
}): boolean;
export function isMultifuncionalNuevaOSeminueva(product: {
  category?: string | null;
  name?: string | null;
}): boolean;
export function resolveMultifuncionalVelocidadFromModel(product: {
  category?: string | null;
  name?: string | null;
}): string | null;
export function resolveRicohMonthlyProductionFromModel(product: {
  category?: string | null;
  name?: string | null;
}): string | null;
