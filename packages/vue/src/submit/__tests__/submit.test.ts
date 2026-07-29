import { describe, expect, it, vi } from 'vitest'
import { nextTick, watchEffect } from 'vue'
import { useSubmit } from '../index'

describe('useSubmit', () => {
  it('初始状态：未 loading、无 error、未 success', () => {
    const { loading, error, success } = useSubmit()
    expect(loading.value).toBe(false)
    expect(error.value).toBeUndefined()
    expect(success.value).toBe(false)
  })

  it('成功：loading→true→false，success=true，error 清空', async () => {
    let resolve!: (v: string) => void
    const pending = new Promise<string>(r => {
      resolve = r
    })
    const { loading, error, success, run } = useSubmit<string>()

    const p = run(() => pending)
    expect(loading.value).toBe(true)
    expect(success.value).toBe(false)

    resolve('ok')
    const result = await p
    expect(loading.value).toBe(false)
    expect(result).toBe('ok')
    expect(success.value).toBe(true)
    expect(error.value).toBeUndefined()
  })

  it('失败：error 写入，success=false，抛出原始错误', async () => {
    const { loading, error, success, run } = useSubmit()
    const boom = new Error('boom')

    await expect(
      run(async () => {
        throw boom
      })
    ).rejects.toThrow('boom')
    expect(loading.value).toBe(false)
    expect(error.value).toBe(boom)
    expect(success.value).toBe(false)
  })

  it('重入：进行中再次调用返回 undefined 且不执行 fn', async () => {
    let resolve!: () => void
    const pending = new Promise<void>(r => {
      resolve = r
    })
    const fn = vi.fn(() => pending)
    const { run } = useSubmit()

    const p1 = run(fn)
    const result2 = await run(fn) // 进行中，被忽略
    expect(result2).toBeUndefined()
    expect(fn).toHaveBeenCalledTimes(1)

    resolve()
    await p1
  })

  it('resetOnError=true：每次 run 前清空 error', async () => {
    const { error, success, run } = useSubmit({ resetOnError: true })

    await expect(
      run(async () => {
        throw new Error('first')
      })
    ).rejects.toThrow('first')
    expect(error.value).toBeDefined()

    await run(async () => 'ok')
    expect(error.value).toBeUndefined()
    expect(success.value).toBe(true)
  })

  it('resetOnError=false（默认）：成功后才清空 error', async () => {
    const { error, run } = useSubmit()

    await expect(
      run(async () => {
        throw new Error('keep')
      })
    ).rejects.toThrow('keep')
    expect(error.value).toBeDefined()

    // 再次 run，默认不清空 error（在 fn 执行前）
    let resolve!: (v: string) => void
    const pending = new Promise<string>(r => {
      resolve = r
    })
    const p = run(() => pending)
    // error 仍保留直到成功
    expect(error.value).toBeDefined()
    resolve('ok')
    await p
    expect(error.value).toBeUndefined()
  })

  it('成功后再次失败：success 回到 false', async () => {
    const { success, error, run } = useSubmit()

    await run(async () => 'ok')
    expect(success.value).toBe(true)

    await expect(
      run(async () => {
        throw new Error('fail')
      })
    ).rejects.toThrow('fail')
    expect(success.value).toBe(false)
    expect(error.value).toBeDefined()
  })

  it('reset 恢复初始状态', async () => {
    const { loading, error, success, run, reset } = useSubmit()

    await expect(
      run(async () => {
        throw new Error('x')
      })
    ).rejects.toThrow('x')
    expect(error.value).toBeDefined()
    expect(success.value).toBe(false)

    reset()
    expect(error.value).toBeUndefined()
    expect(success.value).toBe(false)
    expect(loading.value).toBe(false)
  })

  it('loading 是响应式的', async () => {
    const { loading, run } = useSubmit()
    const states: boolean[] = []
    const stop = watchEffect(() => states.push(loading.value))

    let resolve!: () => void
    const pending = new Promise<void>(r => {
      resolve = r
    })
    const p = run(() => pending)
    await nextTick()
    resolve()
    await p
    await nextTick()
    stop()

    expect(states).toContain(true)
    expect(states[states.length - 1]).toBe(false)
  })
})
