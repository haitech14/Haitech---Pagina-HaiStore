export interface HaibotChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

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

export function getHaibotAssistantReply(userText: string): string {
  const text = normalize(userText.trim());

  if (!text) {
    return 'Escribe tu consulta y te indicaré el siguiente paso.';
  }

  if (
    text.includes('servicio') ||
    text.includes('tecnico') ||
    text.includes('repar') ||
    text.includes('manten')
  ) {
    return 'Para programar servicio técnico, toca «Servicio técnico» abajo o escríbenos por WhatsApp con modelo y ciudad.';
  }

  if (
    text.includes('lista') &&
    (text.includes('precio') || text.includes('tarifa') || text.includes('catalogo'))
  ) {
    return 'Toca «Lista de precios» en las opciones rápidas. Te atenderemos por WhatsApp con tu lista según tu perfil (retail, mayorista, etc.).';
  }

  if (text.includes('stock') || text.includes('disponib') || text.includes('inventario')) {
    return 'Toca «Stock» en las opciones rápidas e indica marca y modelo (ej. Ricoh IM 5000).';
  }

  if (
    text.includes('pedido') ||
    text.includes('seguim') ||
    text.includes('envio') ||
    text.includes('tracking')
  ) {
    return 'El seguimiento de pedidos está en «Mi cuenta» → Mis compras. Si no ves tu pedido, inicia sesión con el mismo correo de la compra.';
  }

  if (text.includes('precio') || text.includes('cotiz') || text.includes('cuanto')) {
    return 'Los precios actualizados están en la tienda. Toca «Precios» abajo o pide cotización por WhatsApp.';
  }

  if (text.includes('whatsapp') || text.includes('asesor') || text.includes('humano')) {
    return 'Toca «WhatsApp» en las opciones rápidas para hablar con nuestro chatbot.';
  }

  return 'Gracias por tu mensaje. Usa las opciones rápidas de abajo (precios, stock, servicio técnico o WhatsApp) o llama al +51 915 149 290.';
}
