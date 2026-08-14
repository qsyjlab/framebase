/**
 * Concurrency lock for async actions — prevents duplicate submissions and
 * re-entrancy on the same key.
 *
 * Vue 3 reactive layer — `locks` is a `ref<ReadonlySet<string>>` so templates
 * can react to lock state changes. The lock set is keyed by a user-provided
 * string (defaults to `'default'`); concurrent actions under different keys
 * do not block each other.
 *
 * Unlike `useThrottleFn` / `useDebounceFn`, this hook blocks all re-entrancy
 * while a previous call is in flight — it does not delay or drop trailing
 * calls by time. Use it for "submit once, ignore until done" semantics.
 */
import { ref, type Ref } from 'vue'

export interface UseAsyncLockReturn {
  /** Snapshot of currently locked keys. */
  locks: Readonly<Ref<ReadonlySet<string>>>
  /** Whether the given key (defaults to `'default'`) is currently locked. */
  isLocked: (key?: string) => boolean
  /**
   * Run `fn` under the lock for `key` (defaults to `'default'`).
   *
   * - If the key is already locked, returns `undefined` and does NOT call `fn`.
   * - Otherwise calls `fn`, holds the lock until it settles, returns its result.
   *
   * Re-entrancy is silently ignored — callers can use `isLocked` to disable UI.
   */
  run: <T>(fn: () => Promise<T>, key?: string) => Promise<T | undefined>
  /**
   * Release the lock for `key` (defaults to `'default'`).
   *
   * This does NOT abort an in-flight `fn` (JavaScript has no cooperative
   * cancellation). It only allows the next `run` to proceed. To actually
   * cancel work, integrate an `AbortController` inside `fn`.
   */
  cancel: (key?: string) => void
  /** Release all locks. */
  cancelAll: () => void
}

const DEFAULT_KEY = 'default'

export function useAsyncLock(): UseAsyncLockReturn {
  const locks = ref<ReadonlySet<string>>(new Set())

  function isLocked(key: string = DEFAULT_KEY) {
    return locks.value.has(key)
  }

  async function run<T>(fn: () => Promise<T>, key: string = DEFAULT_KEY): Promise<T | undefined> {
    if (locks.value.has(key)) return undefined
    const next = new Set(locks.value)
    next.add(key)
    locks.value = next
    try {
      return await fn()
    } finally {
      const after = new Set(locks.value)
      after.delete(key)
      locks.value = after
    }
  }

  function cancel(key: string = DEFAULT_KEY) {
    if (!locks.value.has(key)) return
    const next = new Set(locks.value)
    next.delete(key)
    locks.value = next
  }

  function cancelAll() {
    if (locks.value.size === 0) return
    locks.value = new Set()
  }

  return { locks, isLocked, run, cancel, cancelAll }
}

// --- Pro-prefixed aliases (back-compat with @framebase/element-plus-pro-components) ---

export type UseProAsyncLockReturn = UseAsyncLockReturn

export { useAsyncLock as useProAsyncLock }
