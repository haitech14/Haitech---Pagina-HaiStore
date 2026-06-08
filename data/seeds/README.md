# Semillas HaiSales (ERP)

Coloca aquí los Excel exportados desde **HaiSales**:

- `Reporte_Persona_*.xlsx` (raíz de `seeds/`)
- `ventas/Reporte_de_Ventas_*.xlsx`

Luego ejecuta:

```bash
npm run haisales:sync
# o por separado:
node scripts/import-persona-customers.mjs
node scripts/import-ventas-reports.mjs
```

Desde el admin: **Configuración → Integraciones → Sincronizar semillas** o **Ventas → Sincronizar HaiSales**.

Los archivos `.xlsx` no se suben al repositorio.

## Tóner compatibles

Coloca `Toner-Compatibles.xlsx` en esta carpeta o pasa la ruta al script:

```bash
npm run import:toner-compatibles
# o:
node scripts/import-compatible-toner-products.mjs "ruta/al/Toner Compatibles.xlsx"
```

Importa cartuchos y recargas a la subcategoría **Toner Compatibles** con proveedor MICAMERB.

## Lista de precios procesada

Coloca `Lista_Precios_Procesada.xlsx` en esta carpeta o pasa la ruta al script:

```bash
npm run import:processed-price-list
# o:
node scripts/import-processed-price-list.mjs "ruta/a/Lista_Precios_Procesada.xlsx"
```

Importa ~112 productos a **Toner Compatibles** con códigos `LP-*`, precios en USD (conversión desde soles con el tipo de cambio de ajustes de empresa) y reglas:

- **Mayorista** = Distribuidor − 10 (soles, recalculado siempre)
- **Corporativo S/** → precio público
- Filas «Unidad de imagen»: nombre sin prefijo «Toner cartucho compatible RICOH»; filas «4 COLORES» se expanden a Cyan, Magenta, Yellow y Negro
- Fusiona por código: conserva stock, galería e imágenes de productos existentes
