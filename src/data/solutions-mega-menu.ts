import type { LucideIcon } from 'lucide-react';
import { Briefcase, FileStack, Headset, KeyRound } from 'lucide-react';

import type { MegaMenuStaticColumnGroup } from '@/data/mega-menu';
import { NUESTRAS_SOLUCIONES_ITEMS } from '@/data/nuestras-soluciones';
import { serviceHubPath } from '@/lib/service-hub';

export type SolutionsMegaMenuSectionId =
  | 'gestion-documental'
  | 'software-licencias'
  | 'servicios-administrados'
  | 'servicios-empresariales';

export const solutionsMegaMenuSectionMeta: Record<
  SolutionsMegaMenuSectionId,
  { label: string; description: string; icon: LucideIcon }
> = {
  'gestion-documental': {
    label: 'Gestión Documental',
    description: 'Digitalización, flujos, archivo y firma electrónica.',
    icon: FileStack,
  },
  'software-licencias': {
    label: 'Software y Licencias',
    description: 'Microsoft 365, Adobe, antivirus, ERP/CRM y SaaS.',
    icon: KeyRound,
  },
  'servicios-administrados': {
    label: 'Servicios Administrados',
    description: 'Outsourcing, flota Ricoh, monitoreo y soporte TI.',
    icon: Headset,
  },
  'servicios-empresariales': {
    label: 'Servicios Empresariales',
    description: 'Alquiler, leasing, oficinas y consultoría tecnológica.',
    icon: Briefcase,
  },
};

export const solutionsMegaMenuSidebarIds: SolutionsMegaMenuSectionId[] = [
  'gestion-documental',
  'software-licencias',
  'servicios-administrados',
  'servicios-empresariales',
];

const softwareSection = (seccion: string) => `/software?seccion=${seccion}`;
const contactoTema = (tema: string) => `/contacto?tema=${encodeURIComponent(tema)}`;

export const solutionsMegaMenuGestionDocumentalColumnGroups: readonly MegaMenuStaticColumnGroup[] = [
  {
    slug: 'gestion-documental',
    title: 'Gestión Documental',
    image: '/categories/soluciones-negocio.png',
    href: softwareSection('gestion-documental'),
    links: [
      { name: 'Digitalización de documentos', href: softwareSection('gestion-documental') },
      { name: 'Flujos de aprobación', href: softwareSection('automatizacion-procesos') },
      { name: 'Archivo electrónico', href: softwareSection('gestion-documental') },
      { name: 'Firma digital', href: softwareSection('gestion-documental') },
    ],
  },
];

export const solutionsMegaMenuSoftwareLicenciasColumnGroups: readonly MegaMenuStaticColumnGroup[] = [
  {
    slug: 'software-licencias',
    title: 'Software y Licencias',
    image: '/categories/soluciones-negocio.png',
    href: '/software',
    links: [
      { name: 'Microsoft 365', href: softwareSection('software-empresarial') },
      { name: 'Adobe', href: softwareSection('software-empresarial') },
      { name: 'Antivirus empresarial', href: softwareSection('antivirus') },
      { name: 'Sistemas ERP/CRM', href: softwareSection('software-empresarial') },
      { name: 'Licencias por suscripción', href: '/software' },
      { name: 'SaaS (Software como servicio)', href: '/software' },
    ],
  },
];

export const solutionsMegaMenuServiciosAdministradosColumnGroups: readonly MegaMenuStaticColumnGroup[] =
  [
    {
      slug: 'servicios-administrados',
      title: 'Servicios Administrados',
      image: '/services/hero/outsourcing-impresion.png',
      href: serviceHubPath('outsourcing'),
      links: [
        { name: 'Outsourcing de impresión', href: serviceHubPath('outsourcing') },
        { name: 'Administración de equipos Ricoh', href: serviceHubPath('outsourcing') },
        { name: 'Monitoreo remoto', href: serviceHubPath('outsourcing') },
        { name: 'Soporte TI', href: serviceHubPath('servicio-tecnico') },
      ],
    },
  ];

