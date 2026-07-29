/**
 * Infinite-scroll list: loads pages on demand and accumulates records.
 *
 * Unlike `usePagedList` (which replaces the visible page on every change),
 * `useInfiniteList` keeps a growing `list` of records and exposes `loadMore`
 * for bottom-of-list fetching. `reload` clears the accumulated list and
 * restarts from page 1. Built on top of `useRequest` for latest-wins semantics
 * and abort support.
 *
 * `hasMore` default strategy:
 *   1. If `total > 0` in the response: `accumulated.length < total`.
 *   2. Otherwise: last page returned fewer items than `pageSize`.
 *   3. Override with the `hasMore` option for custom shapes (e.g. cursor-based).
 */
import {
  computed,
  ref,
  shallowRef,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type ShallowRef,
  toValue
} from 'vue'
import { normalizePagedResponse, type PagedResponse } from '@framebase/core'
import { useHookConfig, resolveHookOption } from '../config'
import { useRequest, type RequestContext, type RequestPhase } from '../request'

export interface InfiniteListRequestParams {
  current: number
  pageSize: number
}

export interface UseInfiniteListOptions<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>
> {
  /** 请求函数，接收分页参数与查询参数的合并值。 */
  request: (
    params: InfiniteListRequestParams & TParams,
    ctx: RequestContext
  ) => Promise<PagedResponse<TRecord>>
  /** 每页条数，默认 10（或读全局 pagination.defaultPageSize）。 */
  pageSize?: number
  /** 查询参数（响应式），变化时回到第一页重新加载。 */
  params?: MaybeRefOrGetter<TParams>
  /** 是否在挂载时自动发起首次请求，默认 true。 */
  immediate?: boolean
  /** 自定义 hasMore 判断；默认基于 total 或本页是否满载。 */
  hasMore?: (response: PagedResponse<TRecord>, accumulated: TRecord[]) => boolean
}

export interface UseInfiniteListReturn<
  TRecord,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TParams extends Record<string, any> = Record<string, any>
> {
  /** 累积合并后的所有记录。 */
  list: ComputedRef<TRecord[]>
  /** 最近一次归一化后的单页响应。 */
  data: ShallowRef<PagedResponse<TRecord> | undefined>
  // --- 分页状态 ---
  current: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  /** 是否还有下一页。 */
  hasMore: ComputedRef<boolean>
  // --- 请求状态 ---
  loading: ComputedRef<boolean>
  initialLoading: ComputedRef<boolean>
  error: ShallowRef<unknown>
  phase: ShallowRef<RequestPhase>
  // --- 操作 ---
  /** 加载下一页。已无更多或加载中时为空操作。 */
  loadMore: () => Promise<void>
  /** 清空已加载记录，回到第 1 页重新加载。 */
  reload: () => Promise<void>
  /** 同 `reload`，语义别名。 */
  refresh: () => Promise<void>
  /** 取消进行中的请求。 */
  cancel: () => void
}

export function useInfiniteList<TRecord, TParams extends Record<string, any> = Record<string, any>>(
  options: UseInfiniteListOptions<TRecord, TParams>
): UseInfiniteListReturn<TRecord, TParams> {
  const hookConfig = useHookConfig()
  const resolvedImmediate =
    resolveHookOption(options.immediate, hookConfig.value.pagedList?.immediate) ?? true
  const resolvedPageSize =
    resolveHookOption(options.pageSize, hookConfig.value.pagination?.defaultPageSize) ?? 10

  const { request, params } = options

  const current = ref(1)
  const pageSize = ref(resolvedPageSize)
  const total = ref(0)
  const accumulated = shallowRef<TRecord[]>([])
  const lastResponse = shallowRef<PagedResponse<TRecord> | undefined>()

  const requestState = useRequest<PagedResponse<TRecord>>()

  const list = computed(() => accumulated.value)

  const hasMore = computed(() => {
    const res = lastResponse.value
    if (!res) return true
    if (options.hasMore) return options.hasMore(res, accumulated.value)
    if (total.value > 0) return accumulated.value.length < total.value
    // 兜底：本页满载则认为还有更多
    return res.data.length >= pageSize.value
  })

  async function fetchPage(page: number, mode: 'initial' | 'more' | 'reload') {
    const merged = {
      current: page,
      pageSize: pageSize.value,
      ...toValue(params)
    } as InfiniteListRequestParams & TParams
    const res = await requestState.execute((p, ctx) => request(p, ctx), merged, {
      action: mode === 'initial' ? 'initial' : mode === 'reload' ? 'reload' : 'refresh'
    })
    const normalized = normalizePagedResponse(res)
    lastResponse.value = normalized
    total.value = normalized.total
    accumulated.value =
      mode === 'more' ? [...accumulated.value, ...normalized.data] : normalized.data
    current.value = page
  }

  async function loadMore() {
    if (requestState.loading.value) return
    if (!hasMore.value) return
    await fetchPage(current.value + 1, 'more')
  }

  async function reload() {
    await fetchPage(1, 'reload')
  }

  async function refresh() {
    await fetchPage(1, 'reload')
  }

  // 查询参数变化：回到第一页重新加载
  if (params !== undefined) {
    watch(
      () => toValue(params),
      () => {
        reload()
      },
      { deep: true }
    )
  }

  if (resolvedImmediate) {
    fetchPage(1, 'initial')
  }

  return {
    list,
    data: lastResponse,
    current,
    pageSize,
    total,
    hasMore,
    loading: requestState.loading,
    initialLoading: requestState.initialLoading,
    error: requestState.error,
    phase: requestState.phase,
    loadMore,
    reload,
    refresh,
    cancel: requestState.cancel
  }
}

// --- Pro-prefixed aliases ---

export { useInfiniteList as useProInfiniteList }
export type UseProInfiniteListOptions<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>
> = UseInfiniteListOptions<TRecord, TParams>
export type UseProInfiniteListReturn<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>
> = UseInfiniteListReturn<TRecord, TParams>
