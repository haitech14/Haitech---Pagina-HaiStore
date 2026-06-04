import { openHtmlInNewWindow } from '@/lib/open-html-document';
import { buildAgencyDisplay, buildShipmentCopyMessage } from '@/lib/shipment-copy-message';
import type { ShipmentRecord } from '@/types/shipping';

export interface ShipmentGuiaContext {
  carrierName: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildShipmentGuiaRemisionHtml(
  shipment: ShipmentRecord,
  context: ShipmentGuiaContext,
  options?: { autoPrint?: boolean },
): string {
  const agencyDisplay = buildAgencyDisplay(context.carrierName, shipment.agencyDetail);
  const razon = shipment.razonSocial?.trim() || shipment.customerName;
  const destino = shipment.destination?.trim() || shipment.district;
  const copyBlock = buildShipmentCopyMessage(shipment, { agencyDisplay }).replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Guía de remisión ${escapeHtml(shipment.orderRef)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; font-size: 12px; color: #111; padding: 14mm; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    .meta { color: #666; margin-bottom: 12px; font-size: 11px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 14px; }
    .field label { display: block; font-size: 9px; text-transform: uppercase; color: #888; }
    .field p { font-weight: 600; margin-top: 2px; }
    .copy { border: 1px solid #ddd; border-radius: 8px; padding: 12px; background: #fafafa; line-height: 1.5; font-size: 11px; }
    .footer { margin-top: 16px; display: flex; justify-content: space-between; font-size: 10px; color: #666; }
    .sign { margin-top: 40px; border-top: 1px solid #111; width: 200px; padding-top: 4px; text-align: center; }
    @media print { body { padding: 10mm; } }
  </style>
</head>
<body>
  <h1>Guía de remisión — transportista</h1>
  <p class="meta">N.º ${escapeHtml(shipment.orderRef)} · ${escapeHtml(shipment.trackingCode)} · Haitech</p>
  <div class="grid">
    <div class="field"><label>Remitente</label><p>Haitech S.A.C.</p></div>
    <div class="field"><label>Fecha</label><p>${escapeHtml((shipment.shipmentDate ?? shipment.createdAt).slice(0, 10))}</p></div>
    <div class="field"><label>Destinatario</label><p>${escapeHtml(razon)}</p></div>
    <div class="field"><label>RUC</label><p>${escapeHtml(shipment.taxId ?? '—')}</p></div>
    <div class="field"><label>Dirección</label><p>${escapeHtml(shipment.address ?? '—')}</p></div>
    <div class="field"><label>Destino</label><p>${escapeHtml(destino)}</p></div>
    <div class="field"><label>Atención</label><p>${escapeHtml(shipment.attention ?? '—')}</p></div>
    <div class="field"><label>Agencia</label><p>${escapeHtml(agencyDisplay)}</p></div>
  </div>
  <div class="copy">${copyBlock}</div>
  <div class="footer">
    <div class="sign">Firma remitente</div>
    <div class="sign">Firma transportista</div>
    <div class="sign">Firma destinatario</div>
  </div>
  ${options?.autoPrint ? '<script>window.onload = function() { window.print(); };</script>' : ''}
</body>
</html>`;
}

export function printShipmentGuiaRemision(
  shipment: ShipmentRecord,
  context: ShipmentGuiaContext,
): void {
  openHtmlInNewWindow(buildShipmentGuiaRemisionHtml(shipment, context, { autoPrint: true }), {
    width: 720,
    height: 900,
    autoPrint: true,
  });
}
