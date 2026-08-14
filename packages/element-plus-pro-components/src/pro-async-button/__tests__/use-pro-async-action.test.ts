import { describe, expect, it, vi } from 'vitest'
import { useProAsyncAction } from '../use-pro-async-action'

function createState<TResult>(action: () => Promise<TResult> | TResult, preventRepeat = true) {
  return useProAsyncAction({
    action: () => action,
    preventRepeat: () => preventRepeat,
    successMessage: () => undefined,
    errorMessage: () => undefined
  })
}

describe('use-pro-async-action', () => {
  it('shares the running promise when repeat prevention is enabled', async () => {
    let resolve!: (value: number) => void
    const action = vi.fn(() => new Promise<number>(current => (resolve = current)))
    const state = createState(action)

    const first = state.execute()
    const second = state.execute()
    await Promise.resolve()
    expect(action).toHaveBeenCalledTimes(1)
    expect(state.loading.value).toBe(true)

    resolve(1)
    await expect(first).resolves.toBe(1)
    await expect(second).resolves.toBe(1)
    expect(state.loading.value).toBe(false)
  })

  it('tracks failures and allows another execution', async () => {
    const action = vi.fn().mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce('ok')
    const state = createState(action)

    await expect(state.execute()).rejects.toThrow('failed')
    expect(state.error.value).toEqual(new Error('failed'))
    await expect(state.execute()).resolves.toBe('ok')
    expect(action).toHaveBeenCalledTimes(2)
  })
})
