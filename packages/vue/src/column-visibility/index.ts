/**
 * Column visibility state with optional localStorage persistence.
 *
 * Keys are column identifiers; `true` means visible. Columns absent from the
 * map are treated as visible (open-world assumption) so newly added columns
 * show up by default. Persistence uses the native `Storage` API directly —
 * `vueuse`'s `useStorage` is deliberately not reimplemented.
 */
import { ref, computed, type ComputedRef, type Ref } from 'vue'

export interface UseColumnVisibilityOptions {
  /** Initial hidden/visible map. Absent keys default to visible. */
  initial?: Record<string, boolean>
  /** When set, persist to `localStorage` under this key. */
  storageKey?: string
  /** Storage instance; defaults to `window.localStorage`. */
  storage?: Storage
}

export interface UseColumnVisibilityReturn {
  /** Visibility map. Mutate via helpers to keep persistence in sync. */
  visibility: Ref<Record<string, boolean>>
  /** Whether `key` is visible (absent = visible). */
  isVisible: (key: string) => boolean
  /** Toggle a column. */
  toggle: (key: string) => void
  /** Show a column. */
  show: (key: string) => void
  /** Hide a column. */
  hide: (key: string) => void
  /** Show all columns (clears the map). */
  showAll: () => void
  /** Reset to the initial map (and re-persist). */
  reset: () => void
  /** List of currently hidden keys. */
  hiddenKeys: ComputedRef<string[]>
}

function readStorage(
  storage: Storage | undefined,
  key: string
): Record<string, boolean> | undefined {
  if (!storage) return undefined
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : undefined
  } catch {
    return undefined
  }
}

function writeStorage(storage: Storage | undefined, key: string, value: Record<string, boolean>) {
  if (!storage) return
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // quota / disabled storage — silently ignore
  }
}

export function useColumnVisibility(
  options: UseColumnVisibilityOptions = {}
): UseColumnVisibilityReturn {
  const { initial = {}, storageKey, storage } = options
  const resolvedStorage =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined)

  const seeded = storageKey ? (readStorage(resolvedStorage, storageKey) ?? initial) : initial

  const visibility = ref<Record<string, boolean>>({ ...seeded })

  function persist() {
    if (storageKey) writeStorage(resolvedStorage, storageKey, visibility.value)
  }

  const hiddenKeys = computed(() =>
    Object.entries(visibility.value)
      .filter(([, v]) => v === false)
      .map(([k]) => k)
  )

  function isVisible(key: string): boolean {
    return visibility.value[key] !== false
  }

  function toggle(key: string) {
    visibility.value = { ...visibility.value, [key]: !isVisible(key) }
    persist()
  }

  function show(key: string) {
    if (visibility.value[key] !== false) return
    const next = { ...visibility.value }
    delete next[key]
    visibility.value = next
    persist()
  }

  function hide(key: string) {
    if (visibility.value[key] === false) return
    visibility.value = { ...visibility.value, [key]: false }
    persist()
  }

  function showAll() {
    visibility.value = {}
    persist()
  }

  function reset() {
    visibility.value = { ...initial }
    persist()
  }

  return { visibility, isVisible, toggle, show, hide, showAll, reset, hiddenKeys }
}

// --- Pro-prefixed aliases ---

export type UseProColumnVisibilityOptions = UseColumnVisibilityOptions
export type UseProColumnVisibilityReturn = UseColumnVisibilityReturn
export { useColumnVisibility as useProColumnVisibility }
