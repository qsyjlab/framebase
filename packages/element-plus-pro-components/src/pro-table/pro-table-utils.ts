import { normalizeProPath } from '../shared/pro-path'
import {
  getProRowKey,
  moveProItem,
  normalizeProPagedResponse,
  paginateProData
} from '@framebase/core'
import type {
  ProTableColumn,
  ProTableColumnState,
  ProTablePageInfo,
  ProTableRequestResult,
  ProTableRowKey
} from './pro-table'

export function getProTableColumnKey<TRecord extends object>(column: ProTableColumn<TRecord>) {
  return String(column.key)
}

export function getProTableColumnProp<TRecord extends object>(column: ProTableColumn<TRecord>) {
  if (column.dataIndex === undefined) return undefined
  return normalizeProPath(column.dataIndex).join('.')
}

export function getProTableRowKey<TRecord extends object>(
  row: TRecord,
  rowKey: ProTableRowKey<TRecord>
): string | number | undefined {
  return getProRowKey(row, rowKey as Parameters<typeof getProRowKey>[1])
}

export function paginateProTableData<TRecord extends object>(
  data: TRecord[],
  pageInfo: ProTablePageInfo
) {
  return paginateProData(data, pageInfo)
}

export function moveProTableRow<TRecord>(data: TRecord[], oldIndex: number, newIndex: number) {
  return moveProItem(data, oldIndex, newIndex)
}

export function normalizeProTableResponse<TRecord extends object>(
  response: ProTableRequestResult<TRecord>
): ProTableRequestResult<TRecord> {
  return normalizeProPagedResponse(response)
}

export function applyProTableColumnState<TRecord extends object>(
  columns: ProTableColumn<TRecord>[],
  state: Record<string, ProTableColumnState>
): ProTableColumn<TRecord>[] {
  return columns
    .map((column, index) => ({ column, index, config: state[getProTableColumnKey(column)] }))
    .filter(item => item.config?.show !== false && !item.column.hideInTable)
    .sort(
      (left, right) => (left.config?.order ?? left.index) - (right.config?.order ?? right.index)
    )
    .map(({ column, config }) => ({
      ...column,
      fixed: config?.fixed ?? column.fixed,
      children: column.children ? applyProTableColumnState(column.children, state) : column.children
    }))
}

export function createProTableColumnState<TRecord extends object>(
  columns: ProTableColumn<TRecord>[]
): Record<string, ProTableColumnState> {
  return columns.reduce<Record<string, ProTableColumnState>>((result, column, index) => {
    result[getProTableColumnKey(column)] = {
      show: !column.hideInTable,
      order: index,
      fixed: column.fixed
    }
    return Object.assign(result, createProTableColumnState(column.children ?? []))
  }, {})
}
