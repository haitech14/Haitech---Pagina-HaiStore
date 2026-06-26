import { Cpu, Download, HelpCircle, type LucideIcon } from 'lucide-react';

import type { ForumThreadKind } from '@/types/forum';

export interface ForumPillar {
  id: ForumThreadKind | 'firmware-hub';
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  accentClass: string;
}

export const FORUM_PILLARS: ForumPillar[] = [
  {
    id: 'question',
    title: 'Preguntas técnicas',
    description: 'Resuelve dudas de equipos Ricoh, drivers, red y errores de impresión.',
    href: '/foro/preguntas',
    cta: 'Ver preguntas',
    icon: HelpCircle,
    accentClass: 'bg-sky-500',
  },
  {
    id: 'tutorial',
    title: 'Tutoriales',
    description: 'Guías paso a paso compartidas por la comunidad y el equipo HaiStore.',
    href: '/foro/tutoriales',
    cta: 'Explorar tutoriales',
    icon: Cpu,
    accentClass: 'bg-violet-500',
  },
  {
    id: 'firmware-hub',
    title: 'Firmware',
    description: 'Descargas del catálogo y notas de versión para tus multifuncionales.',
    href: '/foro/firmware',
    cta: 'Ir a firmware',
    icon: Download,
    accentClass: 'bg-amber-600',
  },
];

export const FORUM_THREAD_KIND_OPTIONS = [
  { value: 'discussion' as const, label: 'Debate general' },
  { value: 'question' as const, label: 'Pregunta técnica' },
  { value: 'tutorial' as const, label: 'Tutorial' },
  { value: 'firmware' as const, label: 'Nota de firmware' },
] as const;

export const FORUM_KIND_PLACEHOLDERS: Record<ForumThreadKind, { title: string; body: string }> = {
  discussion: {
    title: 'Título del debate',
    body: 'Comparte tu opinión o experiencia con la comunidad…',
  },
  question: {
    title: 'Ej. Error E3 en Ricoh IM C3010 al imprimir por red',
    body: 'Describe el equipo, el error, qué ya intentaste y capturas si aplica…',
  },
  tutorial: {
    title: 'Ej. Cómo instalar el driver Ricoh en Windows',
    body: '1. Primer paso\n2. Segundo paso\n3. Verificación final…',
  },
  firmware: {
    title: 'Ej. Firmware 1.12 para IM C4010 — notas',
    body: 'Modelo, versión, cambios incluidos y recomendaciones de instalación…',
  },
};
