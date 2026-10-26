import {
  computed,
  h,
  reactive,
  ref,
  shallowRef,
  type ComputedRef,
  type Ref,
  type ShallowRef,
  type VNodeChild
} from 'vue'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { cloneDeep, isEqual } from 'lodash-es'
import type {
  ProTableColumn,
  ProTableColumns,
  ProTableInstance,
  ProTableProps,
  ProTableRequestParams,
  ProTableRequestResult,
  ProTableRowKey
} from './pro-table'
import { useProTable, type UseProTableReturn } from './use-pro-table'

export type CrudTableKey = string | number

/** 写操作成功后的列表刷新策略。 */
export type CrudTableRefreshStrategy = 'reload' | 'refresh' | 'none'

export interface CrudTableMessages {
  /** 新增成功提示，`false` 关闭 */
  create?: string | false
  /** 更新成功提示，`false` 关闭 */
  update?: string | false
  /** 删除成功提示，`false` 关闭 */
  remove?: string | false
  /** 批量删除成功提示，`false` 关闭 */
  removeMany?: string | false
}

export interface CrudTableConfirmOptions<TRecord extends object> {
  /** 删除单行二次确认：`false` 关闭，传函数自定义文案 */
  remove?: boolean | ((row: TRecord) => string)
  /** 批量删除二次确认：`false` 关闭，传函数自定义文案 */
  removeMany?: boolean | ((rows: TRecord[]) => string)
}

export interface CrudTableActionColumnOptions<TRecord extends object> {
  key?: string
  title?: string
  width?: number | string
  fixed?: 'left' | 'right' | boolean
  editText?: string
  removeText?: string
  /** 返回 false 时该行不显示编辑按钮 */
  showEdit?: (row: TRecord) => boolean
  /** 返回 false 时该行不显示删除按钮 */
  showRemove?: (row: TRecord) => boolean
  /** 追加自定义按钮 */
  extra?: (row: TRecord) => VNodeChild
}

/** 列工厂拿到的上下文：复用操作列与内置动作，避免每页重写按钮渲染。 */
export interface CrudTableHelpers<TRecord extends object> {
  table: UseProTableReturn<TRecord>
  openEdit: (row: TRecord) => void
  remove: (row: TRecord) => Promise<void>
  actionColumn: (options?: CrudTableActionColumnOptions<TRecord>) => ProTableColumn<TRecord>
}

/** `open` 的参数约定，与 `ProModalForm` / `ProDrawerForm` 的 expose 保持一致。 */
export interface CrudTableFormOpenOptions<TFormModel extends object> {
  id?: CrudTableKey
  values?: Partial<TFormModel>
  title?: string
}

/** 只需要暴露 `open` 即可接入，不绑定具体表单容器组件。 */
export interface CrudTableFormController<TFormModel extends object> {
  open: (options?: CrudTableFormOpenOptions<TFormModel>) => unknown
}

export interface CrudTableFormOptions<TRecord extends object, TFormModel extends object> {
  /** 表单容器的模板 ref（`ProModalForm` / `ProDrawerForm` / 自定义组件均可） */
  ref: ShallowRef<CrudTableFormController<TFormModel> | null>
  titles?: { create?: string; edit?: string }
  /** 行数据 → 表单初值；默认整行透传 */
  toFormValues?: (row: TRecord) => Partial<TFormModel>
}

export interface CrudTableOptions<
  TRecord extends object,
  TQuery extends object = Record<string, unknown>,
  TFormModel extends object = TRecord
