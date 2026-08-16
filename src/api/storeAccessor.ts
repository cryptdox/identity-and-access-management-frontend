import type { AppStore } from '@/app/store'

/**
 * Lazy accessor so axiosInstance.ts (imported deep inside the store's own reducer
 * graph, via baseApi -> axiosBaseQuery -> axiosInstance) can reach `dispatch`/`getState`
 * without importing store.ts directly, which would be circular. store.ts calls
 * `setStoreRef` once, after the store is fully constructed; axiosInstance only calls
 * `getStoreRef()` later, at actual request time, by which point it's always set.
 */
let storeRef: AppStore | null = null

export function setStoreRef(store: AppStore) {
  storeRef = store
}

export function getStoreRef(): AppStore {
  if (!storeRef) {
    throw new Error('Store accessed before initialization')
  }
  return storeRef
}
