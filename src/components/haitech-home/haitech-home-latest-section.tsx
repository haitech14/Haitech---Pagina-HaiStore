import { ClientRecommendationsSection } from '@/components/client-recommendations-section';
import { ClientsSection } from '@/components/clients-section';
import { cn } from '@/lib/utils';

/**
 * Prueba social home: testimonios reales + logos de clientes (mockup).
 */
export function HaitechHomeLatestSection({ className }: { className?: string }) {
  return (
    <div className={cn('w-full bg-white', className)}>
      <ClientRecommendationsSection />
      <ClientsSection />
    </div>
  );
}
