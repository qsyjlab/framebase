import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref, shallowRef, watch } from 'vue'
import type {
  ProTableEditableRowKey,
  ProTableInstance,
  ProTablePageInfo,
  ProTableSorter
} from '../pro-table'
import { useProTable } from '../use-pro-table'

interface Row {
  id: number
  name: string
}

/**
 * 模拟 ProTable 暴露的实例：状态字段以 getter 形式读取内部 ref，
 * 与 useProTable 透过 defineExpose 代理访问组件实例的方式一致。
 */
function createFakeInstance() {
  const data = ref<Row[]>([])
  const loading = ref(false)
  const total = ref(0)
  const pageInfo = ref<ProTablePageInfo>({ current: 1, pageSize: 10 })
  const sorter = ref<ProTableSorter | undefined>(undefined)
  const selectedKeys = ref<Array<string | number>>([])
  const error = ref<unknown>(undefined)

  const reload = vi.fn(async (resetPage = true) => {
    if (resetPage) pageInfo.value = { ...pageInfo.value, current: 1 }
    loading.value = true
    data.value = [{ id: 1, name: 'a' }]
    total.value = 1
    loading.value = false
    return [...data.value]
  })
  const setPageInfo = vi.fn(async (next: Partial<ProTablePageInfo>) => {
    pageInfo.value = { ...pageInfo.value, ...next }
    return [...data.value]
  })
  const clearSelection = vi.fn()
  const startEditable = vi.fn((rowKey: ProTableEditableRowKey) => Boolean(rowKey))

  const instance = {
    reload,
    setPageInfo,
    clearSelection,
    clearSelectedKeys: clearSelection,
    startEditable,
    getData: () => [...data.value],
    getLoading: () => loading.value,
    getPageInfo: () => ({ ...pageInfo.value }),
    getTotal: () => total.value,
    getServerState: () => ({
      ...pageInfo.value,
      sorter: sorter.value,
      filters: { status: ['active'] }
    }),
    getRequestLifecycle: () => ({
      phase: 'idle' as const,
      loading: false,
      initialLoading: false,
      refreshing: false
    }),
    getError: () => error.value,
    getSelectedKeys: () => [...selectedKeys.value],
    getSelectedRows: () => data.value.filter(row => selectedKeys.value.includes(row.id)),
    get data() {
      return data.value
    },
    get loading() {
      return loading.value
    },
    get total() {
      return total.value
    },
    get pageInfo() {
      return { ...pageInfo.value }
    },
    get sorter() {
      return sorter.value ? { ...sorter.value } : undefined
    },
    get filters() {
      return { status: ['active'] }
    },
    get selectedKeys() {
      return [...selectedKeys.value]
    },
    get selectedRows() {
      return data.value.filter(row => selectedKeys.value.includes(row.id))
    },
    get serverState() {
      return { ...pageInfo.value, sorter: sorter.value, filters: { status: ['active'] } }
    },
    get error() {
      return error.value
    }
  } as unknown as ProTableInstance<Row>

  return {
    instance,
    data,
    loading,
    total,
    selectedKeys,
    error,
    reload,
    setPageInfo,
    clearSelection,
    startEditable
  }
}

describe('useProTable', () => {
  it('provides safe defaults before the instance mounts', () => {
    const table = useProTable<Row>()

    expect(table.tableRef.value).toBeNull()
    expect(table.data.value).toEqual([])
    expect(table.loading.value).toBe(false)
    expect(table.total.value).toBe(0)
    expect(table.pageInfo.value).toBeUndefined()
    expect(table.sorter.value).toBeUndefined()
    expect(table.filters.value).toEqual({})
    expect(table.selectedKeys.value).toEqual([])
    expect(table.selectedRows.value).toEqual([])
    expect(table.serverState.value).toBeUndefined()
    expect(table.requestLifecycle.value).toBeUndefined()
    expect(table.error.value).toBeUndefined()
  })

  it('exposes reactive state that tracks the instance', async () => {
    const { instance, data, loading, selectedKeys } = createFakeInstance()
    const table = useProTable<Row>()
    table.tableRef.value = instance

    const seen: number[] = []
    watch(
      () => table.loading.value,
      value => seen.push(value ? 1 : 0)
    )

    expect(table.data.value).toEqual([])
    data.value = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ]
    expect(table.data.value).toHaveLength(2)

    loading.value = true
    expect(table.loading.value).toBe(true)
    await nextTick()
    loading.value = false
    expect(table.loading.value).toBe(false)
    await nextTick()
    expect(seen).toEqual([1, 0])

    selectedKeys.value = [2]
    expect(table.selectedRows.value).toEqual([{ id: 2, name: '李四' }])
    expect(table.filters.value).toEqual({ status: ['active'] })
  })

  it('delegates commands to the instance with arguments', async () => {
    const { instance, reload, setPageInfo, clearSelection, startEditable } = createFakeInstance()
    const table = useProTable(shallowRef<ProTableInstance<Row> | null>(instance))

    await table.reload()
    expect(reload).toHaveBeenCalledWith(true)
    await table.reload(false)
    expect(reload).toHaveBeenLastCalledWith(false)

    await table.setPageInfo({ current: 3 })
    expect(setPageInfo).toHaveBeenCalledWith({ current: 3 }, true)
    expect(table.pageInfo.value).toEqual({ current: 3, pageSize: 10 })

    table.clearSelection()
    expect(clearSelection).toHaveBeenCalledTimes(1)

    await expect(table.startEditable(1)).resolves.toBe(true)
    expect(startEditable).toHaveBeenCalledWith(1)
  })

  it('keeps the 1.1.x async getters as compatibility aliases', async () => {
    const { instance, data, selectedKeys, clearSelection } = createFakeInstance()
    const table = useProTable(shallowRef<ProTableInstance<Row> | null>(instance))
    data.value = [{ id: 1, name: 'a' }]
    selectedKeys.value = [1]

    await expect(table.getData()).resolves.toEqual([{ id: 1, name: 'a' }])
    await expect(table.getSelectedKeys()).resolves.toEqual([1])
    await expect(table.getSelectedRows()).resolves.toEqual([{ id: 1, name: 'a' }])

    await table.clearSelectedKeys()
    expect(clearSelection).toHaveBeenCalledTimes(1)
  })

  it('waits one tick for a late-mounted instance before running commands', async () => {
    const { instance } = createFakeInstance()
    const table = useProTable<Row>()

    const pending = table.reload()
    table.tableRef.value = instance
    await expect(pending).resolves.toEqual([{ id: 1, name: 'a' }])
  })

  it('throws when the instance never mounts', async () => {
    const table = useProTable<Row>()
    await expect(table.refresh()).rejects.toThrow('ProTable instance is not available')
  })
})
