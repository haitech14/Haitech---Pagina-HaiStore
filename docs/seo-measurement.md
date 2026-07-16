# Medición SEO vs fotocopiadoras.pe

Guía operativa para Search Console, Analytics y benchmark de queries. No sustituye el trabajo off-page (enlaces, citaciones locales).

## Setup (una vez)

1. **Google Search Console** en `https://www.haitech.pe` (propiedad de dominio o URL-prefix).
2. Enviar sitemap: `https://www.haitech.pe/sitemap.xml`.
3. Verificar que no queden URLs legacy `/tienda/producto/...` indexadas masivamente (cobertura + inspección de URL).
4. **Google Analytics 4** (o la propiedad ya vinculada) con eventos de cotización / WhatsApp si existen.

## Queries objetivo (benchmark mensual)

Comparar impresiones/clics propios vs presencia del competidor en SERP (Ahrefs/Semrush si hay acceso; si no, búsqueda manual + GSC):

| Cluster | Queries ejemplo | URL canónica HaiStore |
|---------|-----------------|------------------------|
| Head | fotocopiadoras ricoh, fotocopiadoras peru, venta de fotocopiadoras | `/`, `/tienda`, `/categoria/multifuncionales` |
| Alquiler | alquiler de fotocopiadoras, alquiler multifuncionales ricoh lima | `/servicios?seccion=alquiler` |
| Consumibles | toner ricoh original, repuestos fotocopiadoras ricoh | `/categoria/toner-suministros`, `/categoria/repuestos` |
| Modelos | ricoh im c320f, mp 305+, im 460f | `/tienda/{slug}` |
| Servicio | mantenimiento fotocopiadoras ricoh, soporte técnico ricoh lima | `/servicios?seccion=servicio-tecnico` |
| Confianza | por qué comprar fotocopiadoras, faq fotocopiadoras | `/por-que-comprar-con-nosotros`, `/preguntas-frecuentes` |

## Checklist mensual

- [ ] Cobertura GSC: errores 404/soft-404 en fichas y categorías.
- [ ] Canónicos: `/tienda` y categorías con title/description correctos (no alias a otra categoría).
- [ ] Queries nuevas con impresiones; anotar CTR y posición media.
- [ ] Top 10 fichas de producto: rich results Product (precio / availability).
- [ ] Citaciones locales (Google Business Profile) si aplica tienda física Lince.
- [ ] Ajuste de titles/intros solo donde haya query real con CTR bajo.

## Criterios a 90 días

- Queries del cluster head/alquiler aparecen en GSC con impresiones crecientes.
- 0 URLs legacy masivas en sitemap.
- `/tienda`, categorías y landings FAQ/confianza indexables con copy útil.
- Top modelos con Offer válido en schema.
