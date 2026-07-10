import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { ExternalLink, FileText, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventoryMutations } from '@/hooks/use-products';
import {
  PRODUCT_ATTACHMENT_KINDS,
  PRODUCT_ATTACHMENT_LABELS,
  readAttachmentFile,
} from '@/lib/inventory-attachments';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import { PRODUCT_ATTACHMENT_UPLOAD_HINT } from '@/lib/product-media-upload-limits';
import type { InventoryProduct, ProductAttachment, ProductAttachmentKind } from '@/types/product';

interface InventoryAttachmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryProduct | null;
}

export function InventoryAttachmentsDialog({
  open,
  onOpenChange,
  product,
}: InventoryAttachmentsDialogProps) {
  const { updateProduct } = useInventoryMutations();
  const [attachments, setAttachments] = useState<ProductAttachment[]>([]);
  const [kind, setKind] = useState<ProductAttachmentKind>('technical_sheet');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && product) {
      const normalized = normalizeInventoryProduct(product);
      setAttachments(normalized.attachments ?? []);
      setKind('technical_sheet');
      setError(null);
    }
  }, [open, product]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    try {
      const attachment = await readAttachmentFile(file, kind);
      setAttachments((prev) => [...prev, attachment]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo adjuntar el archivo.');
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!product) return;

    setIsSaving(true);
    setError(null);
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        payload: { attachments },
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los archivos.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Archivos adjuntos</DialogTitle>
          <DialogDescription className="line-clamp-2">{product.name}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="attachment-kind">Tipo de documento</Label>
              <Select
                value={kind}
                onValueChange={(value) => setKind(value as ProductAttachmentKind)}
              >
                <SelectTrigger id="attachment-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_ATTACHMENT_KINDS.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {PRODUCT_ATTACHMENT_LABELS[entry]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachment-file">Archivo</Label>
              <Input
                id="attachment-file"
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                className="cursor-pointer"
                onChange={(event) => void handleFile(event)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            PDF, Word o imágenes. {PRODUCT_ATTACHMENT_UPLOAD_HINT} por archivo.
          </p>

          {attachments.length > 0 ? (
            <ul className="space-y-2">
              {attachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{attachment.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {attachment.file_name ?? 'Archivo adjunto'}
                    </p>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Abrir ${attachment.label}`}
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-destructive hover:text-destructive"
                    aria-label={`Quitar ${attachment.label}`}
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin archivos adjuntos.</p>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-500"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
