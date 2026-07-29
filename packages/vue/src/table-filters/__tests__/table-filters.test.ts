import { describe, expect, it, vi } from 'vitest'
import { useTableFilters } from '../index'

describe('useTableFilters', () => {
  it('默认无筛选', () => {
    const { filters, hasFilters } = useTableFilters()
    expect(filters.value).toEqual({})
    expect(hasFilters.value).toBe(false)
  })

  it('setFilter 设置筛选', () => {
    const { filters, hasFilters, setFilter } = useTableFilters()
    setFilter('status', ['active', 'pending'])
    expect(filters.value).toEqual({ status: ['active', 'pending'] })
    expect(hasFilters.value).toBe(true)
  })

  it('setFilter 空数组清除该字段', () => {
    const { filters, setFilter } = useTableFilters()
    setFilter('status', ['active'])
    setFilter('status', [])
    expect(filters.value).toEqual({})
  })

  it('初始值自动剪枝空数组', () => {
    const { filters } = useTableFilters({ initial: { status: ['active'], empty: [] } })
    expect(filters.value).toEqual({ status: ['active'] })
  })

  it('clear 清除单个字段', () => {
    const { filters, setFilter, clear } = useTableFilters()
    setFilter('status', ['active'])
    setFilter('type', ['a'])
    clear('status')
    expect(filters.value).toEqual({ type: ['a'] })
  })

  it('clear 不存在的字段是空操作', () => {
    const { filters, clear } = useTableFilters()
    clear('nope')
    expect(filters.value).toEqual({})
  })

  it('clearAll 清除所有', () => {
    const { filters, hasFilters, setFilter, clearAll } = useTableFilters()
    setFilter('status', ['active'])
    setFilter('type', ['a'])
    clearAll()
    expect(filters.value).toEqual({})
    expect(hasFilters.value).toBe(false)
  })

  it('reset 恢复初始', () => {
    const { filters, setFilter, reset } = useTableFilters({ initial: { status: ['active'] } })
    setFilter('type', ['a'])
    reset()
    expect(filters.value).toEqual({ status: ['active'] })
  })

  it('onChange 回调', () => {
    const spy = vi.fn()
    const { setFilter } = useTableFilters({ onChange: spy })
    setFilter('status', ['active'])
    expect(spy).toHaveBeenCalledWith({ status: ['active'] })
  })

  it('hasFilters 多字段场景', () => {
    const { hasFilters, setFilter, clear } = useTableFilters()
    setFilter('a', [1])
    setFilter('b', [2])
    expect(hasFilters.value).toBe(true)
    clear('a')
    expect(hasFilters.value).toBe(true)
    clear('b')
    expect(hasFilters.value).toBe(false)
  })
})
