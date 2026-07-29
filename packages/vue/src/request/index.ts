/**
 * Abortable async state with debounce, retry and latest-request-wins semantics.
 *
 * Vue 3 reactive layer — uses `shallowRef` / `computed` from `vue`. The pure
 * request state machine could be re-implemented for other frameworks without
 * depending on this module.
 */
import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import { useHookConfig, resolveHookOption } from '../config'

export type RequestPhase = 'idle' | 'pending' | 'success' | 'error'
export type RequestAction = 'initial' | 'reload' | 'refresh' | 'page' | 'retry' | 'submit'

export interface RequestContext {
  signal: AbortSignal
  attempt: number
}

export interface RequestExecuteOptions {
  action?: RequestAction
  debounce?: number
  retry?: number
  retryDelay?: number | ((attempt: number, error: unknown) => number)
}

export interface RequestOptions {
  debounce?: number
  retry?: number
  retryDelay?: RequestExecuteOptions['retryDelay']
}

export interface RequestLifecycle {
  phase: RequestPhase
  action?: RequestAction
  loading: boolean
  initialLoading: boolean
  refreshing: boolean
}

export interface RequestControl<TResult> {
  getRequestLifecycle: () => RequestLifecycle
  getError: () => unknown
  retryRequest: () => Promise<TResult>
  cancelRequest: (reason?: unknown) => void
}

export interface RequestState<TData> {
  data: ShallowRef<TData | undefined>
  error: ShallowRef<unknown>
  loading: ComputedRef<boolean>
  initialLoading: ComputedRef<boolean>
  refreshing: ComputedRef<boolean>
  phase: ShallowRef<RequestPhase>
  action: ShallowRef<RequestAction | undefined>
  cancel: (reason?: unknown) => void
  retry: () => Promise<TData | undefined>
  execute: <TParams>(
    request: (params: TParams, context: RequestContext) => Promise<TData>,
    params: TParams,
    options?: RequestExecuteOptions
  ) => Promise<TData>
}

/** Shared abortable request state with debounce, retry and latest-request-wins semantics. */
export function useRequest<TData>(defaults: RequestOptions = {}): RequestState<TData> {
  const hookConfig = useHookConfig()
  const resolvedDefaults: RequestOptions = {
    debounce: resolveHookOption(defaults.debounce, hookConfig.value.request?.debounce),
    retry: resolveHookOption(defaults.retry, hookConfig.value.request?.retry),
    retryDelay: resolveHookOption(defaults.retryDelay, hookConfig.value.request?.retryDelay)
  }
  const data = shallowRef<TData>()
  const error = shallowRef<unknown>()
  const phase = shallowRef<RequestPhase>('idle')
  const action = shallowRef<RequestAction>()
  const loading = computed(() => phase.value === 'pending')
  const initialLoading = computed(() => loading.value && action.value === 'initial')
  const refreshing = computed(
    () => loading.value && action.value !== undefined && action.value !== 'initial'
  )
  let requestSequence = 0
  let controller: AbortController | undefined
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let rejectDebounce: ((reason: unknown) => void) | undefined
  let lastRequest: (() => Promise<TData>) | undefined

  function cancel(reason: unknown = createAbortError()) {
    requestSequence += 1
    controller?.abort(reason)
    controller = undefined
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = undefined
    rejectDebounce?.(reason)
    rejectDebounce = undefined
    error.value = undefined
    phase.value = 'idle'
    action.value = undefined
  }

  async function execute<TParams>(
    request: (params: TParams, context: RequestContext) => Promise<TData>,
    params: TParams,
    options: RequestExecuteOptions = {}
  ): Promise<TData> {
    const resolvedOptions = { ...resolvedDefaults, ...options }
    const currentAction =
      resolvedOptions.action ?? (data.value === undefined ? 'initial' : 'refresh')
    const run = () => execute(request, params, { ...resolvedOptions, action: 'retry', debounce: 0 })
    lastRequest = run

    controller?.abort(createAbortError('Request superseded'))
    if (debounceTimer) clearTimeout(debounceTimer)
    rejectDebounce?.(createAbortError('Request superseded'))
    debounceTimer = undefined
    rejectDebounce = undefined

    const currentSequence = ++requestSequence
    controller = new AbortController()
    const currentController = controller
    phase.value = 'pending'
    action.value = currentAction
    error.value = undefined

    try {
      const debounce = Math.max(0, resolvedOptions.debounce ?? 0)
      if (debounce) await waitForDebounce(debounce, currentController.signal)

      const retryCount = Math.max(0, resolvedOptions.retry ?? 0)
      let attempt = 0
      while (true) {
        try {
          const result = await request(params, {
            signal: currentController.signal,
            attempt
          })
          if (currentSequence === requestSequence) {
            data.value = result
            phase.value = 'success'
          }
          return result
        } catch (reason) {
          if (currentController.signal.aborted || isRequestAbort(reason) || attempt >= retryCount) {
            throw reason
          }
          attempt += 1
          const delay = resolveRetryDelay(resolvedOptions.retryDelay, attempt, reason)
          if (delay > 0) await wait(delay, currentController.signal)
        }
      }
    } catch (reason) {
      if (currentSequence === requestSequence) {
        if (isRequestAbort(reason) || currentController.signal.aborted) {
          phase.value = 'idle'
          action.value = undefined
        } else {
          error.value = reason
          phase.value = 'error'
        }
      }
      throw reason
    } finally {
      if (currentSequence === requestSequence) controller = undefined
    }
  }

  function waitForDebounce(delay: number, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
      rejectDebounce = reject
      debounceTimer = setTimeout(() => {
        debounceTimer = undefined
        rejectDebounce = undefined
        if (signal.aborted) reject(signal.reason ?? createAbortError())
        else resolve()
      }, delay)
    })
  }

  return {
    data,
    error,
    loading,
    initialLoading,
    refreshing,
    phase,
    action,
    cancel,
    retry: async () => lastRequest?.(),
    execute
  }
}

function resolveRetryDelay(
  retryDelay: RequestExecuteOptions['retryDelay'],
  attempt: number,
  error: unknown
) {
  if (typeof retryDelay === 'function') return Math.max(0, retryDelay(attempt, error))
  return Math.max(0, retryDelay ?? 0)
}

function wait(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delay)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason ?? createAbortError())
      },
      { once: true }
    )
  })
}

function createAbortError(message = 'Request aborted') {
  return new DOMException(message, 'AbortError')
}

export function isRequestAbort(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (!error || typeof error !== 'object') return false

  const value = error as { code?: string; name?: string }
  return value.name === 'CanceledError' || value.code === 'ERR_CANCELED'
}

// --- Pro-prefixed aliases (back-compat with @framebase/element-plus-pro-components) ---

export type ProRequestPhase = RequestPhase
export type ProRequestAction = RequestAction
export type ProRequestContext = RequestContext
export type ProRequestExecuteOptions = RequestExecuteOptions
export type ProRequestOptions = RequestOptions
export type ProRequestLifecycle = RequestLifecycle
export type ProRequestControl<TResult> = RequestControl<TResult>
export type ProRequestState<TData> = RequestState<TData>

export { useRequest as useProRequest, isRequestAbort as isProRequestAbort }
