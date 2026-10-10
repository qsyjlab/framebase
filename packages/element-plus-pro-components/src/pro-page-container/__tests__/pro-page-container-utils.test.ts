import { describe, expect, it } from 'vitest'
import { normalizeProPageBreadcrumbs, resolveProPageBackVisible } from '../pro-page-container-utils'

describe('pro-page-container utils', () => {
  it('normalizes breadcrumb shorthand strings and objects', () => {
    expect(
      normalizeProPageBreadcrumbs(['首页', { text: '列表', to: '/list' }, { text: '详情' }])
    ).toEqual([{ text: '首页' }, { text: '列表', to: '/list' }, { text: '详情' }])
  })

  it('drops empty breadcrumb items', () => {
    expect(normalizeProPageBreadcrumbs(['', '  ', { text: '' }, { text: '详情' }])).toEqual([
      { text: '详情' }
    ])
    expect(normalizeProPageBreadcrumbs(undefined)).toEqual([])
    expect(normalizeProPageBreadcrumbs([])).toEqual([])
  })

  it('keeps explicit back visibility', () => {
    expect(resolveProPageBackVisible(true, false)).toBe(true)
    expect(resolveProPageBackVisible(false, true)).toBe(false)
  })

  it('falls back to handler presence for back visibility', () => {
    expect(resolveProPageBackVisible(undefined, true)).toBe(true)
    expect(resolveProPageBackVisible(undefined, false)).toBe(false)
  })
})
