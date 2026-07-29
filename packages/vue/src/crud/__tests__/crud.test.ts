import { describe, expect, it, vi } from 'vitest'
import { useCrud } from '../index'

interface User {
  id: number
  name: string
}

const users: User[] = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Cara' }
]

function createListRequest(data: User[], delay = 50) {
  return vi.fn(async (params: { current: number; pageSize: number }) => {
    await new Promise(r => setTimeout(r, delay))
    const start = (params.current - 1) * params.pageSize
    return {
      data: data.slice(start, start + params.pageSize),
      total: data.length
    }
  })
}

describe('useCrud', () => {
  it('继承 usePagedList 的所有字段', async () => {
    const request = createListRequest(users)
    const crud = useCrud<User>({
      list: { request, pageSize: 10 }
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))
    expect(crud.list.value).toHaveLength(3)
    expect(crud.current.value).toBe(1)
    expect(crud.pageSize.value).toBe(10)
    expect(crud.total.value).toBe(3)
    expect(typeof crud.reload).toBe('function')
  })

  it('create 成功后自动刷新列表', async () => {
    let store = [...users]
    const listRequest = createListRequest(store)
    const createFn = vi.fn(async (payload: { name: string }) => {
      const newUser = { id: store.length + 1, ...payload }
      store = [...store, newUser]
      listRequest.mockImplementation(async (params: { current: number; pageSize: number }) => {
        await new Promise(r => setTimeout(r, 20))
        const start = (params.current - 1) * params.pageSize
        return { data: store.slice(start, start + params.pageSize), total: store.length }
      })
      return newUser
    })

    const crud = useCrud<User, Record<string, any>, { name: string }>({
      list: { request: listRequest, pageSize: 10 },
      create: createFn
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))
    expect(crud.list.value).toHaveLength(3)

    const result = await crud.create({ name: 'Dan' })
    expect(createFn).toHaveBeenCalledTimes(1)
    expect((result as User).name).toBe('Dan')

    await vi.waitFor(() => expect(crud.list.value).toHaveLength(4))
    expect(crud.list.value.map(u => u.name)).toContain('Dan')
  })

  it('update 成功后自动刷新列表', async () => {
    let store = [...users]
    const listRequest = createListRequest(store)
    const updateFn = vi.fn(async (record: User, payload: { name: string }) => {
      store = store.map(u => (u.id === record.id ? { ...u, ...payload } : u))
      listRequest.mockImplementation(async (params: { current: number; pageSize: number }) => {
        await new Promise(r => setTimeout(r, 20))
        const start = (params.current - 1) * params.pageSize
        return { data: store.slice(start, start + params.pageSize), total: store.length }
      })
    })

    const crud = useCrud<User, Record<string, any>, any, { name: string }>({
      list: { request: listRequest, pageSize: 10 },
      update: updateFn
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))
    await crud.update({ id: 1, name: 'Ada' }, { name: 'Augusta' })

    expect(updateFn).toHaveBeenCalledTimes(1)
    await vi.waitFor(() => {
      expect(crud.list.value.find(u => u.id === 1)?.name).toBe('Augusta')
    })
  })

  it('remove 成功后自动刷新列表', async () => {
    let store = [...users]
    const listRequest = createListRequest(store)
    const removeFn = vi.fn(async (record: User) => {
      store = store.filter(u => u.id !== record.id)
      listRequest.mockImplementation(async (params: { current: number; pageSize: number }) => {
        await new Promise(r => setTimeout(r, 20))
        const start = (params.current - 1) * params.pageSize
        return { data: store.slice(start, start + params.pageSize), total: store.length }
      })
    })

    const crud = useCrud<User>({
      list: { request: listRequest, pageSize: 10 },
      remove: removeFn
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))
    expect(crud.list.value).toHaveLength(3)

    await crud.remove({ id: 2, name: 'Bob' })
    expect(removeFn).toHaveBeenCalledTimes(1)
    await vi.waitFor(() => expect(crud.list.value).toHaveLength(2))
    expect(crud.list.value.find(u => u.id === 2)).toBeUndefined()
  })

  it('autoRefresh=false 不自动刷新', async () => {
    let store = [...users]
    const listRequest = createListRequest(store)
    const createFn = vi.fn(async (payload: { name: string }) => {
      store = [...store, { id: store.length + 1, ...payload }]
    })

    const crud = useCrud<User, Record<string, any>, { name: string }>({
      list: { request: listRequest, pageSize: 10 },
      create: createFn,
      autoRefresh: false
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))
    expect(crud.list.value).toHaveLength(3)

    await crud.create({ name: 'Dan' })
    // store 已变，但 list 未刷新
    expect(crud.list.value).toHaveLength(3)
    expect(store).toHaveLength(4)
  })

  it('create 进行中再次调用被忽略', async () => {
    const listRequest = createListRequest(users)
    let resolveCreate!: () => void
    const createFn = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveCreate = resolve
        })
    )

    const crud = useCrud<User, Record<string, any>, { name: string }>({
      list: { request: listRequest, pageSize: 10 },
      create: createFn
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))

    const p1 = crud.create({ name: 'Dan' })
    const result2 = await crud.create({ name: 'Eve' }) // 进行中，被忽略
    expect(result2).toBeUndefined()
    expect(createFn).toHaveBeenCalledTimes(1)

    resolveCreate()
    await p1
  })

  it('未配置 create 时调用抛错', async () => {
    const listRequest = createListRequest(users)
    const crud = useCrud<User>({
      list: { request: listRequest, pageSize: 10 }
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))
    await expect(crud.create({})).rejects.toThrow('useCrud: 未配置 create')
  })

  it('create 失败时不刷新列表', async () => {
    const store = [...users]
    const listRequest = createListRequest(store)
    const createFn = vi.fn(async () => {
      throw new Error('create failed')
    })

    const crud = useCrud<User, Record<string, any>, { name: string }>({
      list: { request: listRequest, pageSize: 10 },
      create: createFn
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))
    await expect(crud.create({ name: 'Dan' })).rejects.toThrow('create failed')
    expect(store).toHaveLength(3) // 未变更
    // listRequest 只被初始调用一次（未触发 reload）
    expect(listRequest).toHaveBeenCalledTimes(1)
  })

  it('submitting 反映任一写操作状态', async () => {
    const listRequest = createListRequest(users)
    let resolveCreate!: () => void
    const createFn = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveCreate = resolve
        })
    )

    const crud = useCrud<User, Record<string, any>, { name: string }>({
      list: { request: listRequest, pageSize: 10 },
      create: createFn
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))
    expect(crud.submitting.value).toBe(false)

    const p = crud.create({ name: 'Dan' })
    await vi.waitFor(() => expect(crud.submitting.value).toBe(true))
    expect(crud.creating.value).toBe(true)
    expect(crud.updating.value).toBe(false)
    expect(crud.removing.value).toBe(false)

    resolveCreate()
    await p
    await vi.waitFor(() => expect(crud.submitting.value).toBe(false))
  })

  it('creating/updating/removing 互不干扰', async () => {
    const listRequest = createListRequest(users)
    let resolveCreate!: () => void
    let resolveUpdate!: () => void
    let resolveRemove!: () => void
    const createFn = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveCreate = resolve
        })
    )
    const updateFn = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveUpdate = resolve
        })
    )
    const removeFn = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveRemove = resolve
        })
    )

    const crud = useCrud<User, Record<string, any>, any, any>({
      list: { request: listRequest, pageSize: 10 },
      create: createFn,
      update: updateFn,
      remove: removeFn
    })

    await vi.waitFor(() => expect(crud.loading.value).toBe(false))

    const pC = crud.create({ name: 'X' })
    const pU = crud.update({ id: 1, name: 'A' }, { name: 'X' })
    const pR = crud.remove({ id: 2, name: 'B' })

    await vi.waitFor(() => {
      expect(crud.creating.value).toBe(true)
      expect(crud.updating.value).toBe(true)
      expect(crud.removing.value).toBe(true)
      expect(crud.submitting.value).toBe(true)
    })

    resolveCreate()
    resolveUpdate()
    resolveRemove()
    await Promise.all([pC, pU, pR])

    await vi.waitFor(() => expect(crud.submitting.value).toBe(false))
  })
})
