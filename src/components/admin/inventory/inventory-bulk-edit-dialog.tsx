import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { InventoryMultiSelectField } from '@/components/admin/inventory/inventory-multi-select-field';
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
import type { InventorySelectOption } from '@/lib/inventory-category-options';
import type {
  InventoryBulkAttributeMode,
  InventoryBulkCategoryMode,
  InventoryBulkCodeMode,
  InventoryBulkNameMode,
  InventoryBulkPatch,
  InventoryBulkStockMode,
} from '@/types/inventory-bulk';

interface InventoryBulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  categoryOptions: InventorySelectOption[] | string[];
  attributeNameOptions: string[];
  onApply: (patch: InventoryBulkPatch) => Promise<void>;
  isSaving: boolean;
  /** Sección inicial al abrir (p. ej. categorías desde el toolbar). */
  initialFocus?: 'categories' | 'name' | 'code' | null;
}

type TextFieldMode = InventoryBulkNameMode | 'none';

function TextTransformFields({
  idPrefix,
  legend,
  mode,
  onModeChange,
  text,
  onTextChange,
  replaceWith,
  onReplaceWithChange,
  insertAfter,
  onInsertAfterChange,
}: {
  idPrefix: string;
  legend: string;
  mode: TextFieldMode;
  onModeChange: (mode: TextFieldMode) => void;
  text: string;
  onTextChange: (value: string) => void;
  replaceWith: string;
  onReplaceWithChange: (value: string) => void;
  insertAfter: string;
  onInsertAfterChange: (value: string) => void;
}) {
  return (
    <fieldset className="grid gap-3 rounded-lg border p-4">
      <legend className="px-1 text-sm font-medium">{legend}</legend>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-mode`}>Modo</Label>
        <Select value={mode} onValueChange={(value) => onModeChange(value as TextFieldMode)}>
          <SelectTrigger id={`${idPrefix}-mode`} className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin cambio</SelectItem>
            <SelectItem value="prepend">Prefijo (al inicio)</SelectItem>
            <SelectItem value="append">Sufijo (al final)</SelectItem>
            <SelectItem value="insert">Insertar en el medio</SelectItem>
            <SelectItem value="duplicate">Duplicar texto</SelectItem>
            <SelectItem value="remove">Quitar texto</SelectItem>
            <SelectItem value="replace">Reemplazar texto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {mode !== 'none' && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-text`}>
              {mode === 'replace'
                ? 'Buscar'
                : mode === 'duplicate'
                  ? 'Texto a duplicar'
                  : mode === 'insert'
                    ? 'Texto a insertar'
                    : 'Texto'}
            </Label>
            <Input
              id={`${idPrefix}-text`}
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder={
                mode === 'remove' || mode === 'replace' || mode === 'duplicate'
                  ? 'Ej. HP LaserJet'
                  : 'Ej. WiFi'
              }
              required
            />
          </div>
          {mode === 'insert' && (
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-insert-after`}>Después de (opcional)</Label>
              <Input
                id={`${idPrefix}-insert-after`}
                value={insertAfter}
                onChange={(event) => onInsertAfterChange(event.target.value)}
                placeholder="Vacío = mitad del texto"
              />
              <p className="text-xs text-muted-foreground">
                Si indiques un fragmento, el texto se inserta justo después de la primera
                coincidencia.
              </p>
            </div>
          )}
          {mode === 'replace' && (
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-replace`}>Reemplazar por</Label>
              <Input
                id={`${idPrefix}-replace`}
                value={replaceWith}
                onChange={(event) => onReplaceWithChange(event.target.value)}
                placeholder="Dejar vacío para eliminar"
              />
            </div>
          )}
          {mode === 'duplicate' && (
            <p className="text-xs text-muted-foreground">
              Duplica cada aparición del texto. Si no aparece, se agrega al final.
            </p>
          )}
        </>
      )}
    </fieldset>
  );
}

