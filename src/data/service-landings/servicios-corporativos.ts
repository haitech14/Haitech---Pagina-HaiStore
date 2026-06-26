import {
  Building2,
  Cloud,
  Globe,
  Music2,
  Puzzle,
  Users,
  Gauge,
  TrendingUp,
  Wrench,
} from 'lucide-react';

import type { ServiceLandingConfig } from '@/types/service-landing';

export const serviciosCorporativosLanding: ServiceLandingConfig = {
  slug: 'servicios-corporativos',
  metaTitle: 'Servicios corporativos para empresas',
  badge: 'Servicios corporativos para empresas',
  badgeIcon: Building2,
  title: 'Servicios corporativos para',
  titleHighlight: 'tu empresa',
  subtitle:
    'Soluciones complementarias para eventos, transformación digital y capacitación técnica.',
  bullets: ['Atención personalizada', 'Soluciones a medida', 'Soporte profesional'],
  gridCols: 'four',
  cards: [
    {
      id: 'local-eventos',
      title: 'Alquiler de Local para Eventos',
      description:
        'Espacios equipados para capacitaciones, reuniones, lanzamientos y eventos empresariales.',
      image: '/services/servicios-corporativos/local-eventos.png',
      imageAlt: 'Salón de eventos corporativos',
      icon: Building2,
    },
    {
      id: 'dj',
      title: 'Servicio de DJ en Vivo para Eventos',
      description:
        'Ambientación musical profesional para eventos corporativos, activaciones y celebraciones.',
      image: '/services/servicios-corporativos/dj.png',
      imageAlt: 'DJ en evento corporativo',
      icon: Music2,
    },
    {
      id: 'web',
      title: 'Creación de página web + hosting y dominio',
      description:
        'Desarrollo de sitios web profesionales con publicación, hosting y dominio incluidos.',
      image: '/services/servicios-corporativos/web.png',
      imageAlt: 'Desarrollo de sitio web corporativo',
      icon: Globe,
    },
    {
      id: 'saas',
      title: 'Creación de SaaS a Medida',
      description:
        'Diseño y desarrollo de plataformas SaaS personalizadas según los procesos de tu empresa.',
      image: '/services/servicios-corporativos/saas.png',
      imageAlt: 'Equipo desarrollando plataforma SaaS',
      icon: Cloud,
    },
    {
      id: 'curso',
      title: 'Curso de Reparación de Fotocopiadoras',
      description:
        'Capacitación práctica y especializada para aprender diagnóstico, mantenimiento y reparación.',
      image: '/services/servicios-corporativos/curso.png',
      imageAlt: 'Curso de reparación de fotocopiadoras',
      icon: Wrench,
    },
  ],
  benefits: [
    {
      id: 'integrales',
      title: 'Soluciones integrales',
      description: 'Servicios complementarios para impulsar tu operación.',
      icon: Puzzle,
    },
    {
      id: 'equipo',
      title: 'Equipo especializado',
      description: 'Profesionales con experiencia técnica y creativa.',
      icon: Users,
    },
    {
      id: 'agil',
      title: 'Implementación ágil',
      description: 'Procesos rápidos y enfocados en resultados.',
      icon: Gauge,
    },
    {
      id: 'escalable',
      title: 'Escalabilidad',
      description: 'Propuestas adaptadas al tamaño de tu empresa.',
      icon: TrendingUp,
    },
  ],
};
