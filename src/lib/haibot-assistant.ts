import type { HaibotSearchFocus } from '@/lib/haibot-inventory-search';
import type { HaibotWorkflowId } from '@/lib/haibot-quick-actions';

export interface HaibotChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export type HaibotAssistantResult = {
  reply: string;
  openWorkflow?: HaibotWorkflowId;
  openSearch?: HaibotSearchFocus;
};

export function createHaibotMessage(
  role: HaibotChatMessage['role'],
  content: string,
): HaibotChatMessage {
  const time = new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    time,
  };
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function getHaibotAssistantReply(userText: string): HaibotAssistantResult {
  const text = normalize(userText.trim());

  if (!text) {
    return { reply: 'Escribe tu consulta y te indicaré el siguiente paso.' };
  }

  if (
    text.includes('servicio') ||
    text.includes('tecnico') ||
    text.includes('repar') ||
    text.includes('manten') ||
    text.includes('cita') ||
    text.includes('agendar') ||
    text.includes('programar')
  ) {
    return {
      reply:
        'Perfecto. Abro el formulario de Soporte para programar tu cita técnica. Completa los datos y elige un horario disponible.',
      openWorkflow: 'support',
    };
  }

  if (
    text.includes('lista') &&
    (text.includes('precio') || text.includes('tarifa') || text.includes('catalogo'))
  ) {
    return {
      reply:
        'Podemos enviarte la lista de precios por WhatsApp al +51 915 149 290 según tu perfil comercial (retail, mayorista, etc.). También puedes usar «Lista precios».',
    };
  }

  if (text.includes('stock') || text.includes('disponib') || text.includes('inventario')) {
    return {
      reply:
        'Modo consulta activado 🔍 Escribe el modelo o código del producto y te muestro stock y precio.',
      openSearch: 'all',
    };
  }

  if (
    text.includes('pedido') ||
    text.includes('seguim') ||
    text.includes('envio') ||
    text.includes('tracking')
  ) {
    return {
      reply:
        'El seguimiento de pedidos está en «Mi cuenta» → Mis compras. Si no ves tu pedido, inicia sesión con el mismo correo de la compra. Para armar un envío, usa la pestaña Envíos.',
    };
  }

  if (text.includes('precio') || text.includes('cotiz') || text.includes('cuanto')) {
    return {
      reply:
        'Modo cotización 💲 Escribe el producto que buscas (ej. Ricoh IM 430F o su código) y te doy el precio actualizado.',
      openSearch: 'price',
    };
  }

  if (text.includes('whatsapp') || text.includes('asesor') || text.includes('humano')) {
    return {
      reply:
        'Escríbenos por WhatsApp al +51 915 149 290 y te atenderá nuestro equipo. También puedes usar «WhatsApp» o «Agendar WA» debajo del chat.',
    };
  }

  return {
    reply:
      '¿Qué deseas hacer? Usa las pestañas: Buscar / Cotización para consultas, Soporte para programar una cita técnica, o Envíos / Ventas. También puedes escribirme con más detalle.',
  };
}
