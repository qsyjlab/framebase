import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { usePagination } from '../index'

describe('usePagination', () => {
  it('initializes with defaults', () => {
    const p = usePagination()
    expect(p.current.value).toBe(1)
    expect(p.pageSize.value).toBe(10)
    expect(p.total.value).toBe(0)
    expect(p.pageInfo.value).toEqual({ current: 1, pageSize: 10 })
  })

  it('initializes with options', () => {
    const p = usePagination({ current: 2, pageSize: 20, total: 100 })
    expect(p.current.value).toBe(2)
    expect(p.pageSize.value).toBe(20)
    expect(p.total.value).toBe(100)
  })

  it('setCurrent updates current and emits change', () => {
    const p = usePagination()
    const listener = vi.fn()
    p.onChange(listener)

    p.setCurrent(3)
    expect(p.current.value).toBe(3)
    expect(listener).toHaveBeenCalledWith({
      pageInfo: { current: 3, pageSize: 10 },
      previous: { current: 1, pageSize: 10 },
      reason: 'current'
    })
  })

  it('setPageSize updates pageSize and emits change', () => {
    const p = usePagination({ current: 2, pageSize: 10 })
    const listener = vi.fn()
    p.onChange(listener)

    p.setPageSize(20)
    expect(p.pageSize.value).toBe(20)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].reason).toBe('size')
  })

  it('setPageInfo merges partial info', () => {
    const p = usePagination({ current: 1, pageSize: 10 })
    const listener = vi.fn()
    p.onChange(listener)

    p.setPageInfo({ current: 5, pageSize: 50 })
    expect(p.pageInfo.value).toEqual({ current: 5, pageSize: 50 })
    expect(listener.mock.calls[0][0].reason).toBe('external')
  })

  it('reset restores initial values', () => {
    const p = usePagination({ current: 1, pageSize: 10 })
    p.setCurrent(7)
    p.setPageSize(50)
    p.reset()

    expect(p.current.value).toBe(1)
    expect(p.pageSize.value).toBe(10)
  })

  it('isLastPage reflects total boundary', async () => {
    const p = usePagination({ current: 1, pageSize: 10, total: 25 })
    expect(p.isLastPage.value).toBe(false)

    p.setCurrent(3)
    await nextTick()
    expect(p.isLastPage.value).toBe(true)
  })

  it('guards against non-positive values', () => {
    const p = usePagination()
    p.setCurrent(-1)
    expect(p.current.value).toBe(1)
    p.setPageSize(0)
    expect(p.pageSize.value).toBe(1)
  })

  it('onChange unsubscribe stops emitting', () => {
    const p = usePagination()
    const listener = vi.fn()
    const off = p.onChange(listener)

    p.setCurrent(2)
    off()
    p.setCurrent(3)

    expect(listener).toHaveBeenCalledTimes(1)
  })
})
