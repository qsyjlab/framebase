import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useInfiniteList } from '../index'

function createPages<T>(pages: T[][], delay = 50) {
  return vi.fn(async (params: { current: number; pageSize: number }) => {
    await new Promise(r => setTimeout(r, delay))
    const page = pages[params.current - 1] ?? []
    return { data: page, total: pages.flat().length }
  })
}

describe('useInfiniteList', () => {
  it('immediate 默认加载第 1 页', async () => {
    const request = createPages([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const { list, current, total, loading } = useInfiniteList({ request, pageSize: 2 })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    expect(list.value).toEqual([1, 2])
    expect(current.value).toBe(1)
    expect(total.value).toBe(6)
  })

  it('loadMore 累积下一页', async () => {
    const request = createPages([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const { list, current, loadMore, loading } = useInfiniteList({ request, pageSize: 2 })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    await loadMore()
    expect(list.value).toEqual([1, 2, 3, 4])
    expect(current.value).toBe(2)
  })

  it('hasMore 基于 total：未到 total 为 true，到 total 为 false', async () => {
    const request = createPages([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const { hasMore, loadMore, loading } = useInfiniteList({ request, pageSize: 2 })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    expect(hasMore.value).toBe(true) // 2 < 6

    await loadMore()
    expect(hasMore.value).toBe(true) // 4 < 6

    await loadMore()
    expect(hasMore.value).toBe(false) // 6 >= 6
  })

  it('hasMore=false 时 loadMore 空操作', async () => {
    const request = createPages([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const { list, loadMore, loading } = useInfiniteList({ request, pageSize: 2 })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    await loadMore()
    await loadMore()
    expect(list.value).toEqual([1, 2, 3, 4, 5, 6])

    await loadMore() // 已无更多
    expect(request).toHaveBeenCalledTimes(3)
  })

  it('loadMore 在 loading 中空操作', async () => {
    const request = createPages(
      [
        [1, 2],
        [3, 4]
      ],
      100
    )
    const { loadMore, loading } = useInfiniteList({ request, pageSize: 2 })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    const p1 = loadMore()
    const p2 = loadMore() // 进行中，应被忽略
    await Promise.all([p1, p2])
    expect(request).toHaveBeenCalledTimes(2) // 初始 + 一次 loadMore
  })

  it('reload 清空并重新加载第 1 页', async () => {
    const request = createPages([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const { list, current, reload, loadMore, loading } = useInfiniteList({
      request,
      pageSize: 2
    })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    await loadMore()
    expect(list.value).toEqual([1, 2, 3, 4])

    await reload()
    expect(list.value).toEqual([1, 2])
    expect(current.value).toBe(1)
  })

  it('immediate=false 不自动加载', async () => {
    const request = createPages([[1, 2]])
    const { list, loading, reload } = useInfiniteList({
      request,
      pageSize: 2,
      immediate: false
    })

    await nextTick()
    expect(request).not.toHaveBeenCalled()
    expect(list.value).toEqual([])
    expect(loading.value).toBe(false)

    await reload()
    expect(list.value).toEqual([1, 2])
  })

  it('params 变化触发 reload', async () => {
    const request = vi.fn(
      async (params: { current: number; pageSize: number; keyword?: string }) => {
        await new Promise(r => setTimeout(r, 20))
        const data = params.keyword === 'foo' ? [1, 2] : [10, 20]
        return { data, total: 2 }
      }
    )
    const keyword = ref<string | undefined>(undefined)
    const { list, loading } = useInfiniteList({
      request,
      pageSize: 2,
      params: () => ({ keyword: keyword.value })
    })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    expect(list.value).toEqual([10, 20])

    keyword.value = 'foo'
    await vi.waitFor(() => expect(list.value).toEqual([1, 2]))
  })

  it('hasMore 兜底：data 不足一页时为 false（total 缺失）', async () => {
    const request = vi.fn(async (params: { current: number; pageSize: number }) => {
      await new Promise(r => setTimeout(r, 20))
      // 不返回 total
      return { data: params.current === 1 ? [1, 2] : [3], total: 0 } as any
    })
    const { hasMore, loadMore, loading } = useInfiniteList({ request, pageSize: 2 })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    expect(hasMore.value).toBe(true) // 本页满载 2 条

    await loadMore()
    expect(hasMore.value).toBe(false) // 本页只有 1 条，不足
  })

  it('自定义 hasMore 选项', async () => {
    const request = vi.fn(async () => ({ data: [1, 2], total: 100 }))
    const hasMoreSpy = vi.fn(() => false)
    const { hasMore, loadMore, loading } = useInfiniteList({
      request,
      pageSize: 2,
      hasMore: hasMoreSpy
    })

    await vi.waitFor(() => expect(loading.value).toBe(false))
    expect(hasMore.value).toBe(false)
    expect(hasMoreSpy).toHaveBeenCalled()

    await loadMore()
    expect(request).toHaveBeenCalledTimes(1) // loadMore 被忽略
  })

  it('error 状态：请求失败时写入 error', async () => {
    const error = new Error('boom')
    const request = vi.fn(async () => {
      throw error
    })
    const {
      error: errorRef,
      loading,
      refresh
    } = useInfiniteList({
      request,
      immediate: false
    })

    await expect(refresh()).rejects.toBeDefined()
    await vi.waitFor(() => expect(loading.value).toBe(false))
    expect(errorRef.value).toBeDefined()
  })
})
