import {
  ClipboardList,
  FileText,
  Headphones,
  MessageCircle,
  Printer,
  Search,
  Shield,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface HomeFaqItem {
  id: string;
  question: string;
  answer: string;
  icon: LucideIcon;
}

/** Orden en grilla 2 columnas: izquierda y derecha como en el diseño de referencia. */
export const HOME_FAQ_LEFT_COLUMN_IDS = [
  'garantia',
  'factura',
  'seminuevos',
  'garantia-seminuevos',
  'whatsapp-cotizacion',
  'instalacion',
] as const;

export const HOME_FAQ_RIGHT_COLUMN_IDS = [
  'delivery',
  'delivery-provincia',
  'soporte',
  'cotizacion-empresa',
  'alquiler-mantenimiento',
] as const;

export const HOME_FAQ_ITEMS: readonly HomeFaqItem[] = [
  {
    id: 'garantia',
    question: '¿Los equipos tienen garantía?',
    answer:
      'Sí. Los equipos nuevos incluyen garantía oficial del fabricante. Los seminuevos y remanufacturados se entregan con revisión técnica y garantía documentada según el modelo y la condición del equipo.',
    icon: Shield,
  },
  {
    id: 'delivery',
    question: '¿Hacen delivery e instalación de fotocopiadoras?',
    answer:
      'Sí. Realizamos entregas en Lima Metropolitana y envíos a todo el Perú. Para multifuncionales e impresoras Ricoh ofrecemos instalación, configuración y puesta en marcha con nuestro equipo técnico.',
    icon: Truck,
  },
  {
    id: 'factura',
    question: '¿Puedo comprar con factura?',
    answer:
      'Sí. Emitimos factura y boleta electrónica. Si compras para tu empresa, podemos cotizar con RUC, crédito según evaluación y condiciones corporativas adaptadas a tu volumen.',
    icon: FileText,
  },
  {
    id: 'soporte',
    question: '¿Tienen soporte técnico para impresoras Ricoh?',
    answer:
      'Sí. Contamos con servicio técnico especializado: mantenimiento preventivo y correctivo, repuestos originales y compatibles, y atención presencial o remota para mantener tu flota operativa.',
    icon: Headphones,
  },
  {
    id: 'seminuevos',
    question: '¿Los equipos seminuevos están revisados?',
    answer:
      'Sí. Cada equipo seminuevo o remanufacturado pasa por inspección técnica, prueba de impresión y control de calidad antes de la entrega, con reporte de estado y recomendaciones de uso.',
    icon: Search,
  },
  {
    id: 'cotizacion-empresa',
    question: '¿Puedo cotizar tóner, repuestos o alquiler para mi empresa?',
    answer:
      'Sí. Cotizamos venta y alquiler de fotocopiadoras, impresoras multifuncionales, tóner original, tintas y repuestos Ricoh con asesoría comercial para empresas en todo el Perú.',
    icon: ClipboardList,
  },
  {
    id: 'whatsapp-cotizacion',
    question: '¿Puedo cotizar por WhatsApp?',
    answer:
      'Sí. Escríbenos por WhatsApp con el modelo del equipo o el código del insumo y te respondemos con stock, precio y tiempos de entrega. Ideal para cotizaciones rápidas de tóner, repuestos y equipos.',
    icon: MessageCircle,
  },
  {
    id: 'instalacion',
    question: '¿Los equipos incluyen instalación?',
    answer:
      'En Lima Metropolitana la instalación y puesta en marcha de multifuncionales e impresoras Ricoh está incluida o se cotiza según el modelo. En provincia coordinamos envío y, si lo necesitas, soporte remoto o técnico en destino.',
    icon: Wrench,
  },
  {
    id: 'garantia-seminuevos',
    question: '¿Tienen garantía los equipos seminuevos?',
    answer:
      'Sí. Los equipos seminuevos y remanufacturados incluyen garantía por escrito según modelo y condición, respaldada por revisión técnica previa a la entrega y soporte postventa HaiTech.',
    icon: Shield,
  },
  {
    id: 'alquiler-mantenimiento',
    question: '¿El alquiler incluye mantenimiento?',
    answer:
      'Sí. Los planes de alquiler pueden incluir mantenimiento preventivo, repuestos y tóner según el contrato. Te asesoramos para elegir la modalidad que mejor se adapte al volumen de impresión de tu empresa.',
    icon: Printer,
  },
  {
    id: 'delivery-provincia',
    question: '¿Hacen delivery a provincia?',
    answer:
      'Sí. Enviamos equipos, tóner y repuestos a todo el Perú por courier o transporte de confianza. Coordinamos embalaje, seguimiento y tiempos de entrega según tu ciudad.',
    icon: Truck,
  },
] as const;
