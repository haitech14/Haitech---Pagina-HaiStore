export type MuralBlogArea =
  | 'rrhh'
  | 'comercial'
  | 'operaciones'
  | 'ti'
  | 'cumpleanos'
  | 'reconocimientos';

export type MuralBlogTab = 'todas' | MuralBlogArea;

export type MuralBlogSort = 'recientes' | 'antiguos' | 'mas_vistas' | 'mas_interacciones';

export interface MuralBlogAuthor {
  name: string;
  initials: string;
  color: string;
}

export interface MuralBlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: MuralBlogAuthor;
  area: MuralBlogArea;
  tags: string[];
  publishedAt: string;
  views: number;
  reactions: number;
  pinned?: boolean;
  thumbnail?: {
    type: 'image' | 'icon';
    src?: string;
    icon?: string;
    bgColor: string;
    iconColor?: string;
  };
}

export interface MuralBlogKpi {
  id: string;
  title: string;
  value: number | string;
  trend: number | null;
  trendLabel: string;
  sparkline: number[];
  color: string;
  icon: 'megaphone' | 'pin' | 'heart' | 'eye';
}

export interface MuralBlogAreaStat {
  area: MuralBlogArea | 'otros';
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface MuralBlogInteractionStat {
  type: string;
  count: number;
  percent: number;
  color: string;
}

export interface MuralBlogTrendingTopic {
  rank: number;
  topic: string;
  posts: number;
}
