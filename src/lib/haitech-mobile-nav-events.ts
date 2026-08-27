/** Evento para abrir el sheet de categorías desde el hamburger del header. */
export const HAITECH_OPEN_CATEGORIES_EVENT = 'haitech:open-categories';

export function openHaitechMobileCategories() {
  window.dispatchEvent(new CustomEvent(HAITECH_OPEN_CATEGORIES_EVENT));
}
