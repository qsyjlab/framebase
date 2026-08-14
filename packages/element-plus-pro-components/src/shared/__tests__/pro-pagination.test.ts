import { describe, expect, it } from 'vitest'
import { resolveProPagination } from '../pro-pagination'

describe('resolveProPagination', () => {
  const baseOptions = {
    defaultPageSizes: [10, 20, 50, 100],
    small: false,
    dark: false
  }

  it('falls back to built-in defaults when nothing is configured', () => {
    const result = resolveProPagination(undefined, undefined, baseOptions)
    expect(result).toEqual({
      current: 1,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      layout: 'total, sizes, prev, pager, next, jumper',
      background: true,
      small: false,
      popperClass: '',
      teleported: true
    })
  })

  it('treats a boolean inline prop as an empty config', () => {
    const result = resolveProPagination(false, undefined, baseOptions)
    expect(result.pageSize).toBe(10)
    expect(result.pageSizes).toEqual([10, 20, 50, 100])
  })

  it('lets inline props override global config', () => {
    const result = resolveProPagination(
      { pageSize: 50, pageSizes: [50, 100] },
      { pageSize: 20, pageSizes: [20, 40], background: false },
      baseOptions
    )
    expect(result.pageSize).toBe(50)
    expect(result.pageSizes).toEqual([50, 100])
    // inline did not set background, so global wins
    expect(result.background).toBe(false)
  })

  it('uses global config for fields the inline prop leaves unset', () => {
    const result = resolveProPagination(
      { current: 2 },
      { pageSize: 20, pageSizes: [20, 40], layout: ['total', 'pager'], teleported: false },
      baseOptions
    )
    expect(result.current).toBe(2)
    expect(result.pageSize).toBe(20)
    expect(result.pageSizes).toEqual([20, 40])
    expect(result.layout).toBe('total,pager')
    expect(result.teleported).toBe(false)
  })

  it('applies the dark scope to the popper class from either source', () => {
    expect(
      resolveProPagination({ popperClass: 'inline-class' }, undefined, {
        ...baseOptions,
        dark: true
      }).popperClass
    ).toBe('inline-class pro-config-provider-popper--dark')

    expect(
      resolveProPagination(
        undefined,
        { popperClass: 'global-class' },
        {
          ...baseOptions,
          dark: true
        }
      ).popperClass
    ).toBe('global-class pro-config-provider-popper--dark')
  })

  it('prefers the size-derived small fallback when neither side sets it', () => {
    expect(resolveProPagination(undefined, undefined, { ...baseOptions, small: true }).small).toBe(
      true
    )
    expect(
      resolveProPagination({ small: false }, undefined, { ...baseOptions, small: true }).small
    ).toBe(false)
  })
})
