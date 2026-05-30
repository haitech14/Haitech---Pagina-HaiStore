export interface RicohPublication {
  id: string;
  tag: string;
  title: string;
  date: string;
  isoDate: string;
  image: string;
  imageAlt: string;
  href: string;
}

export const ricohPublications: RicohPublication[] = [
  {
    id: 'sdgs-action-month',
    tag: 'Noticias',
    title: 'Ricoh lanza Global SDGs Action Month 2026',
    date: '29 may 2026',
    isoDate: '2026-05-29',
    image: '/publications/ricoh-news-sdgs.png',
    imageAlt: 'Equipo Ricoh en oficina moderna durante iniciativa SDGs',
    href: '/tienda',
  },
  {
    id: 'cdp-recognition',
    tag: 'Publicación',
    title: 'Ricoh es reconocida por CDP por sexto año consecutivo',
    date: '21 may 2026',
    isoDate: '2026-05-21',
    image: '/publications/ricoh-news-cdp.png',
    imageAlt: 'Trofeo CDP A List 2025 de Ricoh',
    href: '/tienda',
  },
  {
    id: 'share-repurchase',
    tag: 'Actualidad',
    title: 'Anuncio sobre recompra de acciones y retiro de tesorería',
    date: '12 may 2026',
    isoDate: '2026-05-12',
    image: '/publications/ricoh-news-shares.png',
    imageAlt: 'Sala de juntas Ricoh con presentación corporativa',
    href: '/tienda',
  },
  {
    id: 'butlr-investment',
    tag: 'Tendencias',
    title: 'Ricoh invierte nuevamente en Butlr a través del Innovation Fund',
    date: '27 abr 2026',
    isoDate: '2026-04-27',
    image: '/publications/ricoh-news-butlr.png',
    imageAlt: 'Oficina moderna con tecnología de proyección Ricoh',
    href: '/tienda',
  },
];
