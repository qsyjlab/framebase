/**
 * Row selection state with optional cross-page retention.
 *
 * Vue 3 reactive layer — manages `selectedKeys` as a `ref` and a `key -> record`
 * cache so selected records remain available after the visible data changes
 * (e.g. pagination). ProTable/ProList build their selection features on top of
 * this primitive.
 */
import { ref, type Ref } from 'vue'

export type SelectionKey = string | number
export type RowKeyResolver<TRecord> =
  | string
  | number
  | ((record: TRecord, index: number) => SelectionKey | undefined)

export interface UseSelectionOptions<TRecord> {
  /** Visible records (reactive). */
  data: Ref<TRecord[]>
  /** Row key resolver — string path, or function returning a key. */
  rowKey: () => RowKeyResolver<TRecord>
  /** When `true`, selected records are retained across data changes. */
  reserveSelection: () => boolean
  /** Controlled selected keys (initial + external updates). */
  selectedKeys: () => SelectionKey[]
  /** Called whenever the selection changes. */
  onChange: (keys: SelectionKey[], records: TRecord[]) => void
}

export interface UseSelectionReturn<TRecord> {
  selectedKeyList: Ref<SelectionKey[]>
  /** Resolve the key for a record (falls back to its index in `data`). */
  resolveRowKey: (record: TRecord) => SelectionKey
  isSelected: (record: TRecord) => boolean
  toggleSelection: (record: TRecord, selected: boolean) => void
  clearSelection: () => void
  /** Replace the selected keys (controlled updates). */
  syncSelectedKeys: (keys: SelectionKey[]) => void
  /** Cache currently visible records that are selected. */
  cacheVisibleRecords: () => void
  getSelectedRows: () => TRecord[]
}

export function useSelection<TRecord extends object>(
  options: UseSelectionOptions<TRecord>
): UseSelectionReturn<TRecord> {
  const selectedKeyList = ref<SelectionKey[]>([...options.selectedKeys()])
  const selectedRecordMap = new Map<SelectionKey, TRecord>()

  function resolveRowKey(record: TRecord) {
    const resolver = options.rowKey()
    if (typeof resolver === 'function') {
      const key = resolver(record, options.data.value.indexOf(record))
      return key ?? options.data.value.indexOf(record)
    }
    if (typeof resolver === 'string') {
      const value = Reflect.get(record as object, resolver)
      if (value !== undefined && value !== null) return value as SelectionKey
    }
    return options.data.value.indexOf(record)
  }

  function isSelected(record: TRecord) {
    return selectedKeyList.value.includes(resolveRowKey(record))
  }

  function toggleSelection(record: TRecord, selected: boolean) {
    const key = resolveRowKey(record)
    const keys = new Set(selectedKeyList.value)
    if (selected) {
      keys.add(key)
      selectedRecordMap.set(key, record)
    } else {
      keys.delete(key)
      selectedRecordMap.delete(key)
    }
    selectedKeyList.value = [...keys]
    emitSelectionChange()
  }

  function clearSelection() {
    selectedKeyList.value = []
    selectedRecordMap.clear()
    emitSelectionChange()
  }

  function syncSelectedKeys(keys: SelectionKey[]) {
    selectedKeyList.value = [...keys]
    pruneSelectedRecords()
  }

  function cacheVisibleRecords() {
    for (const record of options.data.value) {
      const key = resolveRowKey(record)
      if (selectedKeyList.value.includes(key)) selectedRecordMap.set(key, record)
    }
    pruneSelectedRecords()
  }

  function pruneSelectedRecords() {
    if (options.reserveSelection()) {
      for (const key of selectedRecordMap.keys()) {
        if (!selectedKeyList.value.includes(key)) selectedRecordMap.delete(key)
      }
      return
    }
    const visibleKeys = new Set(options.data.value.map(resolveRowKey))
    selectedKeyList.value = selectedKeyList.value.filter(key => visibleKeys.has(key))
    for (const key of selectedRecordMap.keys()) {
      if (!visibleKeys.has(key) || !selectedKeyList.value.includes(key)) {
        selectedRecordMap.delete(key)
      }
    }
  }

  function getSelectedRows() {
    return selectedKeyList.value
      .map(
        key =>
          selectedRecordMap.get(key) ??
          options.data.value.find(record => resolveRowKey(record) === key)
      )
      .filter((record): record is TRecord => Boolean(record))
  }

  function emitSelectionChange() {
    options.onChange([...selectedKeyList.value], getSelectedRows())
  }

  return {
    selectedKeyList,
    resolveRowKey,
    isSelected,
    toggleSelection,
    clearSelection,
    syncSelectedKeys,
    cacheVisibleRecords,
    getSelectedRows
  }
}

// --- Pro-prefixed aliases (back-compat with @framebase/element-plus-pro-components) ---

export type ProSelectionKey = SelectionKey
export type ProRowKeyResolver<TRecord> = RowKeyResolver<TRecord>
export type UseProSelectionOptions<TRecord> = UseSelectionOptions<TRecord>
export type UseProSelectionReturn<TRecord> = UseSelectionReturn<TRecord>

export { useSelection as useProSelection }
