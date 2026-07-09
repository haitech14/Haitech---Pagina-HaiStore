/**
 * Cliente para la integración con HaiSupport.
 * Delega en haisupport-tickets.js (REST, Supabase bridge o respaldo local).
 */

export { createSupportTicket, isHaiSupportConfigured } from './haisupport-tickets.js';
