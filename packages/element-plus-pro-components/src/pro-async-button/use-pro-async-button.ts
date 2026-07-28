import { computed, ref, type Ref } from 'vue'
import type { ProAsyncButtonInstance } from './pro-async-button'

export type ProAsyncButtonTemplateRef<TResult = unknown> = Readonly<
  Ref<ProAsyncButtonInstance<TResult> | null | undefined>
>

export function useProAsyncButton<TResult = unknown>(
  templateRef?: ProAsyncButtonTemplateRef<TResult>
) {
  const internalRef = ref<ProAsyncButtonInstance<TResult>>()
  const instance = computed(() => templateRef?.value ?? internalRef.value)

  function getInstance() {
    const current = instance.value
    if (!current) throw new Error('ProAsyncButton instance is not available')
    return current
  }

  return {
    ref: internalRef,
    instance,
    execute: () => getInstance().execute(),
    cancel: (reason?: unknown) => getInstance().cancel(reason),
    getLoading: () => getInstance().getLoading(),
    getError: () => getInstance().getError()
  }
}
