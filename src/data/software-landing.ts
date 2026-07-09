import { Clock, Headphones, SlidersHorizontal } from 'lucide-react';

export const SOFTWARE_LANDING_FORM_ID = 'software-cotizacion';

export const softwareLandingHero = {
  title: 'Contrata software empresarial como en una tienda online',
  subtitle:
    'Gestión documental, automatización de procesos e integración Ricoh. Cotiza licencias y planes en minutos con asesoría especializada.',
  image: '/services/servicios-corporativos/saas.png',
  imageAlt: 'Equipo desarrollando plataforma de software empresarial y gestión documental',
  quoteCtaLabel: 'Ver catálogo',
  whatsappCtaLabel: 'Cotizar por WhatsApp',
  whatsappMessage:
    'Hola, vengo desde HaiStore. Me interesa conocer sus soluciones de software empresarial (gestión documental, automatización o integración Ricoh).',
};

export const softwareLandingFormBenefits = [
  { id: 'asesoria', label: 'Asesoría gratuita', icon: Headphones },
  { id: 'propuesta', label: 'Propuesta personalizada', icon: SlidersHorizontal },
  { id: 'respuesta', label: 'Respuesta rápida', icon: Clock },
];

export const softwareLandingFormServiceOptions = [
  { value: 'antivirus', label: 'Antivirus' },
  { value: 'inteligencia-artificial', label: 'Licencias' },
  { value: 'gestion-documental', label: 'Gestión documental' },
  { value: 'automatizacion-procesos', label: 'Automatización de procesos' },
  { value: 'impresion-y-captura', label: 'Impresión y captura digital' },
  { value: 'integracion-ricoh', label: 'Integración Ricoh' },
  { value: 'software-empresarial', label: 'Software Empresarial' },
  { value: 'otro', label: 'Otro software' },
];

export const softwareLandingFormCopy = {
  panelTitle: 'Solicita tu cotización',
  panelDescription:
    'Cuéntanos qué necesitas y un asesor HaiStore te contactará con una propuesta de licenciamiento a medida.',
  formTitle: 'Completa el formulario y te contactaremos',
  privacyNote: 'Tu información está protegida. No compartimos tus datos.',
  submitLabel: 'Enviar solicitud',
  successMessage: '¡Gracias! Hemos recibido tu solicitud. Te contactaremos pronto.',
};
