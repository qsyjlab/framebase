import { computed, getCurrentInstance, onBeforeUnmount, shallowRef } from 'vue'
import { isProRequestAbort } from '../shared/pro-request'
import type {
  ProAsyncAction,
  ProAsyncFeedbackMessage,
  ProAsyncActionContext
} from './pro-async-button'

export interface UseProAsyncActionOptions<TResult> {
  action: () => ProAsyncAction<TResult>
  preventRepeat: () => boolean
  successMessage: () => ProAsyncFeedbackMessage<TResult> | undefined
  errorMessage: () => ProAsyncFeedbackMessage<unknown> | undefined
  onBefore?: () => void
  onSuccess?: (result: TResult) => void
  onError?: (error: unknown) => void
  onSettled?: () => void
  onFeedback?: (type: 'success' | 'error', message: string) => void
}

export function useProAsyncAction<TResult>(options: UseProAsyncActionOptions<TResult>) {
  const pendingCount = shallowRef(0)
  const error = shallowRef<unknown>()
  const loading = computed(() => pendingCount.value > 0)
  const controllers = new Set<AbortController>()
  let runningPromise: Promise<TResult> | undefined

  function execute(event?: MouseEvent, source: ProAsyncActionContext['source'] = 'api') {
    if (options.preventRepeat() && runningPromise) return runningPromise

    const controller = new AbortController()
    controllers.add(controller)
    pendingCount.value += 1
    error.value = undefined
    options.onBefore?.()

    const promise = Promise.resolve().then(() =>
      options.action()({ event, signal: controller.signal, source })
    )
    if (options.preventRepeat()) runningPromise = promise

    return promise
      .then(result => {
        options.onSuccess?.(result)
        showFeedback(options.successMessage(), result, 'success', options.onFeedback)
        return result
      })
      .catch(reason => {
        if (!isProRequestAbort(reason) && !controller.signal.aborted) {
          error.value = reason
          options.onError?.(reason)
          showFeedback(options.errorMessage(), reason, 'error', options.onFeedback)
        }
        throw reason
      })
      .finally(() => {
        controllers.delete(controller)
        pendingCount.value = Math.max(0, pendingCount.value - 1)
        if (runningPromise === promise) runningPromise = undefined
        options.onSettled?.()
      })
  }

  function cancel(reason: unknown = createAbortError()) {
    controllers.forEach(controller => controller.abort(reason))
    controllers.clear()
  }

  if (getCurrentInstance()) onBeforeUnmount(cancel)

  return { loading, error, execute, cancel }
}

function showFeedback<TValue>(
  feedback: ProAsyncFeedbackMessage<TValue> | undefined,
  value: TValue,
  type: 'success' | 'error',
  onFeedback?: (type: 'success' | 'error', message: string) => void
) {
  const message = typeof feedback === 'function' ? feedback(value) : feedback
  if (!message) return
  onFeedback?.(type, message)
}

function createAbortError() {
  return new DOMException('Action aborted', 'AbortError')
}
