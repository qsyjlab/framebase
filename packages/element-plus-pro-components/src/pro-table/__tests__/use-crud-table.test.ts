import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ProTableInstance, ProTablePageInfo } from '../pro-table'
import { useCrudTable } from '../use-crud-table'

interface Row {
  id: number
  name: string
}

interface Query {
  keyword?: string
  status?: string
}

interface FormModel {
  name: string
  status?: string
}

/** 与 useProTable 测试一致：状态字段用 getter 读取内部 ref，模拟 defineExpose 代理。 */
function createFakeInstance(rows: Row[], current = 1) {
  const data = ref(rows)
  const pageInfo = ref<ProTablePageInfo>({ current, pageSize: 10 })
  const selected = ref<Row[]>([])

  const instance = {
    get data() {
      return data.value
    },
    get total() {
      return data.value.length
    },
    get pageInfo() {
      return { ...pageInfo.value }
    },
    get selectedRows() {
      return selected.value
    },
    get selectedKeys() {
      return selected.value.map(row => row.id)
    },
    reload: vi.fn(async (resetPage = true) => {
      if (resetPage) pageInfo.value = { ...pageInfo.value, current: 1 }
      return [...data.value]
    }),
    refresh: vi.fn(async () => [...data.value]),
    setPageInfo: vi.fn(async (next: Partial<ProTablePageInfo>) => {
      pageInfo.value = { ...pageInfo.value, ...next }
      return [...data.value]
    }),
    clearSelection: vi.fn(async () => {
      selected.value = []
    })
  }

  return { instance, data, pageInfo, selected }
}

function setup(rows: Row[], current = 1) {
  const fake = createFakeInstance(rows, current)
  const create = vi.fn(async (_values: FormModel): Promise<unknown> => undefined)
  const update = vi.fn(async (_row: Row, _values: FormModel): Promise<unknown> => undefined)
  const remove = vi.fn(async (_row: Row): Promise<unknown> => undefined)
  const removeMany = vi.fn(
    async (_rows: Row[], _keys: Array<string | number>): Promise<unknown> => undefined
  )

  const crud = useCrudTable<Row, Query, FormModel>({
    request: async () => ({ data: [], total: 0 }),
    defaultParams: { keyword: '', status: 'active' },
    columns: [{ key: 'name', dataIndex: 'name', title: '姓名' }],
    create,
    update,
    remove,
    removeMany
  })

  crud.tableRef.value = fake.instance as unknown as ProTableInstance<Row>
  return { crud, fake, create, update, remove, removeMany }
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm' as never)
  vi.spyOn(ElMessage, 'success').mockImplementation(() => ({}) as never)
})

describe('useCrudTable params', () => {
  it('初始值深拷贝，默认不脏', () => {
    const { crud } = setup([{ id: 1, name: 'a' }])
    expect(crud.params).toEqual({ keyword: '', status: 'active' })
    expect(crud.isDirtyParams.value).toBe(false)
  })

  it('setParams 同值短路，不同值才变脏', () => {
    const { crud } = setup([{ id: 1, name: 'a' }])
    crud.setParams({ keyword: '' })
    expect(crud.isDirtyParams.value).toBe(false)
    crud.setParams({ keyword: '张三' })
    expect(crud.params.keyword).toBe('张三')
    expect(crud.isDirtyParams.value).toBe(true)
  })

  it('resetParams 恢复初始值并返回是否发生变化', () => {
    const { crud } = setup([{ id: 1, name: 'a' }])
    crud.setParams({ keyword: 'x', status: 'disabled' })
    expect(crud.resetParams()).toBe(true)
    expect(crud.params).toEqual({ keyword: '', status: 'active' })
    expect(crud.isDirtyParams.value).toBe(false)
    expect(crud.resetParams()).toBe(false)
  })
})

