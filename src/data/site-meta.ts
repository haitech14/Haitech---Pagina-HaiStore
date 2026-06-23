/** Título por defecto del sitio (pestaña del navegador). */
export const SITE_TITLE = 'Haitech - Tecnología que sí hace la diferencia';

/** Nombre corto para sufijos de sección (foro, etc.). */
export const SITE_SHORT_NAME = 'Haitech';

export const FORUM_TITLE_SUFFIX = `Foro ${SITE_SHORT_NAME}`;

export function formatPageTitle(section: string): string {
  return `${section} | ${SITE_TITLE}`;
}
