import {
  ClipboardList,
  FileText,
  Headphones,
  Search,
  Shield,
  Truck,
  type LucideIcon,
} from 'lucide-react';

export interface HomeFaqItem {
  id: string;
  question: string;
  answer: string;
  icon: LucideIcon;
}

/** Orden en grilla 2 columnas: izquierda y derecha como en el diseño de referencia. */
export const HOME_FAQ_LEFT_COLUMN_IDS = ['garantia', 'factura', 'seminuevos'] as const;
export const HOME_FAQ_RIGHT_COLUMN_IDS = ['delivery', 'soporte', 'cotizacion-empresa'] as const;

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
] as const;
