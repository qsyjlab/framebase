import { describe, expect, it } from 'vitest'
import { useColumnVisibility } from '../index'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size
    }
  }
}

describe('useColumnVisibility', () => {
  it('默认全部可见（空 map）', () => {
    const { isVisible, hiddenKeys } = useColumnVisibility()
    expect(isVisible('a')).toBe(true)
    expect(isVisible('b')).toBe(true)
    expect(hiddenKeys.value).toEqual([])
  })

  it('initial 设置隐藏列', () => {
    const { isVisible, hiddenKeys } = useColumnVisibility({ initial: { a: false } })
    expect(isVisible('a')).toBe(false)
    expect(isVisible('b')).toBe(true)
    expect(hiddenKeys.value).toEqual(['a'])
  })

  it('toggle 切换', () => {
    const { isVisible, toggle } = useColumnVisibility()
    toggle('a')
    expect(isVisible('a')).toBe(false)
    toggle('a')
    expect(isVisible('a')).toBe(true)
  })

  it('show / hide', () => {
    const { isVisible, hide, show } = useColumnVisibility()
    hide('a')
    expect(isVisible('a')).toBe(false)
    show('a')
    expect(isVisible('a')).toBe(true)
    // show 已可见列是空操作
    show('a')
    expect(isVisible('a')).toBe(true)
  })

  it('showAll 清空 map（全部可见）', () => {
    const { hiddenKeys, hide, showAll } = useColumnVisibility()
    hide('a')
    hide('b')
    showAll()
    expect(hiddenKeys.value).toEqual([])
  })

  it('reset 恢复初始', () => {
    const { isVisible, hide, reset } = useColumnVisibility({ initial: { a: false } })
    hide('b')
    reset()
    expect(isVisible('a')).toBe(false)
    expect(isVisible('b')).toBe(true)
  })

  it('storageKey 持久化到 localStorage', () => {
    const storage = createMemoryStorage()
    const { hide } = useColumnVisibility({ storageKey: 'cols', storage })
    hide('a')
    const raw = storage.getItem('cols')
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)).toEqual({ a: false })
  })

  it('storageKey 读取已持久化的状态', () => {
    const storage = createMemoryStorage()
    storage.setItem('cols', JSON.stringify({ a: false, b: false }))
    const { isVisible, hiddenKeys } = useColumnVisibility({ storageKey: 'cols', storage })
    expect(isVisible('a')).toBe(false)
    expect(isVisible('b')).toBe(false)
    expect(hiddenKeys.value).toEqual(['a', 'b'])
  })

  it('storageKey 优先读取持久化值，覆盖 initial', () => {
    const storage = createMemoryStorage()
    storage.setItem('cols', JSON.stringify({ a: false }))
    const { isVisible } = useColumnVisibility({
      storageKey: 'cols',
      storage,
      initial: { b: false }
    })
    expect(isVisible('a')).toBe(false)
    expect(isVisible('b')).toBe(true) // initial 被持久化值覆盖
  })

  it('storage 写入失败静默忽略', () => {
    const failingStorage: Storage = {
      ...createMemoryStorage(),
      setItem: () => {
        throw new Error('quota')
      }
    }
    const { hide } = useColumnVisibility({ storageKey: 'cols', storage: failingStorage })
    expect(() => hide('a')).not.toThrow()
  })

  it('toggle 后持久化更新', () => {
    const storage = createMemoryStorage()
    const { toggle } = useColumnVisibility({ storageKey: 'cols', storage })
    toggle('a')
    expect(JSON.parse(storage.getItem('cols')!)).toEqual({ a: false })
    toggle('a')
    // show 会 delete key，但 toggle 写入 true
    expect(JSON.parse(storage.getItem('cols')!)).toEqual({ a: true })
  })
})
