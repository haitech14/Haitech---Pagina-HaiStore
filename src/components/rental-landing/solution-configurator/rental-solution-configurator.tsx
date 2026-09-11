import { useEffect, useMemo, useState } from 'react';

import { AdditionalServices } from '@/components/rental-landing/solution-configurator/additional-services';
import { ConfigurationForm } from '@/components/rental-landing/solution-configurator/configuration-form';
import { QuoteSummary } from '@/components/rental-landing/solution-configurator/quote-summary';
import { SolutionQuoteDialog } from '@/components/rental-landing/solution-configurator/solution-quote-dialog';
import { RENTAL_CALCULATOR_REVEAL_EVENT } from '@/components/rental-landing/rental-hero-section';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import {
  DEFAULT_SOLUTION_CONFIG,
  RENTAL_SOLUTION_CONFIGURATOR_ID,
  calculateSolutionQuote,
  modalityForCondition,
  normalizeTermForCondition,
  resolveSolutionLocationFromCity,
  type SolutionConfiguratorState,
  type SolutionExtraId,
} from '@/data/rental-solution-configurator';
import { cn } from '@/lib/utils';

export function RentalSolutionConfigurator({ className }: { className?: string }) {
  const [state, setState] = useState<SolutionConfiguratorState>(DEFAULT_SOLUTION_CONFIG);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<QuotePdfPreview | null>(null);

  const quote = useMemo(() => calculateSolutionQuote(state), [state]);

  useEffect(() => {
    const reveal = () => {
      document.getElementById(RENTAL_SOLUTION_CONFIGURATOR_ID)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };
    window.addEventListener(RENTAL_CALCULATOR_REVEAL_EVENT, reveal);
    return () => window.removeEventListener(RENTAL_CALCULATOR_REVEAL_EVENT, reveal);
  }, []);

  const patch = (partial: Partial<SolutionConfiguratorState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      if (partial.condition != null || partial.termMonths != null) {
        next.termMonths = normalizeTermForCondition(next.condition, next.termMonths);
        next.modality = modalityForCondition(next.condition);
      }
      return next;
    });
  };

  const toggleExtra = (id: SolutionExtraId) => {
    setState((prev) => ({
      ...prev,
      extras: { ...prev.extras, [id]: !prev.extras[id] },
    }));
  };

  const handlePdfPreviewClose = (open: boolean) => {
    if (open) return;
    if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
    setPdfPreview(null);
  };

  return (
    <section
      id={RENTAL_SOLUTION_CONFIGURATOR_ID}
      aria-label="Configura tu alquiler de equipos Ricoh"
      className={cn('scroll-mt-20 bg-[#F7F7F8] py-10 sm:py-14', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)] lg:items-start lg:gap-8">
          <div className="space-y-6 sm:space-y-7">
            <ConfigurationForm
              equipment={state.equipment}
              condition={state.condition}
              modelId={state.modelId}
              quantity={state.quantity}
              termMonths={state.termMonths}
              volumePages={state.volumePages}
              blackPages={state.blackPages}
              colorPages={state.colorPages}
              excessBlackPages={state.excessBlackPages}
              excessColorPages={state.excessColorPages}
              scanPages={state.scanPages}
              city={state.city}
              district={state.district}
              onEquipmentChange={(equipment) => patch({ equipment })}
              onConditionChange={(condition) => patch({ condition })}
              onModelChange={(modelId) => patch({ modelId })}
              onQuantityChange={(quantity) => patch({ quantity })}
              onTermChange={(termMonths) => patch({ termMonths })}
              onVolumeChange={(volumePages) => patch({ volumePages })}
              onBlackPagesChange={(blackPages) => patch({ blackPages })}
              onColorPagesChange={(colorPages) => patch({ colorPages })}
              onExcessBlackPagesChange={(excessBlackPages) => patch({ excessBlackPages })}
              onExcessColorPagesChange={(excessColorPages) => patch({ excessColorPages })}
              onScanPagesChange={(scanPages) => patch({ scanPages })}
              onCityChange={(city) =>
                patch({
                  city,
                  location: resolveSolutionLocationFromCity(city),
                })
              }
              onDistrictChange={(district) => patch({ district })}
            />
            <AdditionalServices extras={state.extras} onToggle={toggleExtra} />
          </div>

          <QuoteSummary
            state={state}
            quote={quote}
            onRequestProposal={() => setQuoteOpen(true)}
            onBlackPagesChange={(blackPages) => patch({ blackPages })}
            onColorPagesChange={(colorPages) => patch({ colorPages })}
            onVolumePagesChange={(volumePages) => patch({ volumePages })}
          />
        </div>
      </div>

      <SolutionQuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        state={state}
        quote={quote}
        onGenerated={setPdfPreview}
      />

      <ProductQuotePdfViewer
        preview={pdfPreview}
        onOpenChange={handlePdfPreviewClose}
        title="Proforma de cotización"
        description={
          pdfPreview?.quoteNumber
            ? `Proforma ${pdfPreview.quoteNumber}. Revisa el documento antes de descargarlo o enviarlo.`
            : 'Revisa la proforma generada antes de descargarla.'
        }
        downloadLabel="Descargar proforma PDF"
        autoDownload
      />
    </section>
  );
}
