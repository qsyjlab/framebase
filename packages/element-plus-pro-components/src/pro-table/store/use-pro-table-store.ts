import { computed, nextTick, ref, watch } from 'vue'
import { cloneDeep } from 'lodash-es'
import type { TableInstance } from 'element-plus'
import type { ProConfigProviderContext } from '../../pro-config-provider'
import { useProTableColumns } from '../hooks/use-pro-table-columns'
import { useProTableData } from '../hooks/use-pro-table-data'
import { useProTableDragSort } from '../hooks/use-pro-table-drag-sort'
import { useProTableEditable } from '../hooks/use-pro-table-editable'
import { useProTableHeight } from '../hooks/use-pro-table-height'
import { useProTableSelection } from '../hooks/use-pro-table-selection'
import type {
  ProTableDragSortEnd,
  ProTableExpose,
  ProTablePageInfo,
  ProTablePagination,
  ProTableProps,
  ProTableFilters,
  ProTableRequestLifecycle,
  ProTableRequestResult,
  ProTableSorter
} from '../pro-table'
import { getProTableRowKey } from '../pro-table-utils'

export interface ProTableStoreEmitMap<TRecord extends object> {
  'update:loading': [loading: boolean]
  'update:selectedKeys': [keys: Array<string | number>]
  'selection-change': [rows: TRecord[]]
  'page-change': [current: number, pageSize: number]
  'pagination-change': [pageInfo: ProTablePageInfo]
  'update:pagination': [pagination: ProTablePagination]
  'sort-change': [sorter: ProTableSorter | undefined]
  'filter-change': [filters: ProTableFilters]
  'request-state-change': [lifecycle: ProTableRequestLifecycle]
  'request-error': [error: unknown]
  'update:data': [data: TRecord[]]
  'editable-change': [data: TRecord[]]
  'drag-sort-end': [event: ProTableDragSortEnd<TRecord>]
  'size-change': [size: 'small' | 'default' | 'large']
}

type ProTableStoreEmit<TRecord extends object> = <
  TEvent extends keyof ProTableStoreEmitMap<TRecord>
>(
  event: TEvent,
  ...args: ProTableStoreEmitMap<TRecord>[TEvent]
) => void

interface UseProTableStoreOptions<TRecord extends object, TQuery extends object, TResponse> {
  props: ProTableProps<TRecord, TQuery, TResponse>
  emit: ProTableStoreEmit<TRecord>
  proConfig: ProConfigProviderContext
}

export function useProTableStore<
  TRecord extends object,
  TQuery extends object,
  TResponse = ProTableRequestResult<TRecord>
