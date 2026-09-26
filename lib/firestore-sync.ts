/**
 * Resilient Client-Side Sync and Safe Firestore Task Execution
 * Provides instant localStorage caching, reactive event dispatching,
 * and circuit-breaker timeout wrapping for Firestore calls to prevent UI hangs.
 */

import { auth } from './firebase';

export function getStoredItems<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

export function saveStoredItems<T>(key: string, items: T[], eventName?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
    if (eventName) {
      window.dispatchEvent(new CustomEvent(eventName, { detail: items }));
    }
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
}

export function getStoredObject<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (err) {
    console.warn(`Error reading object ${key} from storage:`, err);
    return fallback;
  }
}

export function saveStoredObject<T>(key: string, data: T, eventName?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
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

