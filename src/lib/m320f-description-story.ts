import type {
  ProductDescriptionContent,
  ProductDescriptionStoryBlock,
  ProductDescriptionStoryCta,
} from '@/types/product-detail';
import { Cloud, Gauge, Inbox, Settings, Smartphone } from 'lucide-react';

const M320F_PRODUCT_IMAGE = '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp';
const M320F_PRODUCT_IMAGE_LG = '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e-1024.webp';
const OFFICE_PEOPLE_IMAGE = '/promo-cards/technician-service.webp';
const B2B_PRINTER_IMAGE = '/promo-cards/b2b-printer.png';
const COLLAB_IMAGE = '/solutions/colaboracion.png';

/** Bloques de descripción brochure RICOH M 320F (orden del mockup, tema claro). */
export const M320F_STORY_BLOCKS: ProductDescriptionStoryBlock[] = [
  {
    id: 'necesidades-presupuestos',
    title: 'Satisfacer todas las necesidades y presupuestos',
    body: 'Comparta sus mejores ideas con esta impresora económica. Imprime, copia, escanea y envía faxes con facilidad desde tu PC o dispositivo móvil con la impresora multifunción láser en blanco y negro RICOH M 320F. Sus múltiples opciones de conectividad permiten imprimir a distancia en una amplia gama de soportes y sus cartuchos de impresión de alto rendimiento ayudan a controlar e incluso a reducir los costos totales de impresión.',
    imagePosition: 'end',
    imageSrc: OFFICE_PEOPLE_IMAGE,
    imageAlt: 'Equipo de oficina colaborando con documentos',
  },
  {
    id: 'flujos-trabajo',
    title: 'Agiliza tus flujos de trabajo',
    body: 'Comparte la información rápidamente. Convierte copias a una o dos caras en archivos digitales que pueden compartirse a través de Escanear a correo electrónico/carpeta/FTP y otras opciones al instante con el alimentador automático de documentos de 35 hojas. Imprime en blanco y negro a una velocidad de hasta 34 páginas por minuto (ppm). El envío de faxes sin papel reduce los gastos de papel y de transmisión.',
    imagePosition: 'start',
    imageSrc: M320F_PRODUCT_IMAGE_LG,
    imageAlt: 'RICOH M 320F con bandejas de papel',
  },
  {
    id: 'productividad-empleados',
    title: 'Impulsa la productividad de los empleados',
    body: 'Los pequeños grupos de trabajo se convierten en grandes contribuyentes ya que un potente controlador y una amplia memoria hacen que la gestión de múltiples proyectos sea sencilla. La gran pantalla táctil en color de 4,3" facilita el desplazamiento entre tareas, la búsqueda de detalles importantes del trabajo y la configuración del dispositivo con la precisión de un dedo. Las marcas de agua, las cubiertas y mucho más dan un aspecto profesional a cualquier documento. Escanea originales a dos caras en una cara de una hoja de papel con la copia de tarjetas de identificación.',
    imagePosition: 'end',
    imageSrc: M320F_PRODUCT_IMAGE,
    imageAlt: 'Pantalla táctil RICOH M 320F',
  },
  {
    id: 'comodidad-sin-cables',
    title: 'Disfruta de la comodidad sin cables',
    body: 'La comodidad de la pequeña oficina se consigue sin complicaciones, ya que puedes colocar este dispositivo compacto en escritorios, puestos de trabajo y estanterías con una interfaz estándar USB 2.0 o Ethernet, o elegir la conectividad inalámbrica USB WiFi® de 2,4 GHz. La herramienta de controladores de impresión automática permite descargar rápidamente los controladores de impresión y simplificar la configuración del dispositivo.',
    imagePosition: 'start',
    imageSrc: COLLAB_IMAGE,
    imageAlt: 'Profesional en oficina conectada',
  },
  {
    id: 'comparte-cualquier-lugar',
    title: 'Comparte información desde cualquier lugar',
    body: 'Trabaja donde te encuentres e imprime cuando lo necesites. Captura información desde aplicaciones de almacenamiento en la nube con la aplicación RICOH Smart Device Connector para el smartphone o la tableta iOS® o Android®. Autentifícate simplemente tocando con tu dispositivo Android® la etiqueta Near Field Communication (NFC) o escaneando el código QR del panel. Imprima a través de Mopria® o desde su dispositivo iOS® mediante AirPrint®.',
    imagePosition: 'end',
    visual: 'smartphone-cloud',
    imageAlt: 'Impresión móvil y en la nube',
  },
  {
    id: 'tareas-rapidez',
    title: 'Realiza las tareas con mayor rapidez',
    body: 'Imprime y sigue imprimiendo hasta 7.000 páginas por un impresionante cartucho de impresión todo en uno de alto rendimiento. Un cómodo diseño de acceso frontal ofrece una salida duradera y sin necesidad de mantenimiento y hace que la reposición del papel sea sencilla y rápida. Incluso el miembro más novato de su equipo puede sustituir el cartucho de impresión en segundos sin necesidad de ayuda técnica. Controla el dispositivo con Web Image Monitor o @REMOTE.',
    imagePosition: 'start',
    imageSrc: B2B_PRINTER_IMAGE,
    imageAlt: 'Salida de papel de alto volumen',
  },
  {
    id: 'soportes-flexibles',
    title: 'Imprime más con opciones de soportes flexibles',
    body: 'Produce imágenes excepcionales y textos atractivos con hasta 1200 x 1200 ppp en una amplia gama de soportes, incluidos tamaños de papel de hasta 8,5" x 14", papeles más gruesos y sobres. Utiliza la bandeja de papel estándar de 250 hojas para tus impresiones diarias. Usa la bandeja de desvío de 50 hojas para tamaños de papel y materiales especiales. Añade la bandeja de papel de 250 hojas opcional para obtener más capacidad y ampliar las tiradas de impresión.',
    imagePosition: 'end',
    imageSrc: M320F_PRODUCT_IMAGE_LG,
    imageAlt: 'RICOH M 320F con bandeja extendida',
  },
  {
    id: 'futuro-sostenible',
    title: 'Promueve un futuro sostenible',
    body: 'La impresión a doble cara por defecto puede ayudar a reducir el uso de papel hasta la mitad. El modo de reposo apaga el dispositivo cuando está inactivo. Además, la M 320F cuenta con la certificación ENERGY STAR®, cumple con los criterios EPEAT® Silver* y ofrece un bajo valor de consumo eléctrico típico (TEC) de 0,427 kWh/semana.',
    imagePosition: 'start',
    visual: 'sustainability',
    imageAlt: 'Impresión sostenible',
    footnote: '*La calificación EPEAT Silver sólo es aplicable en los Estados Unidos.',
  },
];

