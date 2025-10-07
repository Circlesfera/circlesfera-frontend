/**
 * Utilidades para almacenamiento offline usando IndexedDB
 */

const DB_NAME = 'CirclesferapWADB';
const DB_VERSION = 1;
const STORES = {
  posts: 'posts',
  reels: 'reels',
  stories: 'stories',
  messages: 'messages',
  userData: 'userData'
};

/**
 * Abrir conexión a IndexedDB
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Crear stores si no existen
      if (!db.objectStoreNames.contains(STORES.posts)) {
        db.createObjectStore(STORES.posts, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.reels)) {
        db.createObjectStore(STORES.reels, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.stories)) {
        db.createObjectStore(STORES.stories, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.messages)) {
        db.createObjectStore(STORES.messages, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.userData)) {
        db.createObjectStore(STORES.userData, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Guardar datos en IndexedDB
 */
export const saveToIndexedDB = async (
  store: keyof typeof STORES,
  data: unknown
): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORES[store], 'readwrite');
    const objectStore = transaction.objectStore(STORES[store]);

    if (Array.isArray(data)) {
      data.forEach(item => objectStore.put(item));
    } else {
      objectStore.put(data);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    throw error;
  }
};

/**
 * Obtener datos de IndexedDB
 */
export const getFromIndexedDB = async <T>(
  store: keyof typeof STORES,
  key?: string
): Promise<T | T[] | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORES[store], 'readonly');
    const objectStore = transaction.objectStore(STORES[store]);

    if (key) {
      // Obtener un elemento específico
      const request = objectStore.get(key);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } else {
      // Obtener todos los elementos
      const request = objectStore.getAll();
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    console.error('Error getting from IndexedDB:', error);
    return null;
  }
};

/**
 * Eliminar datos de IndexedDB
 */
export const deleteFromIndexedDB = async (
  store: keyof typeof STORES,
  key: string
): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORES[store], 'readwrite');
    const objectStore = transaction.objectStore(STORES[store]);

    objectStore.delete(key);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error deleting from IndexedDB:', error);
    throw error;
  }
};

/**
 * Limpiar store completo
 */
export const clearStore = async (store: keyof typeof STORES): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORES[store], 'readwrite');
    const objectStore = transaction.objectStore(STORES[store]);

    objectStore.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error clearing store:', error);
    throw error;
  }
};

/**
 * Verificar si el navegador está online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Guardar datos con sincronización automática cuando vuelva la conexión
 */
export const saveWithSync = async (
  store: keyof typeof STORES,
  data: unknown
): Promise<void> => {
  // Guardar localmente
  await saveToIndexedDB(store, data);

  // Si está offline, marcar para sincronizar después
  if (!isOnline()) {
    const pendingSync = await getFromIndexedDB<Array<{ store: string; data: unknown; timestamp: number }>>('userData', 'pendingSync') || [];
    pendingSync.push({ store, data, timestamp: Date.now() });
    await saveToIndexedDB('userData', { key: 'pendingSync', value: pendingSync });
  }
};

/**
 * Sincronizar datos pendientes cuando vuelva la conexión
 */
export const syncPendingData = async (): Promise<void> => {
  if (!isOnline()) return;

  try {
    const pendingSync = await getFromIndexedDB<{ key: string; value: Array<{ store: string; data: unknown; timestamp: number }> }>('userData', 'pendingSync');
    if (!pendingSync || !pendingSync.value || pendingSync.value.length === 0) {
      return;
    }

    // Aquí se debería implementar la lógica de sincronización con el servidor
    console.log('Sincronizando datos pendientes:', pendingSync.value.length);

    // Limpiar datos sincronizados
    await deleteFromIndexedDB('userData', 'pendingSync');
  } catch (error) {
    console.error('Error syncing pending data:', error);
  }
};

