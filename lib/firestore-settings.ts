import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getStoredObject, saveStoredObject, runFirestoreTaskSafe } from './firestore-sync';

export interface GlobalSettings {
  usdToBifRate: number;
  contactEmail?: string;
  contactPhone?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  usdToBifRate: 2850, // Default fallback
  contactEmail: 'elimiburundi@gmail.com',
  contactPhone: '+257 69 99 29 84',
  phoneNumber: '+257 69 99 29 84',
  whatsappNumber: '25769992984',
};

export const SETTINGS_STORAGE_KEY = 'elimi_global_settings_storage';
export const SETTINGS_SYNC_EVENT = 'elimi_sync_global_settings';

/**
 * Sanitizes any raw phone or WhatsApp string into a clean international number (e.g. 25769992984).
 * Strips out plus signs, spaces, hyphens, and brackets.
 * Also handles Burundian numbers input without country code.
 */
export function sanitizeWhatsAppNumber(num?: string): string {
  if (!num || !num.trim()) {
    const cached = getStoredObject<GlobalSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
    num = cached.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber;
  }
  let cleaned = (num || '').replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  // If user entered 8 digits (Burundi standard local number e.g. 69992984)
  if (cleaned.length === 8) {
    cleaned = '257' + cleaned;
  } else if (cleaned.length === 9 && cleaned.startsWith('0')) {
    cleaned = '257' + cleaned.substring(1);
  }
  return cleaned || '25769992984';
}

/**
 * Generates an active WhatsApp click-to-chat URL with prefilled text message.
 */
export function formatWhatsAppUrl(whatsappNumber: string | undefined, message: string): string {
  const cleanNumber = sanitizeWhatsAppNumber(whatsappNumber);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
  // 1. Immediately return from local cache if available
  const cached = getStoredObject<GlobalSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);

  // 2. Fetch fresh from Firestore without blocking if offline
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'settings', 'global');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const fresh = { ...DEFAULT_SETTINGS, ...snapshot.data() } as GlobalSettings;
      saveStoredObject(SETTINGS_STORAGE_KEY, fresh, SETTINGS_SYNC_EVENT);
    }
  }, 1500, 'Fetch global settings');

  return cached;
}

export async function updateGlobalSettings(settings: Partial<GlobalSettings>): Promise<void> {
  const current = getStoredObject<GlobalSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const updated: GlobalSettings = {
    ...current,
    ...settings,
  };

  // 1. Immediately update local storage and broadcast to components
  saveStoredObject(SETTINGS_STORAGE_KEY, updated, SETTINGS_SYNC_EVENT);

  // 2. Synchronous direct save to Firestore with fallback task runner
  try {
    const docRef = doc(db, 'settings', 'global');
    await setDoc(docRef, updated, { merge: true });
  } catch {
    runFirestoreTaskSafe(async () => {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, updated, { merge: true });
    }, 1500, 'Update global settings retry');
  }
}
