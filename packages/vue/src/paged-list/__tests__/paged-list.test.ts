import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { usePagedList } from '../index'

function createRequest<TRecord>(data: TRecord[], total: number, delay = 0) {
  return vi.fn(async (params: { current: number; pageSize: number }) => {
    if (delay) await new Promise(r => setTimeout(r, delay))
    const start = (params.current - 1) * params.pageSize
    return {
      data: data.slice(start, start + params.pageSize),
      total
    }
  })
}

describe('usePagedList', () => {
  it('immediate 请求：挂载时自动发起首次请求', async () => {
    const request = createRequest([1, 2, 3, 4, 5], 5)
    const { list, total, loading, initialLoading } = usePagedList({
      request,
      pageSize: 2
    })

    expect(initialLoading.value).toBe(true)
    await nextTick()
    await vi.waitFor(() => {
      expect(loading.value).toBe(false)
    })

    expect(request).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenLastCalledWith(
      { current: 1, pageSize: 2 },
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(list.value).toEqual([1, 2])
    expect(total.value).toBe(5)
  })

  it('immediate: false 不自动请求', async () => {
    const request = createRequest([1, 2, 3], 3)
    const { loading, reload } = usePagedList({
      request,
      immediate: false
    })

    expect(loading.value).toBe(false)
    expect(request).not.toHaveBeenCalled()

    await reload()
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('分页变化自动请求', async () => {
    const request = createRequest([1, 2, 3, 4, 5, 6], 6)
    const { list, setCurrent, loading } = usePagedList({
      request,
      pageSize: 2
    })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    expect(list.value).toEqual([1, 2])

    setCurrent(2)
    await vi.waitFor(() => expect(list.value).toEqual([3, 4]))
    expect(request).toHaveBeenLastCalledWith({ current: 2, pageSize: 2 }, expect.any(Object))
  })

  it('pageSize 变化自动请求', async () => {
    const request = createRequest([1, 2, 3, 4, 5], 5)
    const { list, setPageSize, loading } = usePagedList({
      request,
      pageSize: 2
    })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    setPageSize(5)
    await vi.waitFor(() => expect(list.value).toEqual([1, 2, 3, 4, 5]))
    expect(request).toHaveBeenLastCalledWith({ current: 1, pageSize: 5 }, expect.any(Object))
  })

  it('reload 重新请求当前页', async () => {
    const request = createRequest([1, 2, 3], 3)
    const { reload, loading } = usePagedList({ request })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    await reload()
    expect(request).toHaveBeenCalledTimes(2)
    expect(request).toHaveBeenLastCalledWith({ current: 1, pageSize: 10 }, expect.any(Object))
  })

  it('refresh 回到第一页', async () => {
    const request = createRequest([1, 2, 3, 4], 4)
    const { refresh, setCurrent, loading, list } = usePagedList({
      request,
      pageSize: 2
    })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    setCurrent(2)
    await vi.waitFor(() => expect(list.value).toEqual([3, 4]))
    expect(request).toHaveBeenLastCalledWith({ current: 2, pageSize: 2 }, expect.any(Object))

    await refresh()
    // refresh 触发 setCurrent(1) 的分页 watch 请求
    await vi.waitFor(() => expect(list.value).toEqual([1, 2]))
    expect(request).toHaveBeenLastCalledWith({ current: 1, pageSize: 2 }, expect.any(Object))
  })

  it('params 响应式变化回到第一页请求', async () => {
    const request = vi.fn(
      async (_params: { current: number; pageSize: number; keyword?: string }) => {
        return { data: [], total: 0 }
      }
    )
    const keyword = ref<string | undefined>(undefined)
    const { refresh: _refresh } = usePagedList({
      request,
      params: () => ({ keyword: keyword.value }),
      pageSize: 10
    })

    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1))
    expect(request).toHaveBeenLastCalledWith(
      { current: 1, pageSize: 10, keyword: undefined },
      expect.any(Object)
    )

    keyword.value = 'foo'
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2))
    expect(request).toHaveBeenLastCalledWith(
      { current: 1, pageSize: 10, keyword: 'foo' },
      expect.any(Object)
    )
  })

  it('响应归一化：data 缺失时为空数组', async () => {
    const request = vi.fn(async () => ({ total: 5 }) as any)
    const { list, total, loading } = usePagedList({ request })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    expect(list.value).toEqual([])
    expect(total.value).toBe(5)
  })

  it('cancel 取消进行中的请求', async () => {
    const request = createRequest([1, 2], 2, 100)
    const { cancel, loading, initialLoading: _initialLoading } = usePagedList({ request })

    expect(loading.value).toBe(true)
    cancel()
    await nextTick()
    // 取消后 loading 最终为 false
    await vi.waitFor(() => expect(loading.value).toBe(false))
  })

  it('error 状态：请求失败时写入 error', async () => {
    const error = new Error('boom')
    const request = vi.fn(async () => {
      throw error
    })
    const { error: errorRef, loading, refresh } = usePagedList({ request, immediate: false })

    await expect(refresh()).rejects.toBeDefined()
    await vi.waitFor(() => expect(loading.value).toBe(false))
    // useRequest 在失败时不会自动重试（无 retry 配置），error 被记录
    // 注意：refresh 内部若 current===1 直接 await fetch，fetch 内 execute 抛出
    expect(request).toHaveBeenCalled()
    expect(errorRef.value).toBeDefined()
  })
})
