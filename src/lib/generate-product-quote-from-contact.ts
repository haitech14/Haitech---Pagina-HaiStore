import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import { buildProductQuoteLines } from '@/lib/equipment-config-selection';
import {
  buildProductQuotePdf,
  buildQuoteTechnicalSheetFromProduct,
  downloadTechnicalSheetPdf,
  preloadQuotePdfAssets,
} from '@/lib/generate-product-quote-pdf';
import { contactToQuoteClient } from '@/lib/quote-client-from-contact';
import { usdToPen } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';
import type { CartConfigurationLine, Product } from '@/types/product';
import type { ProductHeroSpecBullet } from '@/types/product-detail';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';

export { contactToQuoteClient } from '@/lib/quote-client-from-contact';
export type { QuoteClientData } from '@/lib/quote-client-from-contact';

export interface ProductQuoteContext {
  product: Product;
  displayTitle: string;
  sku: string;
  brandLabel: string;
  categoryLabel?: string;
  heroSpecBullets?: ProductHeroSpecBullet[];
  heroLead?: string;
  heroDescription?: string;
  equipmentConfiguration?: CartConfigurationLine;
  quantity?: number;
}

export async function generateProductQuoteFromContact(
  contact: WhatsAppContact,
  context: ProductQuoteContext,
  companySettings: CompanySettings = DEFAULT_COMPANY_SETTINGS,
  registerProductQuote?: (payload: ReturnType<typeof buildProformaPayloadFromProductQuote>) => Promise<unknown>,
): Promise<QuotePdfPreview> {
  const quantity = context.quantity ?? 1;
  const quoteLines = buildProductQuoteLines(
    {
      name: context.displayTitle,
      sku: context.sku,
      brand: context.brandLabel,
      pricePen: usdToPen(context.product.price),
      quantity,
      imageUrl: context.product.image_url,
      shortDescription: context.product.description?.trim() || null,
    },
    context.equipmentConfiguration,
  );

  await preloadQuotePdfAssets([context.product.image_url]);

  const client = contactToQuoteClient(contact);

  let technicalSheet = null;
  try {
    technicalSheet = buildQuoteTechnicalSheetFromProduct(context.product, {
      displayTitle: context.displayTitle,
      categoryLabel: context.categoryLabel ?? context.product.category ?? 'Equipo',
      ...(context.heroSpecBullets ? { heroSpecBullets: context.heroSpecBullets } : {}),
      ...(context.heroLead ? { heroLead: context.heroLead } : {}),
      ...(context.heroDescription ? { heroDescription: context.heroDescription } : {}),
    });
  } catch (sheetError) {
    console.warn('[generateProductQuoteFromContact] technical sheet skipped', sheetError);
  }

  const generated = await buildProductQuotePdf(client, quoteLines, companySettings);
  const url = URL.createObjectURL(generated.blob);

  const preview: QuotePdfPreview = {
    url,
    filename: generated.filename,
    blob: generated.blob,
    quoteNumber: generated.quoteNumber,
  };

  if (technicalSheet) {
    void downloadTechnicalSheetPdf(technicalSheet, companySettings);
  }

  if (registerProductQuote) {
    void registerProductQuote(
      buildProformaPayloadFromProductQuote(
        generated.quoteNumber,
        client,
        quoteLines.map((line, index) => ({
          id: index === 0 ? context.product.id : `${context.product.id}::${line.sku}`,
          name: line.name,
          sku: line.sku,
          brand: line.brand,
          pricePen: line.pricePen,
          quantity: line.quantity ?? quantity,
          imageUrl: line.imageUrl ?? null,
          shortDescription: line.shortDescription ?? null,
        })),
        companySettings.quoteValidityDays,
      ),
    ).catch(() => {
      /* El llamador puede mostrar toast */
    });
  }

  return preview;
}
