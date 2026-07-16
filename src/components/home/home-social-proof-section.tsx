import { ClientRecommendationsSection } from '@/components/client-recommendations-section';
import { ClientsSection } from '@/components/clients-section';
import { cn } from '@/lib/utils';

/**
 * Prueba social unificada: logos de clientes + testimonios en un solo bloque.
 */
export function HomeSocialProofSection({ className }: { className?: string }) {
  return (
    <section
      id="confianza"
      aria-labelledby="home-social-proof-title"
      className={cn('home-landing-sans bg-white py-6 sm:py-8', className)}
    >
      <div className="container">
        <header className="mx-auto mb-4 max-w-2xl text-center sm:mb-5">
          <h2
            id="home-social-proof-title"
            className="home-section-title text-balance text-xl font-bold tracking-tight text-[#0f1f3d] sm:text-2xl"
          >
            Empresas que{' '}
            <span className="text-red-600">confían</span> en HaiTech
          </h2>
          <p className="mt-1.5 text-pretty text-sm text-muted-foreground">
            Clientes reales y entregas en todo el Perú.
          </p>
        </header>
      </div>

      <ClientsSection embedded />
      <ClientRecommendationsSection embedded />
    </section>
  );
}
