/**
 * Table filter state: `Record<field, value[]>` with optional URL sync.
 *
 * Mirrors Element Plus `el-table`'s `filter-change` event payload shape so it
 * can be wired directly. Empty arrays are treated as "no filter" and pruned
 * from the state to keep the URL clean.
 */
import { ref, computed, type ComputedRef, type Ref } from 'vue'
import { useUrlState, type UrlStateOptions } from '../url-state'

export type TableFilters = Record<string, unknown[]>

export interface UseTableFiltersOptions {
  /** Initial filters. Defaults to `{}`. */
  initial?: TableFilters
  /** When set, persist filters to the URL under this query key. */
  urlKey?: string
  /** Extra `useUrlState` options. */
  urlOptions?: Omit<UrlStateOptions<TableFilters>, 'key'>
  /** Notified on every filter change. */
  onChange?: (filters: TableFilters) => void
}

export interface UseTableFiltersReturn {
  filters: Ref<TableFilters>
  /** Whether any non-empty filter is active. */
  hasFilters: ComputedRef<boolean>
  /** Set filter values for a field. Empty array clears the field. */
  setFilter: (field: string, values: unknown[]) => void
  /** Clear a single field's filter. */
  clear: (field: string) => void
  /** Clear all filters. */
  clearAll: () => void
  /** Reset to the initial filters. */
  reset: () => void
}

function pruneEmpty(filters: TableFilters): TableFilters {
  const result: TableFilters = {}
  for (const [k, v] of Object.entries(filters)) {
    if (Array.isArray(v) && v.length > 0) result[k] = v
  }
  return result
}

export function useTableFilters(options: UseTableFiltersOptions = {}): UseTableFiltersReturn {
  const { initial = {}, urlKey, urlOptions, onChange } = options

  const persisted = urlKey
    ? useUrlState<TableFilters>(pruneEmpty(initial), {
        ...urlOptions,
        key: urlKey,
        serialize: v => JSON.stringify(pruneEmpty(v)),
        parse: raw => pruneEmpty(JSON.parse(raw) as TableFilters)
      })
    : null
  const filters = persisted ? persisted.state : ref<TableFilters>(pruneEmpty(initial))

  const hasFilters = computed(() =>
    Object.values(filters.value).some(v => Array.isArray(v) && v.length > 0)
  )

  function emit() {
    onChange?.(filters.value)
  }

  function setFilter(field: string, values: unknown[]) {
    const next = { ...filters.value }
    if (Array.isArray(values) && values.length > 0) next[field] = values
    else delete next[field]
    filters.value = next
    emit()
  }

  function clear(field: string) {
    if (!(field in filters.value)) return
    const next = { ...filters.value }
    delete next[field]
    filters.value = next
    emit()
  }

  function clearAll() {
    filters.value = {}
    emit()
  }

  function reset() {
    filters.value = pruneEmpty(initial)
    emit()
  }

  return { filters, hasFilters, setFilter, clear, clearAll, reset }
}

// --- Pro-prefixed aliases ---

export type UseProTableFiltersOptions = UseTableFiltersOptions
export type UseProTableFiltersReturn = UseTableFiltersReturn
export { useTableFilters as useProTableFilters }
