import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useProTableSelection } from '../hooks/use-pro-table-selection'
import type { TableInstance } from 'element-plus'

interface Row {
  id: number
  name?: string
}

function createTableRefMock(): { ref: ReturnType<typeof ref<TableInstance | undefined>> } {
  const tableRef = ref<TableInstance | undefined>({
    clearSelection: vi.fn(),
    toggleRowSelection: vi.fn()
  } as unknown as TableInstance)
  return { ref: tableRef }
}

describe('useProTableSelection', () => {
  it('does not re-emit when the parent reflects the emitted keys back via v-model', async () => {
    const data = ref<Row[]>([{ id: 1 }, { id: 2 }])
    const selectedKeysRef = ref<Array<string | number>>([])
    const { ref: tableRef } = createTableRefMock()
    const toggleRowSelection = (
      tableRef.value as unknown as { toggleRowSelection: ReturnType<typeof vi.fn> }
    ).toggleRowSelection

    const onChange = vi.fn((keys: Array<string | number>) => {
      // Simulate parent `v-model:selectedKeys` reflecting the emit straight back.
      selectedKeysRef.value = [...keys]
    })

    const selection = useProTableSelection<Row>({
      data,
      tableRef,
      rowKey: () => 'id',
      checkable: () => true,
      reserveSelection: () => false,
      selectedKeys: () => selectedKeysRef.value,
      cacheSelectedData: () => [],
      onChange
    })

    // User clicks row 1 in ElTable → ElTable emits selection-change.
    selection.handleSelectionChange([{ id: 1 }])
    await nextTick()
    await nextTick()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([1], [{ id: 1 }])
    // syncVisibleSelection was skipped, so ElTable was not toggled programmatically.
    expect(toggleRowSelection).not.toHaveBeenCalled()
  })

  it('syncs ElTable visuals when selectedKeys change externally', async () => {
    const data = ref<Row[]>([{ id: 1 }, { id: 2 }])
    const selectedKeysRef = ref<Array<string | number>>([])
    const { ref: tableRef } = createTableRefMock()
    const toggleRowSelection = (
      tableRef.value as unknown as { toggleRowSelection: ReturnType<typeof vi.fn> }
    ).toggleRowSelection

    const onChange = vi.fn()

    useProTableSelection<Row>({
      data,
      tableRef,
      rowKey: () => 'id',
      checkable: () => true,
      reserveSelection: () => false,
      selectedKeys: () => selectedKeysRef.value,
      cacheSelectedData: () => [],
      onChange
    })

    // A real external change (not a reflection of our own emit).
    selectedKeysRef.value = [2]
    await nextTick()
    await nextTick()

    expect(toggleRowSelection).toHaveBeenCalledWith({ id: 2 }, true)
  })

  it('returns fresh row references from current data after a row is edited', async () => {
    const data = ref<Row[]>([{ id: 1, name: 'original' }])
    const selectedKeysRef = ref<Array<string | number>>([])
    const { ref: tableRef } = createTableRefMock()
    const onChange = vi.fn()

    const selection = useProTableSelection<Row>({
      data,
      tableRef,
      rowKey: () => 'id',
      checkable: () => true,
      reserveSelection: () => false,
      selectedKeys: () => selectedKeysRef.value,
      cacheSelectedData: () => [],
      onChange
    })

    selection.handleSelectionChange([{ id: 1, name: 'original' }])
    await nextTick()
    expect(selection.getSelectedRows()).toEqual([{ id: 1, name: 'original' }])

    // Edit replaces the row object with a fresh reference.
    data.value = [{ id: 1, name: 'edited' }]
    await nextTick()

    expect(selection.getSelectedRows()).toEqual([{ id: 1, name: 'edited' }])
  })

  it('clearSelection emits once and suppresses the reflection sync', async () => {
    const data = ref<Row[]>([{ id: 1 }, { id: 2 }])
    const selectedKeysRef = ref<Array<string | number>>([1])
    const { ref: tableRef } = createTableRefMock()
    const clearSelectionMock = (
      tableRef.value as unknown as { clearSelection: ReturnType<typeof vi.fn> }
    ).clearSelection
    const toggleRowSelection = (
      tableRef.value as unknown as { toggleRowSelection: ReturnType<typeof vi.fn> }
    ).toggleRowSelection

    const onChange = vi.fn((keys: Array<string | number>) => {
      selectedKeysRef.value = [...keys]
    })

    const selection = useProTableSelection<Row>({
      data,
      tableRef,
      rowKey: () => 'id',
      checkable: () => true,
      reserveSelection: () => false,
      selectedKeys: () => selectedKeysRef.value,
      cacheSelectedData: () => [],
      onChange
    })

    selection.clearSelection()
    await nextTick()
    await nextTick()

    expect(onChange).toHaveBeenLastCalledWith([], [])
    expect(clearSelectionMock).toHaveBeenCalled()
    // No programmatic re-select of rows after clear.
    expect(toggleRowSelection).not.toHaveBeenCalled()
    expect(selection.getSelectedRows()).toEqual([])
  })
})
