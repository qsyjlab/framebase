import { describe, expect, it, vi } from 'vitest'
import { nextTick, watchEffect } from 'vue'
import { useAsyncLock } from '../index'

describe('useAsyncLock', () => {
  it('同 key 并发：第二次 run 返回 undefined 且不调用 fn', async () => {
    const lock = useAsyncLock()
    const fn = vi.fn(async () => {
      await new Promise(r => setTimeout(r, 50))
      return 'done'
    })

    const p1 = lock.run(fn)
    const p2 = lock.run(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(await p2).toBeUndefined()
    expect(await p1).toBe('done')
  })

  it('不同 key 互不阻塞', async () => {
    const lock = useAsyncLock()
    const fnA = vi.fn(async () => 'a')
    const fnB = vi.fn(async () => 'b')

    const p1 = lock.run(fnA, 'a')
    const p2 = lock.run(fnB, 'b')

    expect(fnA).toHaveBeenCalledTimes(1)
    expect(fnB).toHaveBeenCalledTimes(1)
    expect(await p1).toBe('a')
    expect(await p2).toBe('b')
  })

  it('fn 成功后释放锁，可再次 run', async () => {
    const lock = useAsyncLock()
    const fn = vi.fn(async () => 'ok')

    await lock.run(fn)
    expect(lock.isLocked()).toBe(false)

    const result = await lock.run(fn)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(result).toBe('ok')
  })

  it('fn 失败后也释放锁', async () => {
    const lock = useAsyncLock()
    const fn = vi.fn(async () => {
      throw new Error('boom')
    })

    await expect(lock.run(fn)).rejects.toThrow('boom')
    expect(lock.isLocked()).toBe(false)
    expect(lock.locks.value.size).toBe(0)
  })

  it('isLocked 反映锁状态', async () => {
    const lock = useAsyncLock()
    let resolve!: (v: string) => void
    const pending = new Promise<string>(r => {
      resolve = r
    })

    const p = lock.run(() => pending)
    expect(lock.isLocked()).toBe(true)
    expect(lock.isLocked('default')).toBe(true)
    expect(lock.isLocked('other')).toBe(false)

    resolve('done')
    await p
    expect(lock.isLocked()).toBe(false)
  })

  it('cancel 释放指定 key 的锁', async () => {
    const lock = useAsyncLock()
    let resolve!: (v: string) => void
    const pending = new Promise<string>(r => {
      resolve = r
    })

    const p = lock.run(() => pending, 'task')
    expect(lock.isLocked('task')).toBe(true)

    lock.cancel('task')
    expect(lock.isLocked('task')).toBe(false)

    // cancel 不影响 in-flight fn，仍会 resolve
    resolve('done')
    expect(await p).toBe('done')
  })

  it('cancelAll 释放所有锁', async () => {
    const lock = useAsyncLock()
    let r1!: (v: string) => void
    let r2!: (v: string) => void
    const p1 = new Promise<string>(r => {
      r1 = r
    })
    const p2 = new Promise<string>(r => {
      r2 = r
    })

    const task1 = lock.run(() => p1, 'a')
    const task2 = lock.run(() => p2, 'b')
    expect(lock.locks.value.size).toBe(2)

    lock.cancelAll()
    expect(lock.locks.value.size).toBe(0)
    expect(lock.isLocked('a')).toBe(false)
    expect(lock.isLocked('b')).toBe(false)

    r1('x')
    r2('y')
    await Promise.all([task1, task2])
  })

  it('未锁定的 key 调用 cancel 是空操作', () => {
    const lock = useAsyncLock()
    expect(() => lock.cancel('not-locked')).not.toThrow()
    expect(lock.locks.value.size).toBe(0)
  })

  it('locks 是响应式的', async () => {
    const lock = useAsyncLock()
    const sizes: number[] = []
    const stop = watchEffect(() => sizes.push(lock.locks.value.size))

    await lock.run(async () => 'ok')
    await nextTick()
    stop()

    // 至少捕获到 0 → 1 → 0 三个状态
    expect(sizes).toContain(0)
    expect(sizes).toContain(1)
  })
})
