import {
  Briefcase,
  Clock,
  Headphones,
  Network,
  Printer,
  Shield,
  Users,
  Wrench,
  BarChart3,
} from 'lucide-react';

import type { ServiceLandingConfig } from '@/types/service-landing';

export const outsourcingLanding: ServiceLandingConfig = {
  slug: 'outsourcing',
  metaTitle: 'Outsourcing y personal técnico',
  badge: 'Servicios especializados para empresas',
  badgeIcon: Briefcase,
  title: 'Outsourcing y personal técnico',
  titleHighlight: 'para tu empresa',
  subtitle:
    'Soluciones profesionales para optimizar operación, continuidad y seguridad tecnológica.',
  bullets: ['Atención dedicada', 'Cobertura operativa', 'Soporte especializado'],
  gridCols: 'four',
  cards: [
    {
      id: 'impresion',
      title: 'Outsourcing de Impresión',
      description:
        'Gestión integral de impresión, equipos, insumos y soporte para reducir costos y mejorar productividad.',
      image: '/services/hero/outsourcing-impresion.png',
      imageAlt: 'Flota de impresoras en outsourcing',
      icon: Printer,
    },
    {
      id: 'operador',
      title: 'Operador de Servicio',
      description:
        'Personal capacitado para la operación diaria de equipos, atención al usuario y control del servicio.',
      image: '/services/outsourcing/operador.png',
      imageAlt: 'Operador de servicio en oficina',
      icon: Headphones,
    },
    {
      id: 'residente',
      title: 'Técnico Residente',
      description:
        'Soporte técnico permanente en sitio para atención inmediata, mantenimiento y continuidad operativa.',
      image: '/services/outsourcing/residente.png',
      imageAlt: 'Técnico residente reparando multifuncional',
      icon: Wrench,
    },
    {
      id: 'redes',
      title: 'Gestor de Seguridad y Redes',
      description:
        'Administración de redes, monitoreo y protección de infraestructura para una operación segura y estable.',
      image: '/services/outsourcing/redes.png',
      imageAlt: 'Monitoreo de redes y seguridad',
      icon: Network,
    },
  ],
  benefits: [
    {
      id: 'eficiente',
      title: 'Operación eficiente',
      description: 'Procesos optimizados para mayor productividad.',
      icon: BarChart3,
    },
    {
      id: 'especializado',
      title: 'Personal especializado',
      description: 'Profesionales capacitados y con experiencia.',
      icon: Users,
    },
    {
      id: 'inmediata',
      title: 'Respuesta inmediata',
      description: 'Atención oportuna ante requerimientos críticos.',
      icon: Clock,
    },
    {
      id: 'seguridad',
      title: 'Seguridad y control',
      description: 'Supervisión, estabilidad y continuidad del servicio.',
      icon: Shield,
    },
  ],
};
