import { describe, expect, it, vi } from 'vitest'
import { useTableSort } from '../index'

describe('useTableSort', () => {
  it('默认无排序', () => {
    const { state, hasSort } = useTableSort()
    expect(state.value).toEqual({ field: null, order: null })
    expect(hasSort.value).toBe(false)
  })

  it('setSort 设置排序', () => {
    const { state, hasSort, setSort } = useTableSort()
    setSort('name', 'asc')
    expect(state.value).toEqual({ field: 'name', order: 'asc' })
    expect(hasSort.value).toBe(true)
  })

  it('order=null 清除排序', () => {
    const { state, hasSort, clear } = useTableSort({ initial: { field: 'name', order: 'asc' } })
    expect(hasSort.value).toBe(true)
    clear()
    expect(state.value).toEqual({ field: null, order: null })
    expect(hasSort.value).toBe(false)
  })

  it('reset 恢复初始', () => {
    const { state, setSort, reset } = useTableSort({ initial: { field: 'age', order: 'desc' } })
    setSort('name', 'asc')
    reset()
    expect(state.value).toEqual({ field: 'age', order: 'desc' })
  })

  it('onChange 回调', () => {
    const spy = vi.fn()
    const { setSort } = useTableSort({ onChange: spy })
    setSort('name', 'asc')
    expect(spy).toHaveBeenCalledWith({ field: 'name', order: 'asc' })
  })

  it('initial 配置生效', () => {
    const { state, hasSort } = useTableSort({ initial: { field: 'id', order: 'desc' } })
    expect(state.value).toEqual({ field: 'id', order: 'desc' })
    expect(hasSort.value).toBe(true)
  })
})
