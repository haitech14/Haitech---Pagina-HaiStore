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
    return 'Para programar servicio técnico, visita la sección Contacto o escríbenos por WhatsApp al +51 915 149 290 con modelo y ciudad.';
  }

  if (
    text.includes('lista') &&
    (text.includes('precio') || text.includes('tarifa') || text.includes('catalogo'))
  ) {
    return 'Podemos enviarte la lista de precios por WhatsApp al +51 915 149 290 según tu perfil comercial (retail, mayorista, etc.).';
  }

  if (text.includes('stock') || text.includes('disponib') || text.includes('inventario')) {
    return 'Escribe el modelo o código del producto y te muestro el stock al instante. También puedes pulsar el botón «Stock» debajo del chat.';
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
    return 'Escribe el producto que buscas y te doy el precio actualizado. Usa el botón «Precio» o escribe algo como «precio Ricoh IM 430F».';
  }

  if (text.includes('whatsapp') || text.includes('asesor') || text.includes('humano')) {
    return 'Escríbenos por WhatsApp al +51 915 149 290 y te atenderá nuestro equipo de ventas.';
  }

  return 'Gracias por tu mensaje. Escríbenos por WhatsApp al +51 915 149 290 o visita la tienda para más información.';
}
