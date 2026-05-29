import { Link } from 'react-router-dom';
import { ShoppingCart, BadgeCheck, Tag, Truck, ShieldCheck } from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import { Button } from '@/components/ui/button';
import { BrandStrip } from '@/components/brand-strip';
import { printerBrands } from '@/data/brands';
import { cn } from '@/lib/utils';

const WHATSAPP_NUMBER = '915 149 290';
const WHATSAPP_LINK = 'https://wa.me/51915149290';

const trustBadges = [
  {
    icon: BadgeCheck,
    title: '100% originales',
    text: 'Certificados por el fabricante.',
  },
  {
    icon: Tag,
    title: 'Precios mayoristas',
    text: 'Descuentos desde la 1.ª unidad.',
  },
  {
    icon: Truck,
    title: 'Despacho inmediato',
    text: 'Entrega en Lima en 24 h.',
  },
] as const;

export function HeroBanner() {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative w-full overflow-hidden bg-black text-white"
    >
      {/* Imagen de fondo (decorativa). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-[center_65%] bg-no-repeat lg:bg-[length:58%_auto] lg:bg-no-repeat lg:[background-position:62%_65%]"
      />

      {/* Sello distribuidores autorizados */}
      <div className="absolute right-3 top-3 z-10 hidden items-center gap-1.5 rounded-lg border border-red-600/40 bg-black/60 px-2.5 py-1.5 backdrop-blur-sm sm:flex">
        <BadgeCheck className="size-5 shrink-0 text-red-500" aria-hidden="true" />
        <div className="leading-tight">
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-white">
            Distribuidores
            <br />
            autorizados
          </p>
          <p className="text-[0.6rem] text-white/60">Consumibles certificados</p>
        </div>
      </div>

      <div className="container relative py-8 sm:py-10 lg:min-h-[380px] lg:py-12">
        <div className="flex max-w-2xl flex-col items-start gap-4">
          <span className="-mb-1 inline-flex items-center gap-2 rounded-full border border-red-600/50 bg-red-600/10 px-3 pb-0.5 pt-1 text-[0.65rem] font-bold uppercase leading-none tracking-[0.18em] text-red-600">
            <span className="size-1.5 rounded-full bg-red-600" aria-hidden="true" />
            Nueva generación de
          </span>

          <h1
            id="hero-titulo"
            className="font-hero text-5xl font-bold uppercase leading-[0.88] tracking-normal sm:text-6xl lg:text-7xl lg:leading-[0.9]"
          >
            <span className="block text-white">Equipos</span>
            <span className="block text-[#FF3333]">de Alto</span>
            <span className="block text-[#FF3333]">Rendimiento</span>
          </h1>

          <p className="whitespace-nowrap text-sm leading-snug text-white sm:text-base lg:text-lg">
            Tóner, Repuestos Originales y Compatibles, Servicio Técnico
          </p>

          {/* Indicadores de confianza */}
          <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
            {trustBadges.map((badge) => (
              <li key={badge.title} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-md',
                    'border border-white/25 bg-white/10 text-white',
                  )}
                  aria-hidden="true"
                >
                  <badge.icon className="size-4" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-sm font-bold text-white">{badge.title}</p>
                  <p className="text-xs leading-snug text-white/55">{badge.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              asChild
              className="h-11 rounded-md bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,211,102,0.35)] transition-all hover:bg-[#20bd5a] focus-visible:ring-[#25D366] focus-visible:ring-offset-black"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Icon path={mdiWhatsapp} size={0.9} aria-hidden="true" />
                Cotizar por WhatsApp · {WHATSAPP_NUMBER}
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 rounded-md border-white/25 bg-black/40 px-5 text-sm font-semibold text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-black"
            >
              <Link to="/tienda">
                <ShoppingCart aria-hidden="true" />
                Ver catálogo
              </Link>
            </Button>
          </div>

          <p className="flex items-center gap-2 text-xs text-white/45">
            <ShieldCheck className="size-4 text-red-600" aria-hidden="true" />
            Garantía de fábrica · Compra segura
          </p>
        </div>
      </div>

      <BrandStrip brands={printerBrands} variant="dark" showHeading={false} />
    </section>
  );
}
