import { computed, nextTick, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import type {
  ProTableEditableRowKey,
  ProTableEditableRowState,
  ProTableFilters,
  ProTableInstance,
  ProTablePageInfo,
  ProTableRequestLifecycle,
  ProTableScrollTarget,
  ProTableServerState,
  ProTableSorter
} from './pro-table'

export type ProTableTemplateRef<TRecord extends object> = Readonly<
  ShallowRef<ProTableInstance<TRecord> | null>
>

/** useProTable 返回的命令方法：等待实例挂载后转发到组件内部实现。 */
type ProTableCommand<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>

export interface UseProTableReturn<TRecord extends object> {
  /** 模板 ref，绑定到 `<ProTable ref="tableRef">`。 */
  tableRef: ShallowRef<ProTableInstance<TRecord> | null>
  /** 获取组件实例（已挂载时同步返回，否则等待一个 tick 后抛错）。 */
  getTable: () => Promise<ProTableInstance<TRecord>>

  // --- 响应式状态（实例挂载前为安全默认值） ---
  /** 当前页数据。 */
  data: ComputedRef<TRecord[]>
  /** 请求加载状态。 */
  loading: ComputedRef<boolean>
  /** 数据总条数。 */
  total: ComputedRef<number>
  /** 当前分页信息，实例挂载前为 undefined。 */
  pageInfo: ComputedRef<ProTablePageInfo | undefined>
  /** 当前服务端排序状态，实例挂载前为 undefined。 */
  sorter: ComputedRef<ProTableSorter | undefined>
  /** 当前服务端筛选状态。 */
  filters: ComputedRef<ProTableFilters>
  /** 选中行 key 列表。 */
  selectedKeys: ComputedRef<Array<string | number>>
  /** 选中行数据（按 selectedKeys 顺序）。 */
  selectedRows: ComputedRef<TRecord[]>
  /** 分页 + 排序 + 筛选的完整服务端状态，实例挂载前为 undefined。 */
  serverState: ComputedRef<ProTableServerState | undefined>
  /** 请求生命周期快照，实例挂载前为 undefined。 */
  requestLifecycle: ComputedRef<ProTableRequestLifecycle | undefined>
  /** 最近一次请求错误。 */
  error: ComputedRef<unknown>

  // --- 数据命令 ---
  reload: ProTableCommand<[resetPage?: boolean], TRecord[]>
  refresh: ProTableCommand<[], TRecord[]>
  reset: ProTableCommand<[], TRecord[]>
  scrollTo: ProTableCommand<[target: ProTableScrollTarget], void>
  setPageInfo: ProTableCommand<[pageInfo: Partial<ProTablePageInfo>, reload?: boolean], TRecord[]>
  setSorter: ProTableCommand<[sorter?: ProTableSorter, reload?: boolean], TRecord[]>
  setFilters: ProTableCommand<[filters: ProTableFilters, reload?: boolean], TRecord[]>
  resetServerState: ProTableCommand<[reload?: boolean], TRecord[]>
  retryRequest: ProTableCommand<[], TRecord[]>
  cancelRequest: (reason?: unknown) => Promise<void>
  clearSelection: () => Promise<void>
  doLayout: () => Promise<void>
  doHeight: () => Promise<void>

  // --- 可编辑行命令 ---
  startEditable: ProTableCommand<[rowKey: string | number], boolean>
  cancelEditable: ProTableCommand<[rowKey: string | number], boolean>
  saveEditable: ProTableCommand<[rowKey: string | number], boolean>
  deleteEditable: ProTableCommand<[rowKey: string | number], boolean>
  clearEditRows: () => Promise<void>
  validateEditable: ProTableCommand<[rowKey?: string | number], boolean>
  saveAllEditable: ProTableCommand<[], boolean>
  cancelAllEditable: ProTableCommand<[], boolean>

  // --- 1.1.x 兼容 getter（新代码优先使用上方 ComputedRef 状态） ---
  /** @deprecated 使用 `data.value`。 */
  getData: ProTableCommand<[], TRecord[]>
  /** @deprecated 使用 `loading.value`。 */
  getLoading: ProTableCommand<[], boolean>
  /** @deprecated 使用 `pageInfo.value`。 */
  getPageInfo: ProTableCommand<[], ProTablePageInfo>
  /** @deprecated 使用 `total.value`。 */
  getTotal: ProTableCommand<[], number>
  /** @deprecated 使用 `serverState.value`。 */
  getServerState: ProTableCommand<[], ProTableServerState>
  /** @deprecated 使用 `requestLifecycle.value`。 */
  getRequestLifecycle: ProTableCommand<[], ProTableRequestLifecycle>
  /** @deprecated 使用 `error.value`。 */
  getError: ProTableCommand<[], unknown>
  /** @deprecated 使用 `selectedKeys.value`。 */
  getSelectedKeys: ProTableCommand<[], Array<string | number>>
  /** @deprecated 使用 `clearSelection()`。 */
  clearSelectedKeys: () => Promise<void>
  /** @deprecated 使用 `selectedRows.value`。 */
  getSelectedRows: ProTableCommand<[], TRecord[]>
  hasEditingRow: ProTableCommand<[], boolean>
  getEditableKeys: ProTableCommand<[], ProTableEditableRowKey[]>
  getRowEditableState: ProTableCommand<
    [rowKey: ProTableEditableRowKey],
    ProTableEditableRowState<TRecord> | undefined
  >
}

/**
 * ProTable 命令式 Hook。
 *
 * 响应式状态（data/loading/total/pageInfo/...）可直接在模板、computed 或 watch 中
 * 消费；命令方法在组件挂载后转发到内部实现，无需手动 await 状态读取。
 *
 * @example
 * ```ts
 * const tableRef = shallowRef<ProTableInstance<User> | null>(null)
 * const table = useProTable(tableRef)
 * // 模板：<ProTable ref="tableRef" :columns="columns" :request="request" />
 * watch(table.selectedKeys, keys => console.log(keys))
 * await table.reload()
 * ```
 */
export function useProTable<TRecord extends object>(
  templateRef?: ProTableTemplateRef<TRecord>
): UseProTableReturn<TRecord> {
  const tableRef = templateRef ?? shallowRef<ProTableInstance<TRecord> | null>(null)

  async function getTable(): Promise<ProTableInstance<TRecord>> {
    const current = tableRef.value
    if (current) return current
    await nextTick()
    const instance = tableRef.value
    if (!instance) throw new Error('ProTable instance is not available')
    return instance
  }

  function command<TArgs extends unknown[], TResult>(
    invoke: (instance: ProTableInstance<TRecord>, ...args: TArgs) => TResult | Promise<TResult>
  ): ProTableCommand<TArgs, TResult> {
    return async (...args: TArgs) => invoke(await getTable(), ...args)
  }

  function voidCommand<TArgs extends unknown[]>(
    invoke: (instance: ProTableInstance<TRecord>, ...args: TArgs) => void
  ): (...args: TArgs) => Promise<void> {
    return async (...args: TArgs) => {
      const instance = tableRef.value
      if (instance) {
        invoke(instance, ...args)
        return
      }
      invoke(await getTable(), ...args)
    }
  }

  return {
    tableRef,
    getTable,
    // --- 响应式状态 ---
    data: computed(() => tableRef.value?.data ?? []),
    loading: computed(() => tableRef.value?.loading ?? false),
    total: computed(() => tableRef.value?.total ?? 0),
    pageInfo: computed(() => tableRef.value?.pageInfo),
    sorter: computed(() => tableRef.value?.sorter),
    filters: computed(() => tableRef.value?.filters ?? {}),
    selectedKeys: computed(() => tableRef.value?.selectedKeys ?? []),
    selectedRows: computed(() => tableRef.value?.selectedRows ?? []),
    serverState: computed(() => tableRef.value?.serverState),
    requestLifecycle: computed(() => tableRef.value?.requestLifecycle),
    error: computed(() => tableRef.value?.error),
    // --- 数据命令 ---
    reload: command<[resetPage?: boolean], TRecord[]>((instance, resetPage = true) =>
      instance.reload(resetPage)
    ),
    refresh: command<[], TRecord[]>(instance => instance.refresh()),
    reset: command<[], TRecord[]>(instance => instance.reset()),
    scrollTo: command<[ProTableScrollTarget], void>((instance, target) =>
      instance.scrollTo(target)
    ),
    setPageInfo: command<[Partial<ProTablePageInfo>, boolean?], TRecord[]>(
      (instance, pageInfo, reload = true) => instance.setPageInfo(pageInfo, reload)
    ),
    setSorter: command<[ProTableSorter | undefined, boolean?], TRecord[]>(
      (instance, sorter, reload = true) => instance.setSorter(sorter, reload)
    ),
    setFilters: command<[ProTableFilters, boolean?], TRecord[]>(
      (instance, filters, reload = true) => instance.setFilters(filters, reload)
    ),
    resetServerState: command<[boolean?], TRecord[]>((instance, reload = true) =>
      instance.resetServerState(reload)
    ),
    retryRequest: command<[], TRecord[]>(instance => instance.retryRequest()),
    cancelRequest: voidCommand<[unknown?]>((instance, reason) => instance.cancelRequest(reason)),
    clearSelection: voidCommand<[]>(instance => instance.clearSelection()),
    doLayout: voidCommand<[]>(instance => instance.doLayout()),
    doHeight: voidCommand<[]>(instance => instance.doHeight()),
    // --- 可编辑行命令 ---
    startEditable: command<[string | number], boolean>((instance, rowKey) =>
      instance.startEditable(rowKey)
    ),
    cancelEditable: command<[string | number], boolean>((instance, rowKey) =>
      instance.cancelEditable(rowKey)
    ),
    saveEditable: command<[string | number], boolean>((instance, rowKey) =>
      instance.saveEditable(rowKey)
    ),
    deleteEditable: command<[string | number], boolean>((instance, rowKey) =>
      instance.deleteEditable(rowKey)
    ),
    clearEditRows: voidCommand<[]>(instance => instance.clearEditRows()),
    validateEditable: command<[string | number | undefined], boolean>((instance, rowKey) =>
      instance.validateEditable(rowKey)
    ),
    saveAllEditable: command<[], boolean>(instance => instance.saveAllEditable()),
    cancelAllEditable: command<[], boolean>(instance => instance.cancelAllEditable()),
    // --- 1.1.x 兼容 getter ---
    getData: command<[], TRecord[]>(instance => instance.getData()),
    getLoading: command<[], boolean>(instance => instance.getLoading()),
    getPageInfo: command<[], ProTablePageInfo>(instance => instance.getPageInfo()),
    getTotal: command<[], number>(instance => instance.getTotal()),
    getServerState: command<[], ProTableServerState>(instance => instance.getServerState()),
    getRequestLifecycle: command<[], ProTableRequestLifecycle>(instance =>
      instance.getRequestLifecycle()
    ),
    getError: command<[], unknown>(instance => instance.getError()),
    getSelectedKeys: command<[], Array<string | number>>(instance => instance.getSelectedKeys()),
    clearSelectedKeys: voidCommand<[]>(instance => instance.clearSelectedKeys()),
    getSelectedRows: command<[], TRecord[]>(instance => instance.getSelectedRows()),
    hasEditingRow: command<[], boolean>(instance => instance.hasEditingRow()),
    getEditableKeys: command<[], ProTableEditableRowKey[]>(instance => instance.getEditableKeys()),
    getRowEditableState: command<
      [rowKey: ProTableEditableRowKey],
      ProTableEditableRowState<TRecord> | undefined
    >((instance, rowKey) => instance.getRowEditableState(rowKey))
  }
}