export const solutionsMegaMenuServiciosEmpresarialesColumnGroups: readonly MegaMenuStaticColumnGroup[] =
  [
    {
      slug: 'servicios-empresariales',
      title: 'Servicios Empresariales',
      image: '/categories/alquiler.png',
      href: serviceHubPath('servicios-corporativos'),
      links: [
        { name: 'Alquiler de equipos', href: serviceHubPath('alquiler') },
        { name: 'Leasing tecnológico', href: contactoTema('leasing') },
        { name: 'Implementación de oficinas', href: serviceHubPath('servicios-corporativos') },
        { name: 'Consultoría tecnológica', href: contactoTema('consultoria') },
      ],
    },
  ];

export const solutionsMegaMenuFeatured = {
  title: '¿Compras para tu empresa?',
  subtitle: 'Soluciones B2B a medida',
  image: '/promo-cards/b2b-printer.png',
  imageAlt: 'Multifuncional Ricoh profesional para empresas',
  cta: 'Ver soluciones B2B',
  href: serviceHubPath('servicios-corporativos'),
};

export interface SolutionsMegaMenuCategorySection {
  id: SolutionsMegaMenuSectionId;
  name: string;
  tagline: string;
  image: string;
  href: string;
  highlights: string[];
}

export const solutionsMegaMenuCategorySections: readonly SolutionsMegaMenuCategorySection[] = [
  {
    id: 'gestion-documental',
    name: 'Gestión Documental',
    tagline: 'Digitalización, flujos, archivo y firma electrónica.',
    image: '/categories/soluciones-negocio.png',
    href: softwareSection('gestion-documental'),
    highlights: solutionsMegaMenuGestionDocumentalColumnGroups[0].links.map((link) => link.name),
  },
  {
    id: 'software-licencias',
    name: 'Software y Licencias',
    tagline: 'Microsoft 365, Adobe, antivirus, ERP/CRM y SaaS.',
    image: '/categories/soluciones-negocio.png',
    href: '/software',
    highlights: solutionsMegaMenuSoftwareLicenciasColumnGroups[0].links.map((link) => link.name),
  },
  {
    id: 'servicios-administrados',
    name: 'Servicios Administrados',
    tagline: 'Outsourcing, flota Ricoh, monitoreo y soporte TI.',
    image: '/services/hero/outsourcing-impresion.png',
    href: serviceHubPath('outsourcing'),
    highlights: solutionsMegaMenuServiciosAdministradosColumnGroups[0].links.map(
      (link) => link.name,
    ),
  },
  {
    id: 'servicios-empresariales',
    name: 'Servicios Empresariales',
    tagline: 'Alquiler, leasing, oficinas y consultoría tecnológica.',
    image: '/categories/alquiler.png',
    href: serviceHubPath('servicios-corporativos'),
    highlights: solutionsMegaMenuServiciosEmpresarialesColumnGroups[0].links.map(
      (link) => link.name,
    ),
  },
];

export const solutionsMegaMenuServiceItems = NUESTRAS_SOLUCIONES_ITEMS;

export function solutionsMegaMenuColumnGroupsForSection(
  sectionId: SolutionsMegaMenuSectionId,
): readonly MegaMenuStaticColumnGroup[] {
  switch (sectionId) {
    case 'gestion-documental':
      return solutionsMegaMenuGestionDocumentalColumnGroups;
    case 'software-licencias':
      return solutionsMegaMenuSoftwareLicenciasColumnGroups;
    case 'servicios-administrados':
      return solutionsMegaMenuServiciosAdministradosColumnGroups;
    case 'servicios-empresariales':
      return solutionsMegaMenuServiciosEmpresarialesColumnGroups;
    default: {
      const _exhaustive: never = sectionId;
      return _exhaustive;
    }
  }
}
