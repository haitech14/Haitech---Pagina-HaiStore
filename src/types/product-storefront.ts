/** Ítem serializable de la barra de características (6 cajas en ficha). */
export interface StoredFeatureBarItem {
  icon: string;
  title: string;
  subtitle: string;
}

/** Bullet serializable del hero (lista con icono). */
export interface StoredHeroBullet {
  icon: string;
  text: string;
}

/**
 * UI de ficha editable (bloque Toner + acciones de copiar).
 * Campos omitidos = defaults actuales en tienda.
 */
export interface StoredStorefrontUi {
  showGalleryCopyImage?: boolean;
  showGalleryCopyText?: boolean;
  showTonerCopyActions?: boolean;
  tonerSectionTitle?: string;
  tonerOriginalTabLabel?: string;
  tonerCompatibleTabLabel?: string;
  tonerOriginalCardTitle?: string;
  tonerCompatibleCardTitle?: string;
}

export const DEFAULT_STOREFRONT_UI = {
  showGalleryCopyImage: true,
  showGalleryCopyText: true,
  showTonerCopyActions: true,
  tonerSectionTitle: 'Toner',
  tonerOriginalTabLabel: 'Original',
  tonerCompatibleTabLabel: 'Compatible',
  tonerOriginalCardTitle: 'Tóner original',
  tonerCompatibleCardTitle: 'Tóner compatible',
} as const satisfies Required<StoredStorefrontUi>;

export type ResolvedStorefrontUi = Required<StoredStorefrontUi>;
