/**
 * Table sort state: `{ field, order }` with optional URL sync.
 *
 * Single-column sort model (matches Element Plus `el-table`'s default
 * `sort-change` semantics). Multi-column sort is intentionally out of scope —
 * most backends only accept one `sort` field. For URL persistence, pass
 * `urlKey` and the state is round-tripped through `useUrlState`.
 */
import { ref, computed, type ComputedRef, type Ref } from 'vue'
import { useUrlState, type UrlStateOptions } from '../url-state'

export type SortOrder = 'asc' | 'desc' | null

export interface TableSortState {
  field: string | null
  order: SortOrder
}

export interface UseTableSortOptions {
  /** Initial sort. Defaults to `{ field: null, order: null }`. */
  initial?: TableSortState
  /** When set, persist sort to the URL under this query key. */
  urlKey?: string
  /** Extra `useUrlState` options (router / history mode / etc). */
  urlOptions?: Omit<UrlStateOptions<TableSortState>, 'key'>
  /** Notified on every sort change. */
  onChange?: (state: TableSortState) => void
}

export interface UseTableSortReturn {
  state: Ref<TableSortState>
  /** Whether any sort is active. */
  hasSort: ComputedRef<boolean>
  /** Set sort; `order: null` clears. */
  setSort: (field: string | null, order: SortOrder) => void
  /** Clear sort to `{ field: null, order: null }`. */
  clear: () => void
  /** Reset to the initial state provided at creation. */
  reset: () => void
}

export function useTableSort(options: UseTableSortOptions = {}): UseTableSortReturn {
  const { initial = { field: null, order: null }, urlKey, urlOptions, onChange } = options

  const persisted = urlKey
    ? useUrlState<TableSortState>(initial, { ...urlOptions, key: urlKey })
    : null
  const state = persisted ? persisted.state : ref<TableSortState>({ ...initial })

  const hasSort = computed(() => state.value.field !== null && state.value.order !== null)

  function setSort(field: string | null, order: SortOrder) {
    state.value = { field, order }
    onChange?.(state.value)
  }

  function clear() {
    setSort(null, null)
  }

  function reset() {
    state.value = { ...initial }
    onChange?.(state.value)
  }

  return { state, hasSort, setSort, clear, reset }
}

// --- Pro-prefixed aliases ---

export type UseProTableSortOptions = UseTableSortOptions
export type UseProTableSortReturn = UseTableSortReturn
export { useTableSort as useProTableSort }
