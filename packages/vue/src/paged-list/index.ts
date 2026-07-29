/**
 * 分页列表请求：组合 usePagination + useRequest。
 *
 * 分页（current / pageSize）或查询参数（params）变化时自动发起请求，
 * 内部基于 useRequest 的 latest-wins 机制处理乱序响应与重复触发。
 */
import {
  computed,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type ShallowRef,
  toValue
} from 'vue'
import { normalizePagedResponse, type PagedResponse, type PageInfo } from '@framebase/core'
import { usePagination } from '../pagination'
import { useRequest, type RequestContext, type RequestPhase } from '../request'
import { useHookConfig, resolveHookOption } from '../config'

export interface PagedListRequestParams {
  current: number
  pageSize: number
}

export interface UsePagedListOptions<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>
> {
  /** 请求函数，接收分页参数与查询参数的合并值。 */
  request: (
    params: PagedListRequestParams & TParams,
    ctx: RequestContext
  ) => Promise<PagedResponse<TRecord>>
  /** 初始页码，默认 1。 */
  current?: number
  /** 初始每页条数，默认 10。 */
  pageSize?: number
  /** 查询参数（响应式），变化时回到第一页重新请求。 */
  params?: MaybeRefOrGetter<TParams>
  /** 是否在挂载时自动发起首次请求，默认 true。 */
  immediate?: boolean
  /** 请求防抖（ms）。 */
  debounce?: number
}

export interface UsePagedListReturn<
  TRecord,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TParams extends Record<string, any> = Record<string, any>
> {
  /** 当前页数据列表。 */
  list: ComputedRef<TRecord[]>
  /** 最近一次归一化后的完整响应。 */
  data: ShallowRef<PagedResponse<TRecord> | undefined>
  // --- 分页状态 ---
  current: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  pageInfo: Ref<PageInfo>
  setCurrent: (current: number) => void
  setPageSize: (pageSize: number) => void
  setPageInfo: (pageInfo: Partial<PageInfo>) => void
  reset: () => void
  // --- 请求状态 ---
  loading: ComputedRef<boolean>
  initialLoading: ComputedRef<boolean>
  error: ShallowRef<unknown>
  phase: ShallowRef<RequestPhase>
  // --- 操作 ---
  /** 重新请求当前页。 */
  reload: () => Promise<void>
  /** 回到第一页重新请求。 */
  refresh: () => Promise<void>
  /** 取消进行中的请求。 */
  cancel: () => void
}

export function usePagedList<TRecord, TParams extends Record<string, any> = Record<string, any>>(
  options: UsePagedListOptions<TRecord, TParams>
): UsePagedListReturn<TRecord, TParams> {
  const hookConfig = useHookConfig()
  const resolvedImmediate =
    resolveHookOption(options.immediate, hookConfig.value.pagedList?.immediate) ?? true
  const resolvedDebounce = resolveHookOption(options.debounce, hookConfig.value.pagedList?.debounce)

  const { request, params } = options

  const pagination = usePagination({
    current: options.current,
    pageSize: options.pageSize
  })

  const requestState = useRequest<PagedResponse<TRecord>>({ debounce: resolvedDebounce })

  async function fetch(action: 'initial' | 'reload' | 'refresh' | 'page' = 'reload') {
    const merged = {
      current: pagination.current.value,
      pageSize: pagination.pageSize.value,
      ...toValue(params)
    } as PagedListRequestParams & TParams
    const res = await requestState.execute((p, ctx) => request(p, ctx), merged, { action })
    const normalized = normalizePagedResponse(res)
    requestState.data.value = normalized
    pagination.setTotal(normalized.total)
  }

  // 分页变化自动请求
  watch([pagination.current, pagination.pageSize], () => {
    fetch('page')
  })

  // 查询参数变化：回到第一页重新请求
  if (params !== undefined) {
    watch(
      () => toValue(params),
      () => {
        if (pagination.current.value !== 1) {
          // setCurrent(1) 会触发上面的分页 watch 发起请求
          pagination.setCurrent(1)
        } else {
          fetch('refresh')
        }
      },
      { deep: true }
    )
  }

  async function reload() {
    await fetch('reload')
  }

  async function refresh() {
    if (pagination.current.value !== 1) {
      // setCurrent(1) 触发分页 watch 发起请求
      pagination.setCurrent(1)
    } else {
      await fetch('refresh')
    }
  }

  if (resolvedImmediate) {
    fetch('initial')
  }

  const list = computed(() => requestState.data.value?.data ?? [])

  return {
    list,
    data: requestState.data,
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    pageInfo: pagination.pageInfo,
    setCurrent: pagination.setCurrent,
    setPageSize: pagination.setPageSize,
    setPageInfo: pagination.setPageInfo,
    reset: pagination.reset,
    loading: requestState.loading,
    initialLoading: requestState.initialLoading,
    error: requestState.error,
    phase: requestState.phase,
    reload,
    refresh,
    cancel: requestState.cancel
  }
}

// --- Pro-prefixed alias ---
export { usePagedList as useProPagedList }
export type UseProPagedListOptions<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>
> = UsePagedListOptions<TRecord, TParams>
export type UseProPagedListReturn<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>
> = UsePagedListReturn<TRecord, TParams>
