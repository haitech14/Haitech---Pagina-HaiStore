/**
 * Slots públicos de soporte técnico (Lima): Lun–Sáb, 9–12 y 14–17, bloques de 1 h.
 */

import { readServiceRequests } from './service-requests-store.js';

const TIMEZONE = 'America/Lima';
const SLOT_HOURS = [9, 10, 11, 14, 15, 16];
const BUSINESS_DAYS = 10;
const CAPACITY_PER_SLOT = 1;

/**
 * @param {Date} date
 * @returns {string} YYYY-MM-DD in America/Lima
 */
function limaDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * @param {Date} date
 * @returns {number} 0=Sun … 6=Sat in America/Lima
 */
function limaWeekday(date) {
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
  }).format(date);
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wd] ?? 0;
}

/**
 * Build ISO instant for a Lima local date + hour (no DST in PE).
 * @param {string} dateKey YYYY-MM-DD
 * @param {number} hour
 */
function limaLocalToIso(dateKey, hour) {
  return new Date(`${dateKey}T${String(hour).padStart(2, '0')}:00:00-05:00`).toISOString();
}

/**
 * @param {string} iso
 */
function formatSlotLabel(iso) {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/**
 * @param {string} iso
 */
function slotKey(iso) {
  return limaDateKey(new Date(iso)) + 'T' + new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

/**
 * Generate candidate slots for the next business days.
 * @param {Date} [now]
 */
export function generateSupportSlotCandidates(now = new Date()) {
  /** @type {{ start: string; label: string }[]} */
  const slots = [];
  let cursor = new Date(now);
  let businessDaysSeen = 0;

  for (let i = 0; i < 21 && businessDaysSeen < BUSINESS_DAYS; i += 1) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() + i);
    const weekday = limaWeekday(day);
    if (weekday === 0) continue;

    businessDaysSeen += 1;
    const dateKey = limaDateKey(day);

    for (const hour of SLOT_HOURS) {
      const start = limaLocalToIso(dateKey, hour);
      if (new Date(start).getTime() <= now.getTime()) continue;
      slots.push({ start, label: formatSlotLabel(start) });
    }
  }

  return slots;
}

/**
 * @returns {Promise<{ start: string; label: string }[]>}
 */
export async function listAvailableSupportSlots() {
  const candidates = generateSupportSlotCandidates();
  const { requests } = await readServiceRequests();

  /** @type {Map<string, number>} */
  const occupied = new Map();
  for (const req of requests) {
    if (!req.scheduledAt || req.status === 'cancelled') continue;
    const key = slotKey(req.scheduledAt);
    occupied.set(key, (occupied.get(key) ?? 0) + 1);
  }

  return candidates.filter((slot) => (occupied.get(slotKey(slot.start)) ?? 0) < CAPACITY_PER_SLOT);
}
