const WHEEL_COMPLETED_KEY = 'haitech-wheel-completed';
const WHEEL_DISMISSED_SESSION_KEY = 'haitech-wheel-dismissed';

export interface WheelRegistration {
  name: string;
  email: string;
  phone: string;
  prizeId: string;
  prizeLabel: string;
  completedAt: string;
}

export function hasCompletedWheel(): boolean {
  try {
    return localStorage.getItem(WHEEL_COMPLETED_KEY) !== null;
  } catch {
    return false;
  }
}

export function getWheelRegistration(): WheelRegistration | null {
  try {
    const raw = localStorage.getItem(WHEEL_COMPLETED_KEY);
    return raw ? (JSON.parse(raw) as WheelRegistration) : null;
  } catch {
    return null;
  }
}

export function saveWheelRegistration(data: WheelRegistration): void {
  try {
    localStorage.setItem(WHEEL_COMPLETED_KEY, JSON.stringify(data));
  } catch {
    // Ignorar si el almacenamiento no está disponible.
  }
}

export function isWheelDismissedThisSession(): boolean {
  try {
    return sessionStorage.getItem(WHEEL_DISMISSED_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissWheelSession(): void {
  try {
    sessionStorage.setItem(WHEEL_DISMISSED_SESSION_KEY, '1');
  } catch {
    // Ignorar.
  }
}
