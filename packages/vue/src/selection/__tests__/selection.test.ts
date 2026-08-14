import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useSelection } from '../index'

interface RecordItem {
  id: number
  name: string
}

describe('useSelection', () => {
  it('retains selected records across pages when reserveSelection is enabled', () => {
    const data = ref<RecordItem[]>([
      { id: 1, name: 'One' },
      { id: 2, name: 'Two' }
    ])
    const onChange = vi.fn()
    const selection = useSelection<RecordItem>({
      data,
      rowKey: () => 'id',
      reserveSelection: () => true,
      selectedKeys: () => [],
      onChange
    })

    selection.toggleSelection(data.value[0], true)
    data.value = [{ id: 3, name: 'Three' }]
    selection.cacheVisibleRecords()

    expect(selection.selectedKeyList.value).toEqual([1])
    expect(selection.getSelectedRows()).toEqual([{ id: 1, name: 'One' }])
    expect(onChange).toHaveBeenLastCalledWith([1], [{ id: 1, name: 'One' }])
  })

  it('prunes hidden keys and responds to controlled key updates', () => {
    const data = ref<RecordItem[]>([{ id: 1, name: 'One' }])
    const selection = useSelection<RecordItem>({
      data,
      rowKey: () => 'id',
      reserveSelection: () => false,
      selectedKeys: () => [1, 2],
      onChange: vi.fn()
    })

    selection.cacheVisibleRecords()
    expect(selection.selectedKeyList.value).toEqual([1])

    selection.syncSelectedKeys([])
    expect(selection.getSelectedRows()).toEqual([])
  })

  it('toggles selection off', () => {
    const data = ref<RecordItem[]>([{ id: 1, name: 'One' }])
    const selection = useSelection<RecordItem>({
      data,
      rowKey: () => 'id',
      reserveSelection: () => false,
      selectedKeys: () => [],
      onChange: vi.fn()
    })

    selection.toggleSelection(data.value[0], true)
    expect(selection.isSelected(data.value[0])).toBe(true)

    selection.toggleSelection(data.value[0], false)
    expect(selection.isSelected(data.value[0])).toBe(false)
    expect(selection.selectedKeyList.value).toEqual([])
  })

  it('clears all selection', () => {
    const data = ref<RecordItem[]>([{ id: 1, name: 'One' }])
    const selection = useSelection<RecordItem>({
      data,
      rowKey: () => 'id',
      reserveSelection: () => false,
      selectedKeys: () => [],
      onChange: vi.fn()
    })

    selection.toggleSelection(data.value[0], true)
    selection.clearSelection()
    expect(selection.selectedKeyList.value).toEqual([])
    expect(selection.getSelectedRows()).toEqual([])
  })

  it('supports function rowKey', () => {
    const data = ref<RecordItem[]>([{ id: 1, name: 'One' }])
    const selection = useSelection<RecordItem>({
      data,
      rowKey: () => record => record.id,
      reserveSelection: () => false,
      selectedKeys: () => [],
      onChange: vi.fn()
    })

    selection.toggleSelection(data.value[0], true)
    expect(selection.selectedKeyList.value).toEqual([1])
  })
})
