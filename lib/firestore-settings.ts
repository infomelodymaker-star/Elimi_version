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
  contactEmail: 'contact@elimi.com',
  contactPhone: '+257 79 12 34 56',
  phoneNumber: '+257 79 12 34 56',
  whatsappNumber: '25779123456',
};

export const SETTINGS_STORAGE_KEY = 'elimi_global_settings_storage';
export const SETTINGS_SYNC_EVENT = 'elimi_sync_global_settings';

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
  }, 1200, 'Fetch global settings');

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

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'settings', 'global');
    await setDoc(docRef, updated, { merge: true });
  }, 1200, 'Update global settings');
}
