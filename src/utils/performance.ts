/**
 * Anti-Lag & LocalStorage Quota Guard
 * Prevents browser freeze or lag when saving large arrays or datasets in local storage.
 */

export const safeLocalStorageSet = (key: string, data: any): boolean => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (e) {
    console.warn(`LocalStorage quota reached or restricted for key "${key}". Cleaning old caches...`, e);
    try {
      // Emergency cache cleanup for smooth operation
      const keysToKeep = ['usuario', 'vendas', 'despesas', 'insumos', 'receitas', 'produtos'];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !keysToKeep.includes(k)) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }
};

export const safeLocalStorageGet = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading key "${key}" from LocalStorage:`, e);
    return defaultValue;
  }
};

/**
 * Debounce utility for input handlers to reduce re-renders and eliminate input lag
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}
