import { describe, expect, it } from 'vitest'
import { normalizePagedResponse, paginateData, getRowKey, moveItem } from '../index'

describe('normalizePagedResponse', () => {
  it('passes through valid responses', () => {
    const result = normalizePagedResponse({ data: [1, 2], total: 2, success: true })
    expect(result).toEqual({ data: [1, 2], total: 2, success: true })
  })

  it('defaults missing data to empty array', () => {
    const result = normalizePagedResponse({ total: 0, data: undefined as unknown as never[] })
    expect(result.data).toEqual([])
  })

  it('defaults non-finite total to 0', () => {
    const result = normalizePagedResponse({ data: [], total: Number.NaN })
    expect(result.total).toBe(0)
  })
})

describe('paginateData', () => {
  const data = [1, 2, 3, 4, 5, 6, 7]

  it('slices by current page and size', () => {
    expect(paginateData(data, { current: 1, pageSize: 3 })).toEqual([1, 2, 3])
    expect(paginateData(data, { current: 2, pageSize: 3 })).toEqual([4, 5, 6])
    expect(paginateData(data, { current: 3, pageSize: 3 })).toEqual([7])
  })

  it('returns empty for out-of-range pages', () => {
    expect(paginateData(data, { current: 10, pageSize: 3 })).toEqual([])
  })
})

describe('getRowKey', () => {
  it('resolves by path string', () => {
    expect(getRowKey({ id: 7 }, 'id')).toBe(7)
    expect(getRowKey({ user: { id: 'u1' } }, 'user.id')).toBe('u1')
  })

  it('resolves by function', () => {
    expect(getRowKey({ id: 7 }, record => record.id)).toBe(7)
  })
})

describe('moveItem', () => {
  it('moves item from old to new index', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b'])
  })

  it('returns a copy when indices are equal or out of range', () => {
    expect(moveItem(['a', 'b'], 1, 1)).toEqual(['a', 'b'])
    expect(moveItem(['a', 'b'], -1, 0)).toEqual(['a', 'b'])
    expect(moveItem(['a', 'b'], 0, 5)).toEqual(['a', 'b'])
  })
})
