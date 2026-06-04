# Semillas de importación

Coloca aquí los Excel exportados del ERP:

- `Reporte_Persona_*.xlsx` (raíz de `seeds/`)
- `ventas/Reporte_de_Ventas_*.xlsx`

Luego ejecuta:

```bash
node scripts/import-persona-customers.mjs
node scripts/import-ventas-reports.mjs
```

Los archivos `.xlsx` no se suben al repositorio.