describe('useCrudTable actions', () => {
  it('create 成功后按默认策略 reload', async () => {
    const { crud, fake, create } = setup([{ id: 1, name: 'a' }])
    await crud.create({ name: '新用户' })
    expect(create).toHaveBeenCalledWith({ name: '新用户' })
    expect(fake.instance.reload).toHaveBeenCalledTimes(1)
    expect(fake.instance.refresh).not.toHaveBeenCalled()
  })

  it('update 成功后按默认策略 refresh（保持当前页）', async () => {
    const { crud, fake, update } = setup([{ id: 1, name: 'a' }])
    const row = { id: 1, name: 'a' }
    await crud.update(row, { name: 'b' })
    expect(update).toHaveBeenCalledWith(row, { name: 'b' })
    expect(fake.instance.refresh).toHaveBeenCalledTimes(1)
    expect(fake.instance.reload).not.toHaveBeenCalled()
  })

  it('remove 需二次确认，取消则不调用接口', async () => {
    vi.spyOn(ElMessageBox, 'confirm').mockRejectedValue(new Error('cancel'))
    const { crud, remove } = setup([{ id: 1, name: 'a' }])
    await crud.remove({ id: 1, name: 'a' })
    expect(remove).not.toHaveBeenCalled()
  })

  it('submitForm 无编辑行走 create，有编辑行走 update 并清空编辑态', async () => {
    const { crud, create, update } = setup([{ id: 1, name: 'a' }])
    await crud.submitForm({ name: '新用户' })
    expect(create).toHaveBeenCalledWith({ name: '新用户' })
    expect(crud.editingRow.value).toBeNull()

    const row = { id: 1, name: 'a' }
    crud.editingRow.value = row
    await crud.submitForm({ name: '改名' })
    expect(update).toHaveBeenCalledWith(row, { name: '改名' })
    expect(crud.editingRow.value).toBeNull()
  })

  it('remove 删除当前页最后一行时回到上一页', async () => {
    const { crud, fake } = setup([{ id: 1, name: 'a' }], 2)
    await crud.remove({ id: 1, name: 'a' })
    expect(fake.instance.setPageInfo).toHaveBeenCalledWith({ current: 1 }, true)
    expect(fake.instance.refresh).not.toHaveBeenCalled()
  })

  it('remove 删除后仍有数据时 refresh', async () => {
    const { crud, fake } = setup([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' }
    ])
    await crud.remove({ id: 1, name: 'a' })
    expect(fake.instance.refresh).toHaveBeenCalledTimes(1)
    expect(fake.instance.setPageInfo).not.toHaveBeenCalled()
  })

  it('removeMany 传选中行与主键，并清空选中', async () => {
    const { crud, fake, removeMany } = setup([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' }
    ])
    fake.selected.value = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' }
    ]
    await crud.removeMany()
    expect(removeMany).toHaveBeenCalledWith(
      [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' }
      ],
      [1, 2]
    )
    expect(crud.selectedKeys.value).toEqual([])
    expect(fake.instance.clearSelection).toHaveBeenCalled()
  })

  it('没有选中行时 removeMany 直接返回', async () => {
    const { crud, removeMany } = setup([{ id: 1, name: 'a' }])
    await crud.removeMany()
    expect(removeMany).not.toHaveBeenCalled()
  })

  it('进行中重复调用被忽略', async () => {
    let resolveRemove: (() => void) | undefined
    const { crud, remove } = setup([{ id: 1, name: 'a' }])
    remove.mockImplementationOnce(
      async () => await new Promise<void>(resolve => (resolveRemove = resolve))
    )
    const first = crud.remove({ id: 1, name: 'a' })
    // 等二次确认的微任务走完，remove 已进入进行中状态
    await new Promise(resolve => setTimeout(resolve, 0))
    const second = crud.remove({ id: 1, name: 'a' })
    resolveRemove?.()
    await Promise.all([first, second])
    expect(remove).toHaveBeenCalledTimes(1)
  })
})

describe('useCrudTable columns', () => {
  it('列工厂拿到 actionColumn，且操作列渲染编辑/删除按钮', () => {
    const crud = useCrudTable<Row, Query, FormModel>({
      request: async () => ({ data: [], total: 0 }),
      update: async () => undefined,
      remove: async () => undefined,
      columns: ({ actionColumn }) => [
        { key: 'name', dataIndex: 'name', title: '姓名' },
        actionColumn()
      ]
    })
    expect(crud.tableProps.value.columns).toHaveLength(2)
    const action = crud.tableProps.value.columns[1]!
    expect(action.key).toBe('actions')
    expect(action.title).toBe('操作')
    expect(action.fixed).toBe('right')
  })

  it('没有配置 update/remove 时操作列不渲染对应按钮', () => {
    const crud = useCrudTable<Row, Query, FormModel>({
      request: async () => ({ data: [], total: 0 }),
      columns: ({ actionColumn }) => [actionColumn()]
    })
    const render = crud.tableProps.value.columns[0]!.render as (scope: unknown) => unknown[]
    expect(render({ row: { id: 1, name: 'a' }, value: undefined, index: 0, column: {} })).toEqual(
      []
    )
  })
})