export function InventoryBulkEditDialog({
  open,
  onOpenChange,
  selectedCount,
  categoryOptions,
  attributeNameOptions,
  onApply,
  isSaving,
  initialFocus = null,
}: InventoryBulkEditDialogProps) {
  const [categoryMode, setCategoryMode] = useState<InventoryBulkCategoryMode | 'none'>('none');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [nameMode, setNameMode] = useState<TextFieldMode>('none');
  const [nameText, setNameText] = useState('');
  const [nameReplaceWith, setNameReplaceWith] = useState('');
  const [nameInsertAfter, setNameInsertAfter] = useState('');
  const [codeMode, setCodeMode] = useState<TextFieldMode>('none');
  const [codeText, setCodeText] = useState('');
  const [codeReplaceWith, setCodeReplaceWith] = useState('');
  const [codeInsertAfter, setCodeInsertAfter] = useState('');
  const [attributeMode, setAttributeMode] = useState<InventoryBulkAttributeMode | 'none'>('none');
  const [attributeName, setAttributeName] = useState('');
  const [attributeValue, setAttributeValue] = useState('');
  const [stockMode, setStockMode] = useState<InventoryBulkStockMode | 'none'>('none');
  const [stock, setStock] = useState('');
  const [pricePercent, setPricePercent] = useState('');
  const [purchasePricePercent, setPurchasePricePercent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categorySelectOptions = useMemo<InventorySelectOption[]>(
    () =>
      categoryOptions.map((entry) =>
        typeof entry === 'string' ? { value: entry, label: entry } : entry,
      ),
    [categoryOptions],
  );

  const attributeListId = 'bulk-attribute-names';

  useEffect(() => {
    if (!open) return;
    setCategoryMode(initialFocus === 'categories' ? 'add' : 'none');
    setSelectedCategories([]);
    setNameMode(initialFocus === 'name' ? 'prepend' : 'none');
    setNameText('');
    setNameReplaceWith('');
    setNameInsertAfter('');
    setCodeMode(initialFocus === 'code' ? 'prepend' : 'none');
    setCodeText('');
    setCodeReplaceWith('');
    setCodeInsertAfter('');
    setAttributeMode('none');
    setAttributeName('');
    setAttributeValue('');
    setStockMode('none');
    setStock('');
    setPricePercent('');
    setPurchasePricePercent('');
    setError(null);
  }, [open, initialFocus]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const patch: InventoryBulkPatch = {};

    if (categoryMode !== 'none') {
      if (selectedCategories.length === 0) {
        setError('Selecciona al menos una categoría.');
        return;
      }
      patch.categoryMode = categoryMode;
      patch.categories = selectedCategories;
    }

    if (nameMode !== 'none') {
      if (!nameText.trim()) {
        setError('Indica el texto del nombre del producto.');
        return;
      }
      patch.nameMode = nameMode as InventoryBulkNameMode;
      patch.nameText = nameText;
      if (nameMode === 'replace') {
        patch.nameReplaceWith = nameReplaceWith;
      }
      if (nameMode === 'insert' && nameInsertAfter.trim()) {
        patch.nameInsertAfter = nameInsertAfter;
      }
    }

    if (codeMode !== 'none') {
      if (!codeText.trim()) {
        setError('Indica el texto del código.');
        return;
      }
      patch.codeMode = codeMode as InventoryBulkCodeMode;
      patch.codeText = codeText;
      if (codeMode === 'replace') {
        patch.codeReplaceWith = codeReplaceWith;
      }
      if (codeMode === 'insert' && codeInsertAfter.trim()) {
        patch.codeInsertAfter = codeInsertAfter;
      }
    }

    if (attributeMode !== 'none') {
      if (attributeMode === 'remove') {
        if (!attributeName.trim()) {
          setError('Indica el nombre del atributo a quitar.');
          return;
        }
        patch.attributeMode = 'remove';
        patch.attributeName = attributeName.trim();
      } else {
        if (!attributeName.trim()) {
          setError('Indica el nombre del atributo.');
          return;
        }
        patch.attributeMode = attributeMode;
        patch.attribute = {
          name: attributeName.trim(),
          value: attributeValue.trim(),
        };
      }
    }

    if (stockMode !== 'none') {
      patch.stockMode = stockMode;
      patch.stock = Number(stock);
      if (Number.isNaN(patch.stock)) {
        setError('Indica un valor de stock válido.');
        return;
      }
    }

    if (pricePercent.trim()) {
      patch.pricePercent = Number(pricePercent);
      if (Number.isNaN(patch.pricePercent)) {
        setError('El porcentaje de precios no es válido.');
        return;
      }
    }

    if (purchasePricePercent.trim()) {
      patch.purchasePricePercent = Number(purchasePricePercent);
      if (Number.isNaN(patch.purchasePricePercent)) {
        setError('El porcentaje de precio de compra no es válido.');
        return;
      }
    }

    if (Object.keys(patch).length === 0) {
      setError('Selecciona al menos un cambio a aplicar.');
      return;
    }

    try {
      await onApply(patch);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aplicar los cambios.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Modificación masiva</DialogTitle>
          <DialogDescription>
            Aplicar cambios a {selectedCount} producto{selectedCount === 1 ? '' : 's'} seleccionado
            {selectedCount === 1 ? '' : 's'}. Los campos en «Sin cambio» no se modifican.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <fieldset className="grid gap-3 rounded-lg border p-4">
            <legend className="px-1 text-sm font-medium">Categorías</legend>
            <div className="space-y-2">
              <Label htmlFor="bulk-category-mode">Modo</Label>
              <Select
                value={categoryMode}
                onValueChange={(value) =>
                  setCategoryMode(value as InventoryBulkCategoryMode | 'none')
                }
              >
                <SelectTrigger id="bulk-category-mode" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cambio</SelectItem>
                  <SelectItem value="add">Agregar categorías</SelectItem>
                  <SelectItem value="remove">Eliminar categorías</SelectItem>
                  <SelectItem value="set">Reemplazar todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {categoryMode !== 'none' && (
              <InventoryMultiSelectField
                id="bulk-categories"
                label={
                  categoryMode === 'add'
                    ? 'Categorías a agregar'
                    : categoryMode === 'remove'
                      ? 'Categorías a eliminar'
                      : 'Nuevas categorías'
                }
                options={categorySelectOptions}
                selected={selectedCategories}
                onChange={setSelectedCategories}
              />
            )}
          </fieldset>

          <TextTransformFields
            idPrefix="bulk-name"
            legend="Nombre del producto"
            mode={nameMode}
            onModeChange={setNameMode}
            text={nameText}
            onTextChange={setNameText}
            replaceWith={nameReplaceWith}
            onReplaceWithChange={setNameReplaceWith}
            insertAfter={nameInsertAfter}
            onInsertAfterChange={setNameInsertAfter}
          />

          <TextTransformFields
            idPrefix="bulk-code"
            legend="Código / SKU"
            mode={codeMode}
            onModeChange={setCodeMode}
            text={codeText}
            onTextChange={setCodeText}
            replaceWith={codeReplaceWith}
            onReplaceWithChange={setCodeReplaceWith}
            insertAfter={codeInsertAfter}
            onInsertAfterChange={setCodeInsertAfter}
          />

          <fieldset className="grid gap-3 rounded-lg border p-4">
            <legend className="px-1 text-sm font-medium">Atributos</legend>
            <div className="space-y-2">
              <Label htmlFor="bulk-attribute-mode">Modo</Label>
              <Select
                value={attributeMode}
                onValueChange={(value) =>
                  setAttributeMode(value as InventoryBulkAttributeMode | 'none')
                }
              >
                <SelectTrigger id="bulk-attribute-mode" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cambio</SelectItem>
                  <SelectItem value="add">Agregar o actualizar</SelectItem>
                  <SelectItem value="remove">Quitar por nombre</SelectItem>
                  <SelectItem value="set">Reemplazar todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {attributeMode !== 'none' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bulk-attribute-name">Nombre del atributo</Label>
                  <Input
                    id="bulk-attribute-name"
                    list={attributeListId}
                    value={attributeName}
                    onChange={(event) => setAttributeName(event.target.value)}
                    placeholder="Ej. Color"
                    required
                  />
                  <datalist id={attributeListId}>
                    {attributeNameOptions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                {attributeMode !== 'remove' && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bulk-attribute-value">Valor</Label>
                    <Input
                      id="bulk-attribute-value"
                      value={attributeValue}
                      onChange={(event) => setAttributeValue(event.target.value)}
                      placeholder="Ej. B/N"
                    />
                  </div>
                )}
              </div>
            )}
          </fieldset>

          <fieldset className="grid gap-3 rounded-lg border p-4">
            <legend className="px-1 text-sm font-medium">Stock</legend>
            <div className="space-y-2">
              <Label htmlFor="bulk-stock-mode">Modo</Label>
              <Select
                value={stockMode}
                onValueChange={(value) => setStockMode(value as InventoryBulkStockMode | 'none')}
              >
                <SelectTrigger id="bulk-stock-mode" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cambio</SelectItem>
                  <SelectItem value="set">Establecer valor</SelectItem>
                  <SelectItem value="add">Sumar o restar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {stockMode !== 'none' && (
              <div className="space-y-2">
                <Label htmlFor="bulk-stock">
                  {stockMode === 'set' ? 'Nuevo stock' : 'Cantidad (+/-)'}
                </Label>
                <Input
                  id="bulk-stock"
                  type="number"
                  step={1}
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  required
                />
              </div>
            )}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bulk-price-percent">Precios por rol (%)</Label>
              <Input
                id="bulk-price-percent"
                type="number"
                step={0.1}
                placeholder="ej. 5 o -10"
                value={pricePercent}
                onChange={(event) => setPricePercent(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Afecta los 6 precios de cada producto.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-purchase-percent">Precio compra (%)</Label>
              <Input
                id="bulk-purchase-percent"
                type="number"
                step={0.1}
                placeholder="ej. 3"
                value={purchasePricePercent}
                onChange={(event) => setPurchasePricePercent(event.target.value)}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-500" disabled={isSaving}>
              {isSaving ? 'Aplicando…' : 'Aplicar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
