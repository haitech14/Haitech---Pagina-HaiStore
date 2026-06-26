import { useRef, useState } from 'react';
import { CheckCircle2, Download, Loader2, Paperclip, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { downloadQuotePdf } from '@/lib/generate-product-quote-pdf';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { cn } from '@/lib/utils';

interface StoreOrderPdfViewerProps {
  preview: QuotePdfPreview | null;
  onOpenChange: (open: boolean) => void;
  orderId?: string | null;
  showPaymentProofUpload?: boolean;
  paymentProofUploaded?: boolean;
  onPaymentProofUpload?: (file: File) => Promise<void>;
  uploadingPaymentProof?: boolean;
}

export function StoreOrderPdfViewer({
  preview,
  onOpenChange,
  orderId,
  showPaymentProofUpload = false,
  paymentProofUploaded = false,
  onPaymentProofUpload,
  uploadingPaymentProof = false,
}: StoreOrderPdfViewerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localUploaded, setLocalUploaded] = useState(false);

  const proofUploaded = paymentProofUploaded || localUploaded;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUploadError(null);
    }
    onOpenChange(open);
  };

  const handleDownload = () => {
    if (!preview) return;
    downloadQuotePdf(preview.blob, preview.filename);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onPaymentProofUpload) return;

    setUploadError(null);
    try {
      await onPaymentProofUpload(file);
      setLocalUploaded(true);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'No se pudo adjuntar el comprobante.',
      );
    }
  };

  return (
    <Dialog open={Boolean(preview)} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[min(96vh,980px)] max-h-[96vh] w-[min(98vw,1280px)] max-w-[min(98vw,1280px)] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="shrink-0 border-b px-6 py-4 pr-14">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="size-5 text-red-600" aria-hidden="true" />
              ¡Pedido realizado!
            </DialogTitle>
            <DialogDescription>
              {preview?.quoteNumber ? (
                <>
                  Felicitaciones, tu pedido{' '}
                  <span className="font-mono font-semibold text-foreground">{preview.quoteNumber}</span>{' '}
                  fue registrado correctamente. Revisa la orden de pedido y, si pagaste por transferencia
                  o Yape/Plin, adjunta tu comprobante para agilizar la validación.
                </>
              ) : (
                'Felicitaciones, tu pedido fue registrado correctamente. Revisa la orden y adjunta tu comprobante de pago si corresponde.'
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        {preview ? (
          <>
            <div className="min-h-0 flex-1 overflow-hidden bg-neutral-100 px-4 py-3">
              <iframe
                src={preview.url}
                title={`Vista previa ${preview.filename}`}
                className="size-full min-h-[60vh] rounded-lg border border-neutral-200 bg-white"
              />
            </div>

            {showPaymentProofUpload && orderId ? (
              <div className="shrink-0 border-t bg-muted/20 px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Paperclip className="size-4 text-red-600" aria-hidden="true" />
                      Comprobante de pago
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Adjunta la captura o el PDF de tu transferencia, Yape o Plin.
                    </p>
                    {uploadError ? (
                      <p role="alert" className="mt-2 text-xs text-red-600">
                        {uploadError}
                      </p>
                    ) : null}
                    {proofUploaded ? (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        Comprobante adjuntado correctamente
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="sr-only"
                      onChange={(event) => void handleFileChange(event)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={cn('min-h-10 gap-2', proofUploaded && 'border-emerald-600/40')}
                      disabled={uploadingPaymentProof}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingPaymentProof ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Upload className="size-4" aria-hidden="true" />
                      )}
                      {proofUploaded ? 'Cambiar comprobante' : 'Adjuntar comprobante'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex shrink-0 flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="sm:min-w-32"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                className="gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600 sm:min-w-44"
              >
                <Download className="size-4" aria-hidden="true" />
                Descargar orden PDF
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
