# Medición SEO vs fotocopiadoras.pe / Importaciones Pérez / tienda Ricoh

Guía operativa para Search Console y benchmark de queries. No promete posiciones #1: el objetivo es cobertura limpia, canónicos correctos e impresiones crecientes en clusters prioritarios.

## Setup (manual, una vez)

1. **Verificar propiedad** en [Google Search Console](https://search.google.com/search-console) para `haitech.pe` (preferible dominio) o `https://www.haitech.pe`.
   - Método HTML: copia el código de verificación a `.env` como `VITE_GOOGLE_SITE_VERIFICATION=...` y vuelve a desplegar (`npm run build`). El meta se inyecta en `index.html`.
2. Enviar sitemap índice: `https://www.haitech.pe/sitemap.xml` (apunta a `sitemap-core.xml` y `sitemap-products-N.xml`).
3. Solicitar indexación de landings nuevas (prioridad):
   - `/fotocopiadoras-peru`
   - `/fotocopiadoras-ricoh`
   - `/alquiler-fotocopiadoras-lima`
   - `/toner-ricoh`
   - `/distribuidor-autorizado-ricoh`
   - `/guias` y cada guía
   - `/modelos` y hubs (IM 550F, IM 430F, etc.)
4. Revisar **Cobertura / Páginas**: descartar soft-404, duplicados y URLs legacy `/tienda/producto/...` o IDs numéricos si siguen indexadas (inspección de URL + solicitud de indexación de canónicas `/tienda/{slug-semantico}`).
5. Vincular **GA4** (si aplica) y comprobar eventos de cotización / WhatsApp.

## Queries benchmark (mensual)

Comparar impresiones/clics propios en GSC vs presencia del competidor en SERP (herramienta de SEO o revisión manual). Registrar fecha, query, URL propia y nota cualitativa (aparece / no aparece competidor).

| Cluster | Queries ejemplo | URL canónica HaiStore |
|---------|-----------------|------------------------|
| Head | fotocopiadoras peru, venta de fotocopiadoras | `/fotocopiadoras-peru`, `/`, `/tienda` |
| Marca | fotocopiadoras ricoh, multifuncional ricoh | `/fotocopiadoras-ricoh`, `/categoria/multifuncionales` |
| Alquiler | alquiler de fotocopiadoras, alquiler multifuncionales ricoh lima | `/alquiler-fotocopiadoras-lima`, `/servicios?seccion=alquiler` |
| Consumibles | toner ricoh original, toner ricoh compatible | `/toner-ricoh`, `/categoria/toner-suministros` |
| Modelos | ricoh im 550f, im 430f, im c300f, im c320f | `/modelos/{slug}`, `/tienda/{slug}` |
| Servicio | mantenimiento fotocopiadoras ricoh, soporte técnico ricoh lima | `/guias/mantenimiento-fotocopiadoras`, `/servicios?seccion=servicio-tecnico` |
| Confianza | distribuidor autorizado ricoh, distribuidor autorizado ricoh peru | `/distribuidor-autorizado-ricoh` |
| Editorial | cómo elegir multifuncional, toner original vs compatible | `/guias/*` |
| Confianza | por qué comprar fotocopiadoras, faq fotocopiadoras | `/por-que-comprar-con-nosotros`, `/preguntas-frecuentes` |

### Competidores de referencia

- [Tienda Ricoh Perú](https://tienda.ricoh-americalatina.com/pe/) — catálogo oficial y promociones.
- [fotocopiadoras.pe (Ross)](https://www.fotocopiadoras.pe/) — hub “fotocopiadoras” + ofertas locales.
- [Importaciones Pérez](https://www.importacionesperez.com/) — taxonomía profunda multi-marca + blog.

## Ritmo mensual

1. Exportar o filtrar GSC (últimos 28 días): queries con impresiones en los clusters de arriba.
2. Anotar CTR y posición media; priorizar titles/descriptions solo donde haya **impresiones reales + CTR bajo**.
3. Revisar canónicos de `/tienda`, categorías root, landings head y hubs `/modelos`.
4. Comprobar que el sitemap no liste productos `(copia)` ni URLs thin.
5. Ajuste continuo: un cambio de meta o intro por semana máximo en URLs con dato; evitar reescrituras masivas sin evidencia.

## Qué mirar (señales)

- Cobertura: errores 404 / soft-404 en fichas, landings y categorías.
- Canónicos: `/tienda` con SEO propio (no alias a multifuncionales).
- H1 visible en categorías (keyword-led).
- Impresiones crecientes en clusters head / alquiler / tóner / modelos.
- Rich results Product en top fichas (precio / availability).
- LocalBusiness con `sameAs` (WhatsApp), horarios y `areaServed` Lima/Perú.
- Citaciones locales (Google Business Profile) si aplica sede Lince.

## Criterios a 90 días (realistas)

- Queries de clusters prioritarios aparecen en GSC con impresiones (no necesariamente top 3).
- Landings `/fotocopiadoras-peru` y `/fotocopiadoras-ricoh` indexadas.
- Sitemap alineado a canónicas `/tienda/{slug}` sin copias.
- Guías y hubs de modelo indexables con copy útil.
- Offer válido en schema de productos con precio.

## Pendiente manual (fuera del repo)

- Verificación de propiedad GSC / DNS o meta tag.
- Confirmación de perfiles sociales reales si se quieren ampliar `sameAs` / footer (hoy WhatsApp Business).
- Revisión competitiva periódica vs fotocopiadoras.pe / importacionesperez / tienda Ricoh (SERP + backlinks).