>(options: UseProTableStoreOptions<TRecord, TQuery, TResponse>) {
  const { props, emit, proConfig } = options
  const wrapperRef = ref<HTMLDivElement>()
  const toolbarRef = ref<HTMLDivElement>()
  const extraRef = ref<HTMLDivElement>()
  const alertRef = ref<HTMLDivElement>()
  const paginationRef = ref<HTMLDivElement>()
  const tableRef = ref<TableInstance>()
  const currentSize = ref<'small' | 'default' | 'large' | undefined>(
    normalizeSize(props.size ?? proConfig.value.table?.size ?? proConfig.value.size)
  )
  let clearEditing: () => void = () => undefined
  let syncSelection: () => Promise<void> = async () => undefined

  const dataState = useProTableData({
    props,
    proConfig,
    currentSize,
    beforePageChange: () => clearEditing(),
    afterLoad: () => syncSelection(),
    onLoadingChange: loading => emit('update:loading', loading),
    onPageChange: pageInfo => {
      emit('page-change', pageInfo.current, pageInfo.pageSize)
      emit('pagination-change', pageInfo)
      emit('update:pagination', {
        ...(typeof props.pagination === 'object' ? props.pagination : {}),
        ...pageInfo
      })
    },
    onSorterChange: sorter => emit('sort-change', sorter),
    onFiltersChange: filters => emit('filter-change', filters),
    onRequestStateChange: lifecycle => emit('request-state-change', lifecycle),
    onRequestError: error => emit('request-error', error)
  })
  const columnsState = useProTableColumns({
    columns: () => props.columns,
    indexBorder: () => props.indexBorder ?? true,
    pageInfo: dataState.pageInfo,
    columnsState: () => props.columnsState ?? {},
    tableOptions: () => props.options ?? proConfig.value.table?.options
  })
  const editableState = useProTableEditable({
    data: dataState.tableData,
    columns: () => columnsState.visibleColumns.value,
    rowKey: () => props.rowKey ?? 'id',
    editable: () => props.editable,
    onChange: data => {
      emit('update:data', data)
      emit('editable-change', data)
    }
  })
  clearEditing = editableState.clearEditRows
  const resolvedRowSelection = computed(() => {
    const config =
      props.rowSelection && typeof props.rowSelection === 'object' ? props.rowSelection : {}
    return {
      ...config,
      enabled:
        props.rowSelection !== false && (Boolean(props.checkable) || Boolean(props.rowSelection)),
      type: config.type ?? 'checkbox',
      selectedKeys: config.selectedKeys ?? props.selectedKeys ?? [],
      cacheSelectedData: config.cacheSelectedData ?? props.cacheSelectedData ?? [],
      reserveSelection: config.reserveSelection ?? props.reserveSelection ?? false,
      columnTitle: config.columnTitle ?? '',
      columnWidth: config.columnWidth ?? 44,
      fixed: config.fixed,
      align: config.align ?? 'center'
    }
  })
  const selectionState = useProTableSelection({
    data: dataState.tableData,
    tableRef,
    rowKey: () => props.rowKey ?? 'id',
    mode: () => resolvedRowSelection.value.type,
    checkable: () => resolvedRowSelection.value.enabled,
    reserveSelection: () => resolvedRowSelection.value.reserveSelection,
    selectedKeys: () => resolvedRowSelection.value.selectedKeys,
    cacheSelectedData: () => resolvedRowSelection.value.cacheSelectedData,
    onChange: (keys, rows) => {
      emit('update:selectedKeys', keys)
      emit('selection-change', rows)
      resolvedRowSelection.value.onChange?.(keys, rows)
    }
  })
  syncSelection = selectionState.syncVisibleSelection
  const heightState = useProTableHeight({
    enabled: () => props.autoFitHeight ?? false,
    height: () => props.height,
    tableRef,
    wrapperRef,
    occupiedRefs: [toolbarRef, extraRef, alertRef, paginationRef],
    dependencies: () => [
      props.pagination,
      props.size,
      selectionState.selectedKeyList.value.length,
      dataState.tableData.value.length
    ]
  })
  const dragSortState = useProTableDragSort({
    dragSort: () => props.dragSort,
    data: dataState.tableData,
    columns: columnsState.visibleColumns,
    tableRef,
    onChange: payload => {
      emit('update:data', payload.data)
      emit('drag-sort-end', payload)
    }
  })

  const showToolbar = computed(
    () =>
      Boolean(props.headerTitle) ||
      Boolean(
        columnsState.toolbarOptions.value.reload ||
        columnsState.toolbarOptions.value.density ||
        columnsState.toolbarOptions.value.setting
      )
  )
  const resolvedCustomRenderAfter = computed(
    () => props.customRenderAfter ?? proConfig.value.table?.customRenderAfter
  )
  const resolvedRowKey = computed(() => {
    const rowKey = props.rowKey ?? 'id'
    return typeof rowKey === 'string' ? rowKey : (row: TRecord) => String(rowKey(row))
  })

  watch(
    [() => props.size, () => proConfig.value.table?.size, () => proConfig.value.size],
    ([size, tableSize, providerSize]) =>
      (currentSize.value = normalizeSize(size ?? tableSize ?? providerSize))
  )

  function setTableSize(size: 'small' | 'default' | 'large') {
    currentSize.value = size
    emit('size-change', size)
    void nextTick(() => tableRef.value?.doLayout())
  }

  async function reset() {
    clearEditing()
    selectionState.clearSelection()
    return dataState.resetTableState()
  }

  async function scrollTo(target: import('../pro-table').ProTableScrollTarget) {
    await nextTick()
    if (typeof target === 'number') {
      tableRef.value?.setScrollTop(target)
      return
    }
    if (target.left !== undefined) tableRef.value?.setScrollLeft(target.left)
    if (target.top !== undefined) {
      tableRef.value?.setScrollTop(target.top)
      return
    }
    const index =
      target.index ??
      (target.key === undefined
        ? -1
        : dataState.tableData.value.findIndex(
            row => getProTableRowKey(row, props.rowKey ?? 'id') === target.key
          ))
    if (index < 0) return
    const tableElement = tableRef.value?.$el as HTMLElement | undefined
    const rows = tableElement?.querySelectorAll<HTMLTableRowElement>(
      '.el-table__body-wrapper tbody > tr'
    )
    const row = rows?.[index]
    if (row) tableRef.value?.setScrollTop(row.offsetTop)
  }

  async function handleTableSortChange(payload: {
    column?: { columnKey?: string; property?: string }
    prop?: string | null
    order?: 'ascending' | 'descending' | null
  }) {
    const key = payload.column?.columnKey
    const column = key ? findColumn(props.columns, key) : undefined
    if (!column?.serverSort) return
    const field =
      typeof column.serverSort === 'string'
        ? column.serverSort
        : (payload.prop ?? payload.column?.property)
    await dataState.setSorter(
      payload.order && key ? { key, field, order: payload.order } : undefined
    )
  }

  async function handleTableFilterChange(nextFilters: Record<string, unknown[]>) {
    const serverFilters = resolveProTableServerFilters(props.columns, nextFilters)
    await dataState.setFilters({ ...dataState.filters.value, ...serverFilters })
  }

  function handleTableSelect(rows: TRecord[], row: TRecord) {
    const key = getProTableRowKey(row, props.rowKey ?? 'id')
    resolvedRowSelection.value.onSelect?.(
      row,
      key !== undefined && rows.some(item => getProTableRowKey(item, props.rowKey ?? 'id') === key),
      rows
    )
  }

  function handleTableSelectAll(rows: TRecord[]) {
    resolvedRowSelection.value.onSelectAll?.(rows.length > 0, rows)
  }

  function selectRadioRow(row: TRecord, index: number) {
    if (resolvedRowSelection.value.selectable?.(row, index) === false) return
    selectionState.selectRow(row)
    resolvedRowSelection.value.onSelect?.(row, true, selectionState.getSelectedRows())
  }

  function getSelectionRowKey(row: TRecord) {
    return getProTableRowKey(row, props.rowKey ?? 'id')
  }

  const exposed: ProTableExpose<TRecord> = {
    getTable: () => tableRef.value,
    getData: () => cloneDeep(dataState.tableData.value),
    getLoading: () => dataState.mergedLoading.value,
    getPageInfo: () => ({ ...dataState.pageInfo.value }),
    getTotal: () => dataState.total.value,
    getServerState: dataState.getServerState,
    getRequestLifecycle: dataState.getRequestLifecycle,
    getError: dataState.getError,
    retryRequest: dataState.retryRequest,
    cancelRequest: dataState.cancelRequest,
    getSelectedKeys: () => [...selectionState.selectedKeyList.value],
    reload: dataState.reload,
    refresh: dataState.refresh,
    reset,
    scrollTo,
    setPageInfo: dataState.setPageInfo,
    setSorter: dataState.setSorter,
    setFilters: dataState.setFilters,
    resetServerState: dataState.resetServerState,
    clearSelection: selectionState.clearSelection,
    clearSelectedKeys: selectionState.clearSelection,
    getSelectedRows: selectionState.getSelectedRows,
    doLayout: () => tableRef.value?.doLayout(),
    doHeight: heightState.measureTableHeight,
    startEditable: editableState.startEditable,
    cancelEditable: editableState.cancelEditable,
    saveEditable: editableState.saveEditable,
    deleteEditable: editableState.deleteEditable,
    clearEditRows: editableState.clearEditRows,
    hasEditingRow: editableState.hasEditingRow,
    getEditableKeys: editableState.getEditableKeys,
    validateEditable: editableState.validateEditable,
    saveAllEditable: editableState.saveAllEditable,
    cancelAllEditable: editableState.cancelAllEditable,
    getRowEditableState: editableState.getRowEditableState,
    editableCellUtils: {
      startEditable: editableState.startEditable,
      cancelEditable: editableState.cancelEditable,
      saveEditable: editableState.saveEditable,
      deleteEditable: editableState.deleteEditable,
      clearEditRow: editableState.clearEditRows,
      hasEditingRow: editableState.hasEditingRow,
      getEditableKeys: editableState.getEditableKeys,
      validateEditable: editableState.validateEditable,
      saveAllEditable: editableState.saveAllEditable,
      cancelAllEditable: editableState.cancelAllEditable,
      getRowEditableState: editableState.getRowEditableState
    },
    columnsSettingUtils: {
      mergeColumnsMap: columnsState.mergeColumnsMap,
      resetColumnsMap: columnsState.resetColumnState,
      getColumnMapConfig: columnsState.getColumnMapConfig
    }
  }

  return {
    wrapperRef,
    toolbarRef,
    extraRef,
    alertRef,
    paginationRef,
    tableRef,
    currentSize,
    showToolbar,
    resolvedCustomRenderAfter,
    resolvedRowKey,
    setTableSize,
    handleTableSortChange,
    handleTableFilterChange,
    handleTableSelect,
    handleTableSelectAll,
    selectRadioRow,
    getSelectionRowKey,
    resolvedRowSelection,
    exposed,
    ...dataState,
    ...columnsState,
    ...editableState,
    ...selectionState,
    ...heightState,
    resolvedDragSort: dragSortState.config,
    dragSortReady: dragSortState.ready,
    isDragHandleColumn: dragSortState.isDragHandleColumn
  }
}

function findColumn<TRecord extends object>(
  columns: import('../pro-table').ProTableColumns<TRecord>,
  key: string
): import('../pro-table').ProTableColumn<TRecord> | undefined {
  for (const column of columns) {
    if (String(column.key) === key) return column
    const child = column.children ? findColumn(column.children, key) : undefined
    if (child) return child
  }
  return undefined
}

export function resolveProTableServerFilters<TRecord extends object>(
  columns: import('../pro-table').ProTableColumns<TRecord>,
  filters: Record<string, unknown[]>
): ProTableFilters {
  return Object.fromEntries(
    Object.entries(filters).flatMap(([key, values]) => {
      const column = findColumn(columns, key)
      if (!column?.serverFilter) return []
      const filterKey = typeof column.serverFilter === 'string' ? column.serverFilter : key
      return [[filterKey, [...values]]]
    })
  )
}

function normalizeSize(size: '' | 'small' | 'default' | 'large' | undefined) {
  return size || undefined
}