export const M320F_STORY_CTA: ProductDescriptionStoryCta = {
  title: '¿Necesitas más información?',
  body: 'Conoce más sobre la impresora multifunción láser en blanco y negro RICOH M 320F y cómo puede encajar en tu negocio.',
};

export const M320F_DESCRIPTION: ProductDescriptionContent = {
  overviewTitle: 'RICOH M 320F',
  overviewParagraphs: [
    'Impresora multifunción láser en blanco y negro diseñada para pequeñas oficinas y grupos de trabajo que buscan productividad, conectividad y control de costos.',
  ],
  paragraphs: [],
  storyBlocks: M320F_STORY_BLOCKS,
  storyCta: M320F_STORY_CTA,
  highlights: [
    { icon: Gauge, title: 'Hasta 34 ppm', subtitle: 'Impresión B/N rápida' },
    { icon: Inbox, title: 'ADF 35 hojas', subtitle: 'Escaneo a email/carpeta/FTP' },
    { icon: Smartphone, title: 'Móvil y nube', subtitle: 'Smart Device Connector' },
    { icon: Cloud, title: 'Wi‑Fi / Ethernet', subtitle: 'Conectividad flexible' },
    { icon: Settings, title: 'Pantalla 4,3"', subtitle: 'Panel táctil en color' },
  ],
};
