/**
 * Pagination state container.
 *
 * Vue 3 reactive layer — holds `current` / `pageSize` / `total` as `ref`s and
 * emits change callbacks. The shared `PageInfo` type comes from `@framebase/core`
 * so non-vue consumers can still describe pagination state.
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { PageInfo } from '@framebase/core'
import { useHookConfig, resolveHookOption } from '../config'

export type { PageInfo }

export interface PaginationOptions {
  current?: number
  pageSize?: number
  total?: number
}

export interface PaginationChangeContext {
  pageInfo: PageInfo
  /** Previous page info before the change. */
  previous: PageInfo
  /** Why the change happened — useful for downstream request action selection. */
  reason: 'init' | 'current' | 'size' | 'reset' | 'external'
}

export interface UsePaginationReturn {
  current: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  pageInfo: Ref<PageInfo>
  /** `true` when `total` is known and current page is beyond the last page. */
  isLastPage: Ref<boolean>
  setCurrent: (current: number, reason?: PaginationChangeContext['reason']) => void
  setPageSize: (pageSize: number, reason?: PaginationChangeContext['reason']) => void
  setTotal: (total: number) => void
  setPageInfo: (pageInfo: Partial<PageInfo>, reason?: PaginationChangeContext['reason']) => void
  reset: (reason?: PaginationChangeContext['reason']) => void
  /** Subscribe to page changes. Returns an unsubscribe function. */
  onChange: (listener: (ctx: PaginationChangeContext) => void) => () => void
}

export function usePagination(options: PaginationOptions = {}): UsePaginationReturn {
  const hookConfig = useHookConfig()
  const initialCurrent =
    resolveHookOption(options.current, hookConfig.value.pagination?.defaultCurrent) ?? 1
  const initialPageSize =
    resolveHookOption(options.pageSize, hookConfig.value.pagination?.defaultPageSize) ?? 10
  const current = ref(initialCurrent)
  const pageSize = ref(initialPageSize)
  const total = ref(options.total ?? 0)
  const listeners = new Set<(ctx: PaginationChangeContext) => void>()

  const pageInfo = computedPageInfo(current, pageSize)
  const isLastPage = computedIsLastPage(current, pageSize, total)

  function emit(reason: PaginationChangeContext['reason'], previous: PageInfo) {
    const ctx: PaginationChangeContext = { pageInfo: { ...pageInfo.value }, previous, reason }
    listeners.forEach(listener => listener(ctx))
  }

  function setCurrent(next: number, reason: PaginationChangeContext['reason'] = 'current') {
    const previous = { ...pageInfo.value }
    current.value = Math.max(1, next)
    emit(reason, previous)
  }

  function setPageSize(next: number, reason: PaginationChangeContext['reason'] = 'size') {
    const previous = { ...pageInfo.value }
    pageSize.value = Math.max(1, next)
    emit(reason, previous)
  }

  function setTotal(next: number) {
    total.value = Math.max(0, next)
  }

  function setPageInfo(
    next: Partial<PageInfo>,
    reason: PaginationChangeContext['reason'] = 'external'
  ) {
    const previous = { ...pageInfo.value }
    if (next.current !== undefined) current.value = Math.max(1, next.current)
    if (next.pageSize !== undefined) pageSize.value = Math.max(1, next.pageSize)
    emit(reason, previous)
  }

  function reset(reason: PaginationChangeContext['reason'] = 'reset') {
    const previous = { ...pageInfo.value }
    current.value = initialCurrent
    pageSize.value = initialPageSize
    emit(reason, previous)
  }

  function onChange(listener: (ctx: PaginationChangeContext) => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return {
    current,
    pageSize,
    total,
    pageInfo,
    isLastPage,
    setCurrent,
    setPageSize,
    setTotal,
    setPageInfo,
    reset,
    onChange
  }
}

// --- Pro-prefixed aliases (back-compat with @framebase/element-plus-pro-components) ---

export type ProPaginationOptions = PaginationOptions
export type ProPaginationChangeContext = PaginationChangeContext
export type UseProPaginationReturn = UsePaginationReturn

export { usePagination as useProPagination }

// --- local helpers (kept private to avoid leaking computed import surface) ---

function computedPageInfo(current: Ref<number>, pageSize: Ref<number>): ComputedRef<PageInfo> {
  return computed(() => ({ current: current.value, pageSize: pageSize.value }))
}

function computedIsLastPage(
  current: Ref<number>,
  pageSize: Ref<number>,
  total: Ref<number>
): ComputedRef<boolean> {
  return computed(() => {
    if (!total.value) return true
    const lastPage = Math.max(1, Math.ceil(total.value / pageSize.value))
    return current.value >= lastPage
  })
}
