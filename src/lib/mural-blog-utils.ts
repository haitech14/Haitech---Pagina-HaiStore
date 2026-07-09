import type { MuralBlogPost, MuralBlogSort, MuralBlogTab } from '@/types/mural-blog';

export function filterMuralBlogByTab(posts: MuralBlogPost[], tab: MuralBlogTab): MuralBlogPost[] {
  if (tab === 'todas') return posts;
  return posts.filter((post) => post.area === tab);
}

export function filterMuralBlogPosts(
  posts: MuralBlogPost[],
  options: {
    tab: MuralBlogTab;
    search: string;
    sort: MuralBlogSort;
  },
): MuralBlogPost[] {
  const query = options.search.trim().toLowerCase();

  let filtered = filterMuralBlogByTab(posts, options.tab);

  if (query) {
    filtered = filtered.filter((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.author.name} ${post.tags.join(' ')}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  const sorted = [...filtered];
  switch (options.sort) {
    case 'antiguos':
      sorted.reverse();
      break;
    case 'mas_vistas':
      sorted.sort((a, b) => b.views - a.views);
      break;
    case 'mas_interacciones':
      sorted.sort((a, b) => b.reactions - a.reactions);
      break;
    case 'recientes':
    default:
      break;
  }

  return sorted;
}

export function computeMuralBlogTabCounts(posts: MuralBlogPost[]) {
  return {
    todas: posts.length,
    rrhh: posts.filter((post) => post.area === 'rrhh').length,
    comercial: posts.filter((post) => post.area === 'comercial').length,
    operaciones: posts.filter((post) => post.area === 'operaciones').length,
    ti: posts.filter((post) => post.area === 'ti').length,
    cumpleanos: posts.filter((post) => post.area === 'cumpleanos').length,
    reconocimientos: posts.filter((post) => post.area === 'reconocimientos').length,
  };
}
