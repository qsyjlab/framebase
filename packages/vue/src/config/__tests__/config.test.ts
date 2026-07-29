import { describe, expect, it } from 'vitest'
import { mergeHookConfig, resolveHookOption } from '../index'

describe('hook config 纯函数', () => {
  it('mergeHookConfig: 深度合并，current 覆盖 parent', () => {
    const merged = mergeHookConfig(
      { request: { debounce: 100, retry: 1 }, pagination: { defaultPageSize: 20 } },
      { request: { debounce: 300 }, pagedList: { immediate: false } }
    )
    expect(merged.request?.debounce).toBe(300) // current 覆盖
    expect(merged.request?.retry).toBe(1) // parent 保留
    expect(merged.pagination?.defaultPageSize).toBe(20) // parent 保留
    expect(merged.pagedList?.immediate).toBe(false) // current 新增
  })

  it('mergeHookConfig: 两边都为空字段返回 undefined', () => {
    const merged = mergeHookConfig({}, {})
    expect(merged.request).toBeUndefined()
    expect(merged.pagination).toBeUndefined()
    expect(merged.pagedList).toBeUndefined()
  })

  it('mergeHookConfig: parent 完整保留', () => {
    const merged = mergeHookConfig({ request: { debounce: 100, retry: 2, retryDelay: 500 } }, {})
    expect(merged.request).toEqual({ debounce: 100, retry: 2, retryDelay: 500 })
  })

  it('resolveHookOption: local 优先于 config', () => {
    expect(resolveHookOption(10, 20)).toBe(10)
    expect(resolveHookOption(undefined, 20)).toBe(20)
    expect(resolveHookOption(undefined, undefined)).toBeUndefined()
    // local 为 0/false/''等 falsy 值时也算显式传入，优先于 config
    expect(resolveHookOption(0, 20)).toBe(0)
    expect(resolveHookOption(false, true)).toBe(false)
  })
})
