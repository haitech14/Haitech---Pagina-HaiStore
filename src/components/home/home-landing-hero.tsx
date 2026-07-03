import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { ShoppingCart, Star } from 'lucide-react';

import { HomeTrustStrip } from '@/components/home-trust-strip';
import { Button } from '@/components/ui/button';
import { WhatsAppContactDialog } from '@/components/whatsapp-contact-dialog';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import { openHeroQuoteWhatsApp } from '@/lib/hero-whatsapp-message';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import {
  getBrandLogo,
  getBrandLogoDimensions,
  getBrandName,
  heroPartnerBrands,
} from '@/data/brands';
import { cn } from '@/lib/utils';

const HERO_BACKGROUND = '/hero/home-hero-scene.png';

const HERO_BRAND_LOGO_CLASS =
  'h-3.5 w-auto max-w-[3.25rem] object-contain sm:h-4 sm:max-w-[3.75rem]';
const HERO_BRAND_LOGO_CLASS_SQUARE = 'h-3 w-3 object-contain sm:h-3.5 sm:w-3.5';

export function HomeLandingHero() {
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const { contact, saveContact, isSaving } = useWhatsAppContact();

  const handleWhatsAppSubmit = async (nextContact: WhatsAppContact) => {
    await saveContact(nextContact);
    const opened = openHeroQuoteWhatsApp(nextContact, { campaign: 'home-hero-cotizacion' });
    if (!opened) {
      throw new Error('No se pudo abrir WhatsApp. Inténtalo de nuevo.');
    }
  };

  return (
    <>
      <section
        aria-labelledby="hero-titulo"
        className="relative overflow-visible bg-[#F8F9FA] pb-7 sm:pb-9 lg:pb-10"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={HERO_BACKGROUND}
            alt=""
            width={1920}
            height={1080}
            className="absolute inset-0 size-full origin-[68%_42%] scale-100 object-cover object-[68%_42%] sm:scale-[1.02] lg:origin-[64%_40%] lg:scale-[1.03] lg:object-[64%_40%]"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.97)_0%,rgba(255,255,255,0.94)_24%,rgba(255,255,255,0.82)_38%,rgba(255,255,255,0.45)_52%,transparent_68%)] lg:bg-[linear-gradient(to_right,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.95)_22%,rgba(255,255,255,0.84)_36%,rgba(255,255,255,0.42)_50%,transparent_64%)]" />
        </div>

        <div className="container relative z-10">
          <div className="grid items-center lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8 xl:gap-10">
            <div className="flex min-h-[min(68vw,20.5rem)] flex-col justify-center py-8 sm:min-h-[min(54vw,24rem)] sm:py-9 lg:min-h-[26rem] lg:max-w-[40rem] lg:py-10 xl:min-h-[28rem] xl:py-12">
              <div className="flex flex-col">
                <h1
                  id="hero-titulo"
                  className="text-pretty font-hero text-[2rem] font-bold leading-[1.08] tracking-tight text-[#111111] sm:text-[2.75rem] sm:leading-[1.06] lg:text-[3.125rem] xl:text-[3.5rem] xl:leading-[1.05]"
                >
                  <span className="block">
                    Soluciones en <span className="text-[#E30613]">impresión</span>
                  </span>
                  <span className="block">para tu empresa</span>
                </h1>

                <p className="mt-4 max-w-[36rem] text-pretty text-base leading-[1.65] text-[#666666] sm:mt-4 sm:text-[1.0625rem] lg:text-lg">
                  Venta, alquiler, servicio técnico y suministros para fotocopiadoras e impresoras. Todo
                  en un solo lugar.
                </p>

                <div className="mt-6 flex w-full flex-col gap-2.5 sm:mt-7 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                  <Button
                    asChild
                    className="min-h-10 gap-1.5 rounded-lg bg-[#E30613] px-5 text-sm font-medium text-white shadow-[0_6px_16px_rgba(227,6,19,0.22)] hover:bg-[#c90511]"
                  >
                    <Link to="/tienda">
                      <ShoppingCart className="size-3.5" aria-hidden="true" />
                      Comprar ahora
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-10 gap-1.5 rounded-lg border-[#111111] bg-white px-5 text-sm font-medium text-[#111111] hover:bg-muted/40 hover:text-[#111111]"
                    onClick={() => setWhatsappDialogOpen(true)}
                  >
                    <Icon path={mdiWhatsapp} size={0.85} className="text-[#25D366]" aria-hidden="true" />
                    Cotizar por WhatsApp
                  </Button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2 sm:mt-6 sm:gap-x-3">
                {heroPartnerBrands.map((brand) => {
                  const logo = getBrandLogo(brand);
                  if (!logo) return null;
                  const name = getBrandName(brand);
                  const { width, height } = getBrandLogoDimensions(brand);
                  const isSquareLogo = name === 'HP';

                  return (
                    <img
                      key={name}
                      src={logo}
                      alt={name}
                      width={width ?? 68}
                      height={height ?? 22}
                      className={cn(
                        isSquareLogo ? HERO_BRAND_LOGO_CLASS_SQUARE : HERO_BRAND_LOGO_CLASS,
                      )}
                      loading="lazy"
                    />
                  );
                })}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-0.5" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className="size-3.5 fill-amber-400 text-amber-400 sm:size-4"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <p className="text-xs leading-none text-[#888888] sm:text-[0.8125rem]">
                    <span className="font-semibold text-[#333333]">+1,200 empresas</span> confían en
                    nosotros
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden min-h-[26rem] lg:block xl:min-h-[28rem]" aria-hidden="true" />
          </div>
        </div>

        <HomeTrustStrip embedded />

        <WhatsAppContactDialog
          open={whatsappDialogOpen}
          onOpenChange={setWhatsappDialogOpen}
          initial={contact ?? undefined}
          isSubmitting={isSaving}
          showQuoteCheckbox={false}
          title="Solicitar cotización"
          description="Completa tus datos y te llevaremos a WhatsApp con el mensaje listo para enviar a nuestro equipo de ventas."
          submitLabel="Continuar a WhatsApp"
          onSubmit={handleWhatsAppSubmit}
        />
      </section>
    </>
  );
}
