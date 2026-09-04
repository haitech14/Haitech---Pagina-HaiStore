import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useSeo } from '@/hooks/use-seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

function LegalShell({
  title,
  canonicalPath,
  description,
  children,
}: {
  title: string;
  canonicalPath: string;
  description: string;
  children: ReactNode;
}) {
  useSeo({
    title,
    description,
    canonical: buildAbsoluteUrl(canonicalPath),
    robots: 'index,follow',
  });

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
      <Button asChild variant="link" className="mt-6 px-0 text-red-600">
        <Link to="/contacto">Ir a contacto</Link>
      </Button>
    </div>
  );
}

export function TermsPage() {
  return (
    <LegalShell
      title="Términos y condiciones"
      canonicalPath="/terminos"
      description="Condiciones de venta, alquiler, garantías y envíos de HaiStore, Distribuidor Autorizado Ricoh en Perú."
    >
      <p>
        HaiStore (HaiTech) comercializa fotocopiadoras, impresoras, tóner, repuestos y servicios
        técnicos como Distribuidor Autorizado Ricoh en Perú. Al comprar o solicitar una cotización
        en haitech.pe aceptas estas condiciones.
      </p>
      <p>
        Los precios publicados en dólares o soles pueden variar según tipo de cambio, stock y lista
        de precios vigente. Una cotización escrita tiene validez por el plazo indicado en el
        documento. El despacho nacional, la instalación en Lima y la garantía de fábrica o de
        HaiProtect se confirman en la orden de compra.
      </p>
      <p>
        El alquiler de equipos incluye las condiciones del contrato mensual (volumen de páginas,
        mantenimiento y tóner). Los consumibles y repuestos se venden según disponibilidad. Si un
        producto deja de estar en inventario, te ofrecemos un equivalente o la devolución del
        importe pagado.
      </p>
      <p>
        Para reclamos, garantías o facturación, escríbenos desde la página de contacto o por
        WhatsApp comercial. Estas condiciones se rigen por la legislación peruana.
      </p>
    </LegalShell>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell
      title="Política de privacidad"
      canonicalPath="/privacidad"
      description="Cómo HaiStore trata datos personales de clientes y visitantes según la normativa peruana de protección de datos."
    >
      <p>
        HaiStore trata datos de identificación, contacto y facturación para atender pedidos,
        cotizaciones, soporte técnico y comunicaciones comerciales relacionadas con equipos Ricoh.
        No vendemos bases de datos a terceros ajenos a la operación logística o de pago.
      </p>
      <p>
        Los datos se conservan el tiempo necesario para cumplir obligaciones tributarias y de
        garantía. Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición
        (ARCO) escribiendo a la página de contacto y acreditando tu identidad.
      </p>
      <p>
        El sitio usa cookies técnicas para el carrito, la sesión y la medición de visitas. Puedes
        limitar cookies no esenciales desde tu navegador. Los pagos se procesan con pasarelas
        externas (Culqi o Mercado Pago) que aplican sus propias políticas.
      </p>
      <p>
        Esta política aplica a haitech.pe y a los formularios de HaiStore. Si actualizamos el
        tratamiento, publicaremos la versión vigente en esta misma URL.
      </p>
    </LegalShell>
  );
}
