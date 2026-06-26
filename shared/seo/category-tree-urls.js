/**
 * Recorre el árbol de categorías y genera URLs indexables con metadatos.
 * @param {Array<object>} tree
 * @param {string} [parentRootSlug]
 */
export function collectCategoryTreeUrls(tree, parentRootSlug = null) {
  /** @type {Array<{ rootSlug: string, subSlug: string, subName: string, tagline?: string, pathname: string }>} */
  const entries = [];

  for (const node of tree ?? []) {
    const rootSlug = parentRootSlug ?? node.slug;
    if (!rootSlug || !node.slug) continue;

    const walk = (current, root) => {
      if (current.children?.length) {
        for (const child of current.children) {
          const pathname = `/categoria/${root}?sub=${encodeURIComponent(child.slug)}`;
          entries.push({
            rootSlug: root,
            subSlug: child.slug,
            subName: child.name,
            tagline: child.tagline ?? undefined,
            pathname,
          });
          walk(child, root);
        }
      }
    };

    walk(node, rootSlug);

    const basePath =
      rootSlug === 'multifuncionales'
        ? `/categoria/${rootSlug}?sub=all`
        : `/categoria/${rootSlug}`;
    entries.push({
      rootSlug,
      subSlug: rootSlug === 'multifuncionales' ? 'all' : '',
      subName: node.name,
      tagline: node.tagline ?? undefined,
      pathname: basePath,
    });
  }

  const seen = new Set();
  return entries.filter((entry) => {
    const key = entry.pathname;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
