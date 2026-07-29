/**
 * CRUD aggregation: layers create / update / remove on top of `usePagedList`.
 *
 * Each mutation runs in its own `useRequest` (independent loading / error) and
 * is guarded against re-entrancy — a second call while one is in flight is
 * silently ignored (returns `undefined`). On success, the list is reloaded
 * automatically unless `autoRefresh: false`.
 *
 * Unlike `usePagedList` which only reads, this hook is for screens that edit
 * the same dataset they list (e.g. a table with row create / edit / delete).
 * `vueuse` does not provide this — it is a business-orchestration primitive.
 */
import { computed, type ComputedRef } from 'vue'
import { usePagedList, type UsePagedListOptions, type UsePagedListReturn } from '../paged-list'
import { useRequest, type RequestContext } from '../request'

export interface UseCrudOptions<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>,
  TCreatePayload = any,
  TUpdatePayload = any
> {
  /** 列表请求配置（与 usePagedList 一致）。 */
  list: UsePagedListOptions<TRecord, TParams>
  /** 创建记录。 */
  create?: (payload: TCreatePayload, ctx: RequestContext) => Promise<TRecord | void>
  /** 更新记录。 */
  update?: (
    record: TRecord,
    payload: TUpdatePayload,
    ctx: RequestContext
  ) => Promise<TRecord | void>
  /** 删除记录。 */
  remove?: (record: TRecord, ctx: RequestContext) => Promise<void>
  /** 写操作成功后是否自动刷新列表，默认 true。 */
  autoRefresh?: boolean
}

export interface UseCrudReturn<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>,
  TCreatePayload = any,
  TUpdatePayload = any
> extends UsePagedListReturn<TRecord, TParams> {
  /**
   * 创建记录。
   * 写操作进行中时再次调用返回 `undefined`（被忽略）。
   * 未配置 `create` 时抛错。
   */
  create: (payload: TCreatePayload) => Promise<TRecord | void | undefined>
  /** 更新记录。同 `create` 的忽略与抛错规则。 */
  update: (record: TRecord, payload: TUpdatePayload) => Promise<TRecord | void | undefined>
  /** 删除记录。同 `create` 的忽略与抛错规则。 */
  remove: (record: TRecord) => Promise<void | undefined>
  /** 任一写操作进行中。 */
  submitting: ComputedRef<boolean>
  /** 创建中。 */
  creating: ComputedRef<boolean>
  /** 更新中。 */
  updating: ComputedRef<boolean>
  /** 删除中。 */
  removing: ComputedRef<boolean>
}

export function useCrud<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>,
  TCreatePayload = any,
  TUpdatePayload = any
>(
  options: UseCrudOptions<TRecord, TParams, TCreatePayload, TUpdatePayload>
): UseCrudReturn<TRecord, TParams, TCreatePayload, TUpdatePayload> {
  const {
    list: listOptions,
    create: createFn,
    update: updateFn,
    remove: removeFn,
    autoRefresh = true
  } = options

  const pagedList = usePagedList<TRecord, TParams>(listOptions)

  const createRequest = useRequest<TRecord | void>()
  const updateRequest = useRequest<TRecord | void>()
  const removeRequest = useRequest<void>()

  const submitting = computed(
    () => createRequest.loading.value || updateRequest.loading.value || removeRequest.loading.value
  )

  async function create(payload: TCreatePayload): Promise<TRecord | void | undefined> {
    if (!createFn) throw new Error('useCrud: 未配置 create')
    if (createRequest.loading.value) return undefined
    const result = await createRequest.execute((p, ctx) => createFn(p, ctx), payload, {
      action: 'submit'
    })
    if (autoRefresh) await pagedList.reload()
    return result
  }

  async function update(
    record: TRecord,
    payload: TUpdatePayload
  ): Promise<TRecord | void | undefined> {
    if (!updateFn) throw new Error('useCrud: 未配置 update')
    if (updateRequest.loading.value) return undefined
    const result = await updateRequest.execute(
      async (_payload, ctx) => updateFn(record, _payload, ctx),
      payload,
      { action: 'submit' }
    )
    if (autoRefresh) await pagedList.reload()
    return result
  }

  async function remove(record: TRecord): Promise<void | undefined> {
    if (!removeFn) throw new Error('useCrud: 未配置 remove')
    if (removeRequest.loading.value) return undefined
    await removeRequest.execute(
      async (_payload, ctx) => {
        await removeFn(record, ctx)
        return undefined
      },
      undefined,
      { action: 'submit' }
    )
    if (autoRefresh) await pagedList.reload()
  }

  return {
    ...pagedList,
    create,
    update,
    remove,
    submitting,
    creating: createRequest.loading,
    updating: updateRequest.loading,
    removing: removeRequest.loading
  }
}

// --- Pro-prefixed aliases ---

export { useCrud as useProCrud }
export type UseProCrudOptions<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>,
  TCreatePayload = any,
  TUpdatePayload = any
> = UseCrudOptions<TRecord, TParams, TCreatePayload, TUpdatePayload>
export type UseProCrudReturn<
  TRecord,
  TParams extends Record<string, any> = Record<string, any>,
  TCreatePayload = any,
  TUpdatePayload = any
> = UseCrudReturn<TRecord, TParams, TCreatePayload, TUpdatePayload>
