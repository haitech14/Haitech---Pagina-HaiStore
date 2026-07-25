import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import { buildProductQuoteLines } from '@/lib/equipment-config-selection';
import {
  buildProductQuotePdf,
  buildQuoteTechnicalSheetFromProduct,
  downloadTechnicalSheetPdf,
  preloadQuotePdfAssets,
  type QuoteClientData,
} from '@/lib/generate-product-quote-pdf';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { usdToPen } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';
import type { CartConfigurationLine, Product } from '@/types/product';
import type { ProductHeroSpecBullet } from '@/types/product-detail';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import { parseCompanyOrRucForStorage } from '@/lib/whatsapp-contact';

export interface ProductQuoteFormValues {
  ruc: string;
  razonSocial: string;
  atencion: string;
  celular: string;
  direccion: string;
  ciudad: string;
}

export const EMPTY_PRODUCT_QUOTE_FORM: ProductQuoteFormValues = {
  ruc: '',
  razonSocial: '',
  atencion: '',
  celular: '',
  direccion: '',
  ciudad: '',
};

export function productQuoteFormFromCheckoutClient(
  client: Partial<HaitechClientFormValues> | null | undefined,
): ProductQuoteFormValues {
  if (!client) return { ...EMPTY_PRODUCT_QUOTE_FORM };

  return {
    ruc: client.rucDni?.trim() ?? '',
    razonSocial: client.nombre?.trim() ?? '',
    atencion: client.nombreContacto?.trim() ?? '',
    celular: client.telefono?.trim() ?? '',
    direccion: client.direccion?.trim() ?? '',
    ciudad: client.ciudad?.trim() ?? '',
  };
}

export function isCompleteProductQuoteForm(
  form: Partial<ProductQuoteFormValues> | null | undefined,
): form is ProductQuoteFormValues {
  return Boolean(
    form?.ruc?.trim() &&
      form?.razonSocial?.trim() &&
      form?.atencion?.trim() &&
      form?.celular?.trim() &&
      form?.direccion?.trim() &&
      form?.ciudad?.trim(),
  );
}

export function quoteFormToQuoteClient(form: ProductQuoteFormValues): QuoteClientData {
  return {
    ruc: form.ruc.trim(),
    razonSocial: form.razonSocial.trim(),
    atencion: form.atencion.trim(),
    celular: form.celular.trim(),
    direccion: form.direccion.trim(),
    ciudad: form.ciudad.trim(),
  };
}

export function productQuoteFormFromWhatsAppContact(contact: WhatsAppContact): ProductQuoteFormValues {
  const parsed = parseCompanyOrRucForStorage(contact.companyOrRuc);
  const razonSocial = parsed.companyName ?? contact.companyOrRuc.trim();
  return {
    ruc: parsed.taxId ?? '',
    razonSocial,
    atencion: contact.name.trim(),
    celular: '',
    direccion: '',
    ciudad: contact.city.trim(),
  };
}

export function whatsAppContactFromProductQuoteForm(form: ProductQuoteFormValues): WhatsAppContact {
  const ruc = form.ruc.trim();
  const razonSocial = form.razonSocial.trim();
  const companyOrRuc =
    ruc && razonSocial ? `${ruc} · ${razonSocial}` : ruc || razonSocial;

  return {
    name: form.atencion.trim(),
    companyOrRuc,
    city: form.ciudad.trim(),
  };
}

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

export function contactToQuoteClient(contact: WhatsAppContact): QuoteClientData {
  const companyOrRuc = contact.companyOrRuc.trim();
  const digitsOnly = companyOrRuc.replace(/\D/g, '');
  const looksLikeRuc =
    digitsOnly.length >= 8 && digitsOnly.length <= 11 && digitsOnly === companyOrRuc.replace(/\s/g, '');

  if (looksLikeRuc) {
    return {
      razonSocial: contact.name.trim(),
      ruc: digitsOnly,
      atencion: contact.name.trim(),
      celular: '—',
      direccion: contact.city.trim(),
      ciudad: contact.city.trim(),
    };
  }

  return {
    razonSocial: companyOrRuc || contact.name.trim(),
    ruc: digitsOnly.length >= 8 && digitsOnly.length <= 11 ? digitsOnly : 'S/D',
    atencion: contact.name.trim(),
    celular: '—',
    direccion: contact.city.trim(),
    ciudad: contact.city.trim(),
  };
}

export async function generateProductQuoteFromForm(
  form: ProductQuoteFormValues,
  context: ProductQuoteContext,
  companySettings: CompanySettings = DEFAULT_COMPANY_SETTINGS,
  registerProductQuote?: (payload: ReturnType<typeof buildProformaPayloadFromProductQuote>) => Promise<unknown>,
): Promise<QuotePdfPreview> {
  return generateProductQuoteFromClient(
    quoteFormToQuoteClient(form),
    context,
    companySettings,
    registerProductQuote,
  );
}

export async function generateProductQuoteFromClient(
  client: QuoteClientData,
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

export async function generateProductQuoteFromContact(
  contact: WhatsAppContact,
  context: ProductQuoteContext,
  companySettings: CompanySettings = DEFAULT_COMPANY_SETTINGS,
  registerProductQuote?: (payload: ReturnType<typeof buildProformaPayloadFromProductQuote>) => Promise<unknown>,
): Promise<QuotePdfPreview> {
  return generateProductQuoteFromClient(
    contactToQuoteClient(contact),
    context,
    companySettings,
    registerProductQuote,
  );
}
