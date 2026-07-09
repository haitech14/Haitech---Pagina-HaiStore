import type {
  MuralBlogAreaStat,
  MuralBlogInteractionStat,
  MuralBlogKpi,
  MuralBlogPost,
  MuralBlogTrendingTopic,
} from '@/types/mural-blog';

export const MURAL_BLOG_KPIS: MuralBlogKpi[] = [
  {
    id: 'activas',
    title: 'Publicaciones activas',
    value: 0,
    trend: 0,
    trendLabel: 'vs. la semana pasada',
    sparkline: [0],
    color: '#22C55E',
    icon: 'megaphone',
  },
  {
    id: 'fijadas',
    title: 'Fijadas',
    value: 0,
    trend: null,
    trendLabel: 'Sin cambios',
    sparkline: [0],
    color: '#F97316',
    icon: 'pin',
  },
  {
    id: 'interacciones',
    title: 'Interacciones',
    value: '0',
    trend: 0,
    trendLabel: 'vs. la semana pasada',
    sparkline: [0],
    color: '#A855F7',
    icon: 'heart',
  },
  {
    id: 'visualizaciones',
    title: 'Visualizaciones hoy',
    value: '0',
    trend: 0,
    trendLabel: 'vs. ayer',
    sparkline: [0],
    color: '#3B82F6',
    icon: 'eye',
  },
];

export const MURAL_BLOG_AREA_STATS: MuralBlogAreaStat[] = [];

export const MURAL_BLOG_AREA_TOTAL = 0;

export const MURAL_BLOG_INTERACTION_STATS: MuralBlogInteractionStat[] = [];

export const MURAL_BLOG_TRENDING_TOPICS: MuralBlogTrendingTopic[] = [];

export const MURAL_BLOG_POSTS: MuralBlogPost[] = [];

export const MURAL_BLOG_TAB_LABELS: Record<string, string> = {
  todas: 'Todas',
  rrhh: 'RRHH',
  comercial: 'Comercial',
  operaciones: 'Operaciones',
  ti: 'TI',
  cumpleanos: 'Cumpleaños',
  reconocimientos: 'Reconocimientos',
};