> {
  /** 列定义，或接收 helpers 的工厂（推荐：可直接使用 `actionColumn`） */
  columns:
    ProTableColumns<TRecord> | ((helpers: CrudTableHelpers<TRecord>) => ProTableColumns<TRecord>)
  /** 列表请求，入参已带分页 / 排序 / 筛选 */
  request: (params: ProTableRequestParams<TQuery>) => Promise<ProTableRequestResult<TRecord>>
  /** 初始查询条件 */
  defaultParams?: TQuery
  /** 行主键，默认 `'id'` */
  rowKey?: ProTableRowKey<TRecord>
  /** 新增 */
  create?: (values: TFormModel) => Promise<unknown>
  /** 更新 */
  update?: (row: TRecord, values: TFormModel) => Promise<unknown>
  /** 删除单行 */
  remove?: (row: TRecord) => Promise<unknown>
  /** 批量删除；`rows` 为选中行，`keys` 为主键列表 */
  removeMany?: (rows: TRecord[], keys: CrudTableKey[]) => Promise<unknown>
  /** 二次确认配置，默认全部开启 */
  confirm?: CrudTableConfirmOptions<TRecord>
  /** 成功提示文案 */
  messages?: CrudTableMessages
  /** 刷新策略，默认 create: reload、update/remove/removeMany: refresh */
  refreshOn?: Partial<
    Record<'create' | 'update' | 'remove' | 'removeMany', CrudTableRefreshStrategy>
  >
  /** 接入 `ProModalForm`，获得 `openCreate` / `openEdit` */
  form?: CrudTableFormOptions<TRecord, TFormModel>
  /** 其余 ProTable props 透传 */
  tableProps?: Omit<
    Partial<ProTableProps<TRecord, TQuery>>,
    'columns' | 'params' | 'request' | 'rowKey' | 'selectedKeys'
  >
}

export interface CrudTableProps<TRecord extends object, TQuery extends object> extends Omit<
  ProTableProps<TRecord, TQuery>,
  'columns' | 'params' | 'request' | 'rowKey' | 'selectedKeys'
> {
  columns: ProTableColumns<TRecord>
  params: TQuery
  request: ProTableProps<TRecord, TQuery>['request']
  rowKey: ProTableRowKey<TRecord>
  selectedKeys: CrudTableKey[]
  'onUpdate:selectedKeys': (keys: CrudTableKey[]) => void
}

export interface CrudTableReturn<
  TRecord extends object,
  TQuery extends object = Record<string, unknown>,
  TFormModel extends object = TRecord
> {
  /** 底层表格实例，`useProTable` 的全部能力 */
  table: UseProTableReturn<TRecord>
  tableRef: ShallowRef<ProTableInstance<TRecord> | null>
  /** 直接 `v-bind` 到 `<ProTable>`：columns / params / request / rowKey / 选中双向绑定 */
  tableProps: ComputedRef<CrudTableProps<TRecord, TQuery>>
  // --- 查询条件 ---
  params: TQuery
  isDirtyParams: ComputedRef<boolean>
  setParams: (patch: Partial<TQuery>) => void
  resetParams: () => boolean
  // --- 选中 ---
  selectedKeys: Ref<CrudTableKey[]>
  selectedRows: ComputedRef<TRecord[]>
  // --- 动作 ---
  create: (values: TFormModel) => Promise<void>
  update: (row: TRecord, values: TFormModel) => Promise<void>
  remove: (row: TRecord) => Promise<void>
  removeMany: (rows?: TRecord[]) => Promise<void>
  openCreate: () => void
  openEdit: (row: TRecord) => void
  /** 当前正在编辑的行；`openCreate` 后为 null */
  editingRow: Ref<TRecord | null>
  /** 表单提交入口：有 `editingRow` 走 update，否则走 create */
  submitForm: (values: TFormModel) => Promise<void>
  // --- 状态 ---
  submitting: ComputedRef<boolean>
  creating: Ref<boolean>
  updating: Ref<boolean>
  removing: Ref<boolean>
}

/**
 * 表格 CRUD 业务编排 hook。
 *
 * 把「查询条件、选中、列定义、增删改查动作」收拢到一处，泛型沿
 * `TRecord → columns / actions`、`TQuery → params`、`TFormModel → 表单` 贯通：
 *
 * ```ts
 * const crud = useCrudTable<UserRecord, UserQuery, UserFormModel>({
 *   request: fetchUsers,
 *   defaultParams: { keyword: '' },
 *   create: createUser,
 *   update: (row, values) => updateUser(row.id, values),
 *   remove: row => deleteUser(row.id),
 *   removeMany: (_, ids) => deleteUsers(ids as number[]),
 *   columns: ({ actionColumn }) => [...baseColumns, actionColumn()],
 *   form: { ref: formRef, titles: { create: '新增用户', edit: '编辑用户' } }
 * })
 * ```
 *
 * 模板只需 `<ProTable ref="tableRef" v-bind="crud.tableProps" />`。
 * 内置：二次确认、成功提示、并发保护（进行中重复调用直接忽略）、
 * 删除末行自动回上一页、批量删除后清空选中。
 */
