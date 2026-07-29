/**
 * Submit-state wrapper: loading / error / success with re-entrancy guard.
 *
 * Thin layer over `useAsyncLock` focused on the "submit once, ignore until
 * done" form-submit pattern. Unlike `useRequest` (which is a general async
 * state container with debounce / retry / abort), `useSubmit` is intentionally
 * minimal: it tracks the outcome of a single submit action and exposes
 * `success` so templates can show transient success feedback.
 *
 * `vueuse` has no equivalent — `useAsyncLock` covers the lock but not the
 * submit lifecycle (loading / error / success).
 */
import { ref, computed, type ComputedRef, type Ref } from 'vue'
import { useAsyncLock } from '../async-lock'

export interface UseSubmitOptions {
  /** Reset `success`/`error` before each run. Defaults to `false`. */
  resetOnError?: boolean
}

export interface UseSubmitReturn<T = unknown> {
  /** Whether a submit is in flight. */
  loading: ComputedRef<boolean>
  /** Error from the most recent failed submit. */
  error: Ref<unknown>
  /** Whether the most recent submit succeeded. */
  success: Ref<boolean>
  /**
   * Run `fn`. Re-entrancy is silently ignored (returns `undefined`).
   * On success sets `success=true` and clears `error`; on failure sets `error`
   * and clears `success`. Resolves with `fn`'s result or `undefined` (ignored).
   */
  run: (fn: () => Promise<T>) => Promise<T | undefined>
  /** Reset loading / error / success to initial. Does not abort in-flight fn. */
  reset: () => void
}

export function useSubmit<T = unknown>(options: UseSubmitOptions = {}): UseSubmitReturn<T> {
  const { resetOnError = false } = options
  const lock = useAsyncLock()
  const loading = computed(() => lock.isLocked())
  const error = ref<unknown>(undefined)
  const success = ref(false)

  async function run(fn: () => Promise<T>): Promise<T | undefined> {
    if (resetOnError) error.value = undefined
    success.value = false

    const result = await lock.run(async () => {
      try {
        const value = await fn()
        error.value = undefined
        success.value = true
        return value
      } catch (e) {
        error.value = e
        success.value = false
        throw e
      }
    })
    return result
  }

  function reset(): void {
    error.value = undefined
    success.value = false
  }

  return { loading, error, success, run, reset }
}

// --- Pro-prefixed aliases ---

export type UseProSubmitOptions = UseSubmitOptions
export type UseProSubmitReturn<T = unknown> = UseSubmitReturn<T>
export { useSubmit as useProSubmit }
