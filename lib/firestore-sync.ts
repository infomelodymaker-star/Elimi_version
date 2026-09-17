/**
 * Resilient Client-Side Sync and Safe Firestore Task Execution
 * Provides instant localStorage caching, reactive event dispatching,
 * and circuit-breaker timeout wrapping for Firestore calls to prevent UI hangs.
 */

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
  timeoutMs: number = 1500,
  taskDescription: string = 'Firestore task'
): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn(`[Circuit Breaker] ${taskDescription} took longer than ${timeoutMs}ms. Continuing without blocking.`);
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
          console.warn(`[Background Task Handled] ${taskDescription} note:`, err?.message || err);
          resolve(null);
        }
      });
  });
}