export function useCrudTable<
  TRecord extends object,
  TQuery extends object = Record<string, unknown>,
  TFormModel extends object = TRecord
>(
  options: CrudTableOptions<TRecord, TQuery, TFormModel>
): CrudTableReturn<TRecord, TQuery, TFormModel> {
  const tableRef = shallowRef<ProTableInstance<TRecord> | null>(null)
  const table = useProTable(tableRef)

  const initialParams = cloneDeep(options.defaultParams ?? ({} as TQuery)) as TQuery
  const params = reactive(cloneDeep(initialParams)) as TQuery
  const isDirtyParams = computed(() => !isEqual(params, initialParams))

  function setParams(patch: Partial<TQuery>) {
    Object.entries(patch).forEach(([key, value]) => {
      const current = (params as Record<string, unknown>)[key]
      // 同值不写：避免触发 ProTable 对 params 的 deep watch 发起多余请求
      if (isEqual(current, value)) return
      ;(params as Record<string, unknown>)[key] = value
    })
  }

  function resetParams() {
    if (!isDirtyParams.value) return false
    Object.keys(params as Record<string, unknown>).forEach(key => {
      delete (params as Record<string, unknown>)[key]
    })
    Object.assign(params as Record<string, unknown>, cloneDeep(initialParams))
    return true
  }

  const selectedKeys = ref<CrudTableKey[]>([])
  const selectedRows = computed(() => table.selectedRows.value)

  const creating = ref(false)
  const updating = ref(false)
  const removing = ref(false)
  const submitting = computed(() => creating.value || updating.value || removing.value)

  const confirmConfig = options.confirm ?? {}
  const messages = options.messages ?? {}
  const formOptions = options.form

  function resolveKey(row: TRecord): CrudTableKey | undefined {
    const rowKey = options.rowKey ?? 'id'
    if (typeof rowKey === 'function') return rowKey(row)
    const value = (row as Record<string, unknown>)[rowKey]
    return typeof value === 'string' || typeof value === 'number' ? value : undefined
  }

  async function confirmAction(
    config: boolean | ((...args: any[]) => string) | undefined,
    args: unknown[],
    fallback: string
  ) {
    if (config === false) return true
    const message = typeof config === 'function' ? config(...args) : fallback
    try {
      await ElMessageBox.confirm(message, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      return true
    } catch {
      return false
    }
  }

  function notify(text: string | false | undefined, fallback: string) {
    if (text === false) return
    ElMessage.success(text ?? fallback)
  }

  async function refreshBy(strategy: CrudTableRefreshStrategy) {
    if (strategy === 'reload') await table.reload()
    else if (strategy === 'refresh') await table.refresh()
  }

  /** 删除后刷新：当前页被删空时回到上一页，避免停在空列表。 */
  async function refreshAfterRemove(removedCount: number, strategy: CrudTableRefreshStrategy) {
    if (strategy === 'none') return
    const current = table.pageInfo.value?.current ?? 1
    const remaining = table.data.value.length - removedCount
    if (remaining <= 0 && current > 1) {
      await table.setPageInfo({ current: current - 1 })
      return
    }
    await refreshBy(strategy)
  }

  async function create(values: TFormModel) {
    if (!options.create || creating.value) return
    creating.value = true
    try {
      await options.create(values)
      notify(messages.create, '新增成功')
      await refreshBy(options.refreshOn?.create ?? 'reload')
    } finally {
      creating.value = false
    }
  }

  async function update(row: TRecord, values: TFormModel) {
    if (!options.update || updating.value) return
    updating.value = true
    try {
      await options.update(row, values)
      notify(messages.update, '更新成功')
      await refreshBy(options.refreshOn?.update ?? 'refresh')
    } finally {
      updating.value = false
    }
  }

  async function remove(row: TRecord) {
    if (!options.remove || removing.value) return
    if (!(await confirmAction(confirmConfig.remove, [row], '确定删除该记录？'))) return
    removing.value = true
    try {
      await options.remove(row)
      notify(messages.remove, '删除成功')
      await refreshAfterRemove(1, options.refreshOn?.remove ?? 'refresh')
    } finally {
      removing.value = false
    }
  }

  async function removeMany(rows?: TRecord[]) {
    if (!options.removeMany || removing.value) return
    const targets = rows ?? table.selectedRows.value
    if (!targets.length) return
    const keys = targets.map(resolveKey).filter((key): key is CrudTableKey => key !== undefined)
    if (
      !(await confirmAction(
        confirmConfig.removeMany,
        [targets],
        `确定删除选中的 ${targets.length} 项？`
      ))
    ) {
      return
    }
    removing.value = true
    try {
      await options.removeMany(targets, keys)
      notify(messages.removeMany, `已删除 ${targets.length} 项`)
      selectedKeys.value = []
      // 兜底：未使用 tableProps 绑定 selectedKeys 时也要清掉内部选中
      await table.clearSelection()
      await refreshAfterRemove(targets.length, options.refreshOn?.removeMany ?? 'refresh')
    } finally {
      removing.value = false
    }
  }

  const editingRow = ref<TRecord | null>(null) as Ref<TRecord | null>

  function openCreate() {
    if (!formOptions) return
    editingRow.value = null
    void formOptions.ref.value?.open({ title: formOptions.titles?.create ?? '新增' })
  }

  function openEdit(row: TRecord) {
    if (!formOptions) return
    editingRow.value = row
    const values = formOptions.toFormValues
      ? formOptions.toFormValues(row)
      : (row as Partial<TFormModel>)
    void formOptions.ref.value?.open({
      id: resolveKey(row),
      values,
      title: formOptions.titles?.edit ?? '编辑'
    })
  }

  /** 表单提交：有编辑行走 update，否则走 create；两种情况都会在结束后清空编辑态。 */
  async function submitForm(values: TFormModel) {
    const target = editingRow.value
    try {
      if (target) await update(target, values)
      else await create(values)
    } finally {
      editingRow.value = null
    }
  }

  function actionColumn(
    columnOptions: CrudTableActionColumnOptions<TRecord> = {}
  ): ProTableColumn<TRecord> {
    const {
      key = 'actions',
      title = '操作',
      width = 140,
      fixed = 'right',
      editText = '编辑',
      removeText = '删除',
      showEdit,
      showRemove,
      extra
    } = columnOptions
    return {
      key,
      title,
      width,
      fixed,
      render: ({ row }) => {
        const nodes: VNodeChild[] = []
        if (options.update && showEdit?.(row) !== false) {
          nodes.push(
            h(
              ElButton,
              { link: true, type: 'primary', onClick: () => openEdit(row) },
              () => editText
            )
          )
        }
        if (options.remove && showRemove?.(row) !== false) {
          nodes.push(
            h(
              ElButton,
              { link: true, type: 'danger', onClick: () => void remove(row) },
              () => removeText
            )
          )
        }
        const extraNode = extra?.(row)
        if (extraNode !== undefined) nodes.push(extraNode)
        return nodes
      }
    }
  }

  const columns = computed<ProTableColumns<TRecord>>(() => {
    const source = options.columns
    return typeof source === 'function' ? source({ table, openEdit, remove, actionColumn }) : source
  })

  const tableProps = computed<CrudTableProps<TRecord, TQuery>>(
    () =>
      ({
        request: options.request,
        rowKey: options.rowKey ?? 'id',
        rowSelection: true,
        ...options.tableProps,
        columns: columns.value,
        params,
        selectedKeys: selectedKeys.value,
        'onUpdate:selectedKeys': (keys: CrudTableKey[]) => {
          selectedKeys.value = keys
        }
      }) as CrudTableProps<TRecord, TQuery>
  )

  return {
    table,
    tableRef,
    tableProps,
    params,
    isDirtyParams,
    setParams,
    resetParams,
    selectedKeys,
    selectedRows,
    create,
    update,
    remove,
    removeMany,
    openCreate,
    openEdit,
    editingRow,
    submitForm,
    submitting,
    creating,
    updating,
    removing
  }
}
