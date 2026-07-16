export const STOREFRONT_ICON_KEYS: string[];

export function normalizeStorefrontFeatureBar(value: unknown): Array<{
  icon: string;
  title: string;
  subtitle: string;
}>;

export function normalizeStorefrontHeroBullets(value: unknown): Array<{
  icon: string;
  text: string;
}>;

export function normalizeStorefrontUi(value: unknown):
  | {
      showGalleryCopyImage?: boolean;
      showGalleryCopyText?: boolean;
      showTonerCopyActions?: boolean;
      tonerSectionTitle?: string;
      tonerOriginalTabLabel?: string;
      tonerCompatibleTabLabel?: string;
      tonerOriginalCardTitle?: string;
      tonerCompatibleCardTitle?: string;
    }
  | undefined;
