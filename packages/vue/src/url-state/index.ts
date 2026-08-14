/**
 * Bidirectional URL query ↔ reactive state synchronization.
 *
 * Vue 3 reactive layer — uses `ref` / `watch` from `vue`. When vue-router is
 * available, `useUrlState` syncs through `router.replace` so the browser
 * history stays clean; otherwise it falls back to `window.history`.
 *
 * ProTable/ProList build their specialized URL state persistence on top of this
 * primitive.
 */
import { ref, watch, type Ref } from 'vue'

export interface UrlStateOptions<T> {
  /** Query-string key. Defaults to `'state'`. */
  key?: string
  /** History update mode. Defaults to `'replace'`. */
  history?: 'replace' | 'push'
  /** Serialize state to a string for the URL. Defaults to `JSON.stringify`. */
  serialize?: (value: T) => string
  /** Parse the URL string back into state. Defaults to `JSON.parse`. */
  parse?: (raw: string) => T
  /** Optional router instance. When omitted, `window.history` is used. */
  router?: { replace: (to: string) => void; push: (to: string) => void }
  /** Skip the initial sync from URL → state. Defaults to `false`. */
  skipInitialRead?: boolean
}

export interface UseUrlStateReturn<T> {
  state: Ref<T>
  /** Force-write current state to the URL. */
  sync: () => void
  /** Force-read from URL into state. */
  read: () => boolean
}

export function useUrlState<T>(initial: T, options: UrlStateOptions<T> = {}): UseUrlStateReturn<T> {
  const {
    key = 'state',
    history = 'replace',
    serialize = defaultSerialize,
    parse = defaultParse,
    router,
    skipInitialRead = false
  } = options

  const state = ref(initial) as Ref<T>

  if (!skipInitialRead) read()

  watch(state, () => write(), { deep: true })

  function write() {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const serialized = serialize(state.value)
    if (serialized === '' || serialized === undefined) {
      params.delete(key)
    } else {
      params.set(key, serialized)
    }
    const search = params.toString()
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
    if (router) {
      if (history === 'push') router.push(nextUrl)
      else router.replace(nextUrl)
    } else {
      window.history[`${history}State`](window.history.state, '', nextUrl)
    }
  }

  function read(): boolean {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    const raw = params.get(key)
    if (raw === null) return false
    try {
      state.value = parse(raw) as T
      return true
    } catch {
      return false
    }
  }

  function sync() {
    write()
  }

  return { state, sync, read }
}

function defaultSerialize(value: unknown): string {
  return JSON.stringify(value)
}

function defaultParse(raw: string): unknown {
  return JSON.parse(raw)
}

// --- Pro-prefixed aliases (back-compat with @framebase/element-plus-pro-components) ---

export type ProUrlStateOptions<T> = UrlStateOptions<T>
export type UseProUrlStateReturn<T> = UseUrlStateReturn<T>

export { useUrlState as useProUrlState }
