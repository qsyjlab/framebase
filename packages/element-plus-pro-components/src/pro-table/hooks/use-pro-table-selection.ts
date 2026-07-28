import { nextTick, ref, watch, type Ref } from 'vue'
import type { TableInstance } from 'element-plus'
import type { ProTableRowKey } from '../pro-table'
import { getProTableRowKey } from '../pro-table-utils'

interface UseProTableSelectionOptions<TRecord extends object> {
  data: Ref<TRecord[]>
  tableRef: Ref<TableInstance | undefined>
  rowKey: () => ProTableRowKey<TRecord>
  checkable: () => boolean
  reserveSelection: () => boolean
  selectedKeys: () => Array<string | number>
  cacheSelectedData: () => TRecord[]
  onChange: (keys: Array<string | number>, rows: TRecord[]) => void
}

export function useProTableSelection<TRecord extends object>(
  options: UseProTableSelectionOptions<TRecord>
) {
  const selectedRows = new Map<string | number, TRecord>()
  const selectedKeyList = ref<Array<string | number>>([...options.selectedKeys()])
  // Guards programmatic ElTable mutations (clearSelection/toggleRowSelection)
  // from re-entering `handleSelectionChange` while we reconcile visuals.
  let syncing = false
  // Marks selection changes originated internally (user click / clear). The
  // `selectedKeys` watcher checks it to skip re-syncing ElTable when the
  // parent's `v-model:selectedKeys` reflects our own emit back to us — which
  // would otherwise trigger a redundant `selection-change` cycle.
  let internalChange = false

  options.cacheSelectedData().forEach(row => {
    const key = getProTableRowKey(row, options.rowKey())
    if (key !== undefined) selectedRows.set(key, row)
  })

  watch(
    options.selectedKeys,
    keys => {
      selectedKeyList.value = [...keys]
      if (internalChange) {
        // Our own emit reflected back via v-model — ElTable is already in sync,
        // so skip the programmatic re-sync to avoid a redundant emit cycle.
        internalChange = false
        return
      }
      void syncVisibleSelection()
    },
    { deep: true }
  )

  function handleSelectionChange(rows: TRecord[]) {
    if (syncing) return
    if (!options.reserveSelection()) selectedRows.clear()
    options.data.value
      .map(row => getProTableRowKey(row, options.rowKey()))
      .filter((key): key is string | number => key !== undefined)
      .forEach(key => selectedRows.delete(key))
    rows.forEach(row => {
      const key = getProTableRowKey(row, options.rowKey())
      if (key !== undefined) selectedRows.set(key, row)
    })
    commitSelection()
  }

  async function syncVisibleSelection() {
    if (!options.checkable() || !options.tableRef.value) return
    await nextTick()
    const tableRef = options.tableRef.value
    if (!tableRef) return
    syncing = true
    try {
      tableRef.clearSelection()
      const keySet = new Set(selectedKeyList.value)
      options.data.value.forEach(row => {
        const key = getProTableRowKey(row, options.rowKey())
        if (key !== undefined && keySet.has(key)) {
          selectedRows.set(key, row)
          tableRef.toggleRowSelection(row, true)
        }
      })
    } finally {
      // ElTable emits `selection-change` on its own tick; keep the guard up
      // until that emit has drained so `handleSelectionChange` can skip it.
      await nextTick()
      syncing = false
    }
  }

  function clearSelection() {
    selectedRows.clear()
    selectedKeyList.value = []
    internalChange = true
    void runProtectedTableOp(() => options.tableRef.value?.clearSelection())
    options.onChange([], [])
  }

  async function runProtectedTableOp(op: () => void) {
    syncing = true
    try {
      op()
    } finally {
      await nextTick()
      syncing = false
    }
  }

  /**
   * Returns selected rows ordered by `selectedKeyList`, preferring the fresh
   * row reference from the current visible data when available. This keeps
   * emitted rows in sync after a row is edited (which typically replaces the
   * row object) — the stale reference in `selectedRows` is superseded by the
   * up-to-date one in `options.data`.
   */
  function getSelectedRows() {
    if (!selectedKeyList.value.length) return []
    const dataByKey = new Map<string | number, TRecord>()
    options.data.value.forEach(row => {
      const key = getProTableRowKey(row, options.rowKey())
      if (key !== undefined) dataByKey.set(key, row)
    })
    return selectedKeyList.value
      .map(key => dataByKey.get(key) ?? selectedRows.get(key))
      .filter((row): row is TRecord => row !== undefined)
  }

  function commitSelection() {
    selectedKeyList.value = Array.from(selectedRows.keys())
    internalChange = true
    options.onChange([...selectedKeyList.value], getSelectedRows())
    // Fallback reset for one-way (non-v-model) bindings where the watcher
    // never fires: release the guard after the reactive cycle so a subsequent
    // real external `selectedKeys` change isn't incorrectly skipped.
    nextTick(() => {
      internalChange = false
    })
  }

  return {
    selectedKeyList,
    handleSelectionChange,
    syncVisibleSelection,
    clearSelection,
    getSelectedRows
  }
}
