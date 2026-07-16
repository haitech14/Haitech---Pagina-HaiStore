# Medición SEO vs fotocopiadoras.pe

Guía operativa para Search Console y benchmark de queries. No promete posiciones #1: el objetivo es cobertura limpia, canónicos correctos e impresiones crecientes en clusters prioritarios.

## Setup (manual, una vez)

1. **Verificar propiedad** en [Google Search Console](https://search.google.com/search-console) para `haitech.pe` (preferible dominio) o `https://www.haitech.pe`.
2. Enviar sitemap: `https://www.haitech.pe/sitemap.xml`.
3. Revisar **Cobertura / Páginas**: descartar soft-404, duplicados y URLs legacy `/tienda/producto/...` si siguen indexadas (inspección de URL + solicitud de indexación de canónicas).
4. Vincular **GA4** (si aplica) y comprobar eventos de cotización / WhatsApp.

## Queries benchmark (mensual)

Comparar impresiones/clics propios en GSC vs presencia del competidor en SERP (herramienta de SEO o revisión manual). Registrar fecha, query, URL propia y nota cualitativa (aparece / no aparece competidor).

| Cluster | Queries ejemplo | URL canónica HaiStore |
|---------|-----------------|------------------------|
| Head | fotocopiadoras ricoh, fotocopiadoras peru, venta de fotocopiadoras | `/`, `/tienda`, `/categoria/multifuncionales` |
| Alquiler | alquiler de fotocopiadoras, alquiler multifuncionales ricoh lima | `/servicios?seccion=alquiler` |
| Consumibles | toner ricoh original, repuestos fotocopiadoras ricoh | `/categoria/toner-suministros`, `/categoria/repuestos` |
| Modelos | ricoh im c320f, mp 305+, im 460f (y top SKUs del inventario) | `/tienda/{slug}` |
| Servicio | mantenimiento fotocopiadoras ricoh, soporte técnico ricoh lima | `/servicios?seccion=servicio-tecnico` |
| Confianza | por qué comprar fotocopiadoras, faq fotocopiadoras | `/por-que-comprar-con-nosotros`, `/preguntas-frecuentes` |

## Ritmo mensual

1. Exportar o filtrar GSC (últimos 28 días): queries con impresiones en los clusters de arriba.
2. Anotar CTR y posición media; priorizar titles/descriptions solo donde haya **impresiones reales + CTR bajo**.
3. Revisar canónicos de `/tienda`, categorías root y landings FAQ/confianza.
4. Comprobar que el sitemap no liste productos `(copia)` ni URLs thin.
5. Ajuste continuo: un cambio de meta o intro por semana máximo en URLs con dato; evitar reescrituras masivas sin evidencia.

## Qué mirar (señales)

- Cobertura: errores 404 / soft-404 en fichas y categorías.
- Canónicos: `/tienda` con SEO propio (no alias a multifuncionales).
- Impresiones crecientes en clusters head / alquiler / tóner.
- Rich results Product en top fichas (precio / availability).
- Citaciones locales (Google Business Profile) si aplica sede Lince.

## Criterios a 90 días (realistas)

- Queries de clusters prioritarios aparecen en GSC con impresiones (no necesariamente top 3).
- Sitemap alineado a canónicas `/tienda/{slug}` sin copias.
- Landings FAQ y confianza indexables con copy útil.
- Offer válido en schema de productos con precio.

## Pendiente manual (fuera del repo)

- Verificación de propiedad GSC / DNS o meta tag.
- Confirmación de perfiles sociales reales si se quieren reactivar `sameAs` / footer.
- Revisión competitiva periódica vs fotocopiadoras.pe (SERP + backlinks).
