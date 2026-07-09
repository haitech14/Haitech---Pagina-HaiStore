export type HomeFeaturedSpecFilterId = 'todos' | 'a4' | 'color' | 'bn';

export type HomeFeaturedSpecFilter = {
  id: HomeFeaturedSpecFilterId;
  label: string;
};

export const HOME_FEATURED_SPEC_FILTERS: HomeFeaturedSpecFilter[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'a4', label: 'Formato A4' },
  { id: 'color', label: 'Color' },
  { id: 'bn', label: 'B/N' },
];

export const HOME_FEATURED_DEFAULT_SPEC: HomeFeaturedSpecFilterId = 'todos';
