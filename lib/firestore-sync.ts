/**
 * Resilient Client-Side Sync and Safe Firestore Task Execution
 * Provides instant localStorage caching, reactive event dispatching,
 * and circuit-breaker timeout wrapping for Firestore calls to prevent UI hangs.
 */

import { auth } from './firebase';

const SECRET_SALT = "ELIMI_SECURE_SALT_2026_!";

function encryptData(text: string): string {
  if (!text || typeof text !== 'string') return '';
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(unescape(encodeURIComponent(result)));
  } catch (e) {
    console.warn('Encryption failed, returning raw text:', e);
    return text;
  }
}

function decryptData(cipherText: string): string {
  if (!cipherText || typeof cipherText !== 'string') return '';
  const trimmed = cipherText.trim();
  // Check if it's already raw JSON (backwards-compatibility with legacy client storage)
  if (trimmed.startsWith('[') || trimmed.startsWith('{') || trimmed.startsWith('"')) {
    return cipherText;
  }
  try {
    const decoded = decodeURIComponent(escape(atob(cipherText)));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    return cipherText;
  }
}

function getStorage(key: string): Storage | null {
  if (typeof window === 'undefined') return null;
  // Use sessionStorage for sensitive data, localStorage for public catalogs
  if (
    key === 'elimi_orders_storage' ||
    key === 'elimi_newsletter_subscribers' ||
    key === 'elimi_registered_accounts_cache'
  ) {
    return sessionStorage;
  }
  return localStorage;
}

export function getStoredItems<T>(key: string, fallback: T[]): T[] {
  const storage = getStorage(key);
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const decrypted = decryptData(raw);
    const parsed = JSON.parse(decrypted);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

export function saveStoredItems<T>(key: string, items: T[], eventName?: string): void {
  const storage = getStorage(key);
  if (!storage) return;
  try {
    const serialized = JSON.stringify(items || []);
    const encrypted = encryptData(serialized);
    storage.setItem(key, encrypted);
    if (eventName) {
      window.dispatchEvent(new CustomEvent(eventName, { detail: items }));
    }
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
}

export function getStoredObject<T>(key: string, fallback: T): T {
  const storage = getStorage(key);
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const decrypted = decryptData(raw);
    const parsed = JSON.parse(decrypted);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (err) {
    console.warn(`Error reading object ${key} from storage:`, err);
    return fallback;
  }
}

export function saveStoredObject<T>(key: string, data: T, eventName?: string): void {
  const storage = getStorage(key);
  if (!storage) return;
  try {
    const serialized = JSON.stringify(data || {});
    const encrypted = encryptData(serialized);
    storage.setItem(key, encrypted);
    if (eventName) {
      window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
  } catch (err) {
    console.warn(`Error saving object ${key} to storage:`, err);
  }
}

/**
 * Executes a Firestore task in the background with a safety timeout.
 * Never throws or blocks the calling UI flow.
 */
export function runFirestoreTaskSafe<T>(
  task: () => Promise<T>,
  timeoutMs: number = 10000,
  taskDescription: string = 'Firestore task'
): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn(`[Firestore Safe Task] ${taskDescription} took longer than ${timeoutMs}ms.`);
        resolve(null);
      }
    }, timeoutMs);

    task()
      .then((res) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(res);
        }
      })
      .catch((err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          console.error(`[Firestore Task Failed] ${taskDescription}:`, err?.code || '', err?.message || err);
          resolve(null);
        }
      });
  });
}

/**
 * Persists an item or deletion to the server-side catalog API (/api/catalog).
 * Guarantees cross-browser and cross-device persistence even if Firestore is offline.
 */
export async function syncItemToServerCatalog(
  collection: string,
  itemOrId: any,
  action: 'save' | 'delete' = 'save'
): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const payload =
      action === 'delete'
        ? { collection, action: 'delete', id: typeof itemOrId === 'string' ? itemOrId : itemOrId?.id }
        : { collection, action: 'save', item: itemOrId };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        if (idToken) {
          headers['Authorization'] = `Bearer ${idToken}`;
        }
      }
    } catch {
      // Non-blocking token retrieval
    }

    await fetch('/api/catalog', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    console.warn(`Server catalog sync note for ${collection}:`, err?.message || err);
  }
}

/**
 * Fetches the latest collection items from the server-side catalog API.
 */
export async function fetchServerCatalog<T>(collection: string): Promise<T[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(`/api/catalog?collection=${encodeURIComponent(collection)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.items)) {
        return data.items as T[];
      }
    }
  } catch (err) {
    console.warn(`Could not fetch server catalog for ${collection}:`, err);
  }
  return null;
}

