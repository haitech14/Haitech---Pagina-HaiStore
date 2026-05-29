export interface Guide {
  id: string;
  tag: string;
  title: string;
  date: string;
}

export const guides: Guide[] = [
  {
    id: 'audifonos',
    tag: 'Guía',
    title: 'Cómo elegir los mejores audífonos inalámbricos',
    date: '15 may 2024',
  },
  {
    id: 'laptops-2024',
    tag: 'Novedad',
    title: 'Las laptops más potentes del 2024',
    date: '08 may 2024',
  },
  {
    id: 'smartwatch',
    tag: 'Consejos',
    title: 'Cuida y configura tu smartwatch como un experto',
    date: '02 may 2024',
  },
  {
    id: 'gaming',
    tag: 'Tendencias',
    title: 'El futuro del gaming: lo que viene',
    date: '28 abr 2024',
  },
];
