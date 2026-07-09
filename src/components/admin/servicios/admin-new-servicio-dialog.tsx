import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

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
import type { CreateAdminServicioInput } from '@/hooks/use-admin-servicios';
import type { ServiceCatalogModalidad, ServiceCatalogTipo, ServiceCategory } from '@/types/service';

interface AdminNewServicioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  defaultModalidad?: ServiceCatalogModalidad;
  defaultTipo?: ServiceCatalogTipo;
  onSubmit: (input: CreateAdminServicioInput) => void;
}

export function AdminNewServicioDialog({
  open,
  onOpenChange,
  categories,
  defaultModalidad = 'presencial',
  defaultTipo = 'unico',
  onSubmit,
}: AdminNewServicioDialogProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [modalidad, setModalidad] = useState<ServiceCatalogModalidad>(defaultModalidad);
  const [tipo, setTipo] = useState<ServiceCatalogTipo>(defaultTipo);
  const [cobertura, setCobertura] = useState('Nacional');
  const [publicPrice, setPublicPrice] = useState('');
  const [responsableName, setResponsableName] = useState('');
  const [responsableTitle, setResponsableTitle] = useState('');

  const activeCategories = categories.filter((category) => category.active);

  useEffect(() => {
    if (!open) return;
    setName('');
    setCategoryId(activeCategories[0]?.id ?? categories[0]?.id ?? '');
    setModalidad(defaultModalidad);
    setTipo(defaultTipo);
    setCobertura('Nacional');
    setPublicPrice('');
    setResponsableName('');
    setResponsableTitle('');
  }, [open, activeCategories, categories, defaultModalidad, defaultTipo]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !categoryId) return;

    onSubmit({
      name: name.trim(),
      categoryId,
      modalidad,
      tipo,
      cobertura: cobertura.trim() || 'Nacional',
      publicPrice: publicPrice ? Number(publicPrice) : 0,
      ...(responsableName.trim() ? { responsableName: responsableName.trim() } : {}),
      ...(responsableTitle.trim() ? { responsableTitle: responsableTitle.trim() } : {}),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo servicio</DialogTitle>
          <DialogDescription>
            Agrega un servicio al catálogo y lista de precios de la tienda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="svc-name">Nombre del servicio</Label>
            <Input
              id="svc-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Mantenimiento preventivo"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-category">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="svc-category">
                  <SelectValue placeholder="Seleccionar" />
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
              <Label htmlFor="svc-price">Precio base (PEN)</Label>
              <Input
                id="svc-price"
                type="number"
                min="0"
                step="0.01"
                value={publicPrice}
                onChange={(event) => setPublicPrice(event.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-modalidad">Modalidad</Label>
              <Select
                value={modalidad}
                onValueChange={(value) => setModalidad(value as ServiceCatalogModalidad)}
              >
                <SelectTrigger id="svc-modalidad">
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
              <Label htmlFor="svc-tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(value) => setTipo(value as ServiceCatalogTipo)}>
                <SelectTrigger id="svc-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unico">Único</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="proyecto">Proyecto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-cobertura">Cobertura</Label>
            <Input
              id="svc-cobertura"
              value={cobertura}
              onChange={(event) => setCobertura(event.target.value)}
              placeholder="Nacional"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-responsable">Responsable</Label>
              <Input
                id="svc-responsable"
                value={responsableName}
                onChange={(event) => setResponsableName(event.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-cargo">Cargo</Label>
              <Input
                id="svc-cargo"
                value={responsableTitle}
                onChange={(event) => setResponsableTitle(event.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-hover))]"
            >
              <Plus className="size-4" aria-hidden="true" />
              Crear servicio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
