import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { UpdateAdminServicioInput } from '@/hooks/use-admin-servicios';
import type { AdminServicioRecord } from '@/types/admin-servicios';
import type {
  ServiceCatalogEstado,
  ServiceCatalogModalidad,
  ServiceCatalogTipo,
  ServiceCategory,
  ServicePriceItem,
} from '@/types/service';

interface AdminEditServicioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AdminServicioRecord | null;
  priceItem: ServicePriceItem | null;
  categories: ServiceCategory[];
  onSubmit: (sourceId: string, input: UpdateAdminServicioInput) => void;
}

export function AdminEditServicioDialog({
  open,
  onOpenChange,
  record,
  priceItem,
  categories,
  onSubmit,
}: AdminEditServicioDialogProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [modalidad, setModalidad] = useState<ServiceCatalogModalidad>('presencial');
  const [tipo, setTipo] = useState<ServiceCatalogTipo>('unico');
  const [estado, setEstado] = useState<ServiceCatalogEstado>('activo');
  const [cobertura, setCobertura] = useState('');
  const [publicPrice, setPublicPrice] = useState('');
  const [responsableName, setResponsableName] = useState('');
  const [responsableTitle, setResponsableTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open || !record || !priceItem) return;
    setName(record.name);
    setCategoryId(priceItem.categoryId);
    setModalidad(record.modalidad);
    setTipo(record.tipo);
    setEstado(record.estado);
    setCobertura(record.cobertura);
    setPublicPrice(String(priceItem.prices.public ?? 0));
    setResponsableName(priceItem.responsableName ?? record.responsable.name);
    setResponsableTitle(priceItem.responsableTitle ?? record.responsable.title);
    setDescription(priceItem.description ?? '');
  }, [open, record, priceItem]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!record) return;

    onSubmit(record.sourceId, {
      name: name.trim(),
      categoryId,
      modalidad,
      tipo,
      estado,
      cobertura: cobertura.trim(),
      publicPrice: publicPrice ? Number(publicPrice) : 0,
      responsableName: responsableName.trim(),
      responsableTitle: responsableTitle.trim(),
      description: description.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar servicio</DialogTitle>
          <DialogDescription>
            Actualiza la ficha del catálogo y su precio público en soles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-svc-name">Nombre</Label>
            <Input
              id="edit-svc-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-svc-category">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="edit-svc-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-svc-estado">Estado</Label>
              <Select
                value={estado}
                onValueChange={(value) => setEstado(value as ServiceCatalogEstado)}
              >
                <SelectTrigger id="edit-svc-estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="archivado">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-svc-modalidad">Modalidad</Label>
              <Select
                value={modalidad}
                onValueChange={(value) => setModalidad(value as ServiceCatalogModalidad)}
              >
                <SelectTrigger id="edit-svc-modalidad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="remoto">Remoto</SelectItem>
                  <SelectItem value="mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-svc-tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(value) => setTipo(value as ServiceCatalogTipo)}>
                <SelectTrigger id="edit-svc-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unico">Único</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="proyecto">Proyecto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-svc-price">Precio PEN</Label>
              <Input
                id="edit-svc-price"
                type="number"
                min="0"
                step="0.01"
                value={publicPrice}
                onChange={(event) => setPublicPrice(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-svc-cobertura">Cobertura</Label>
            <Input
              id="edit-svc-cobertura"
              value={cobertura}
              onChange={(event) => setCobertura(event.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-svc-responsable">Responsable</Label>
              <Input
                id="edit-svc-responsable"
                value={responsableName}
                onChange={(event) => setResponsableName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-svc-cargo">Cargo</Label>
              <Input
                id="edit-svc-cargo"
                value={responsableTitle}
                onChange={(event) => setResponsableTitle(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-svc-description">Descripción</Label>
            <textarea
              id="edit-svc-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="flex min-h-[5rem] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-hover))]"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
