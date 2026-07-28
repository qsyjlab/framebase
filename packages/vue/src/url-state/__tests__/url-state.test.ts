// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useUrlState } from '../index'

describe('useUrlState', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('initializes from URL when present', () => {
    window.history.replaceState({}, '', '/?state=%7B%22q%22%3A%22hello%22%7D')
    const { state } = useUrlState<{ q: string }>({ q: '' })
    expect(state.value).toEqual({ q: 'hello' })
  })

  it('falls back to initial when URL is empty', () => {
    const { state } = useUrlState<{ q: string }>({ q: 'default' })
    expect(state.value).toEqual({ q: 'default' })
  })

  it('writes state to URL on change', async () => {
    const { state } = useUrlState<{ count: number }>({ count: 0 })
    state.value.count = 5
    await nextTick()
    expect(window.location.search).toContain('state=')
    expect(decodeURIComponent(window.location.search)).toContain('"count":5')
  })

  it('removes key when state serializes to empty string', async () => {
    const { state } = useUrlState<string>('initial', {
      serialize: v => (v === '' ? '' : JSON.stringify(v)),
      parse: raw => (raw === '' ? '' : JSON.parse(raw))
    })
    state.value = ''
    await nextTick()
    expect(window.location.search).not.toContain('state=')
  })

  it('keeps empty object state in URL', async () => {
    const { state } = useUrlState<Record<string, unknown>>({ a: 1 })
    state.value = {}
    await nextTick()
    expect(window.location.search).toContain('state=%7B%7D')
  })

  it('uses custom serialize/parse', async () => {
    const { state } = useUrlState<number>(0, {
      serialize: v => String(v),
      parse: raw => Number(raw)
    })
    state.value = 42
    await nextTick()
    expect(window.location.search).toContain('state=42')
  })

  it('supports push history mode', async () => {
    const pushSpy = vi.spyOn(window.history, 'pushState')
    const { state } = useUrlState<{ x: number }>({ x: 0 }, { history: 'push' })
    state.value.x = 1
    await nextTick()
    expect(pushSpy).toHaveBeenCalled()
    pushSpy.mockRestore()
  })

  it('read() returns false when key absent', () => {
    const { read } = useUrlState({ a: 1 })
    expect(read()).toBe(false)
  })

  it('read() returns true and updates state when key present', () => {
    window.history.replaceState({}, '', '/?state=%7B%22a%22%3A2%7D')
    const { state, read } = useUrlState({ a: 1 }, { skipInitialRead: true })
    expect(read()).toBe(true)
    expect(state.value).toEqual({ a: 2 })
  })

  it('supports custom router', async () => {
    const router = { replace: vi.fn(), push: vi.fn() }
    const { state } = useUrlState({ k: 0 }, { router })
    state.value.k = 9
    await nextTick()
    expect(router.replace).toHaveBeenCalled()
  })
})
