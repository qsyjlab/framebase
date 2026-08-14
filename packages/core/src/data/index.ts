/**
 * Pure helpers for paginated data sources.
 *
 * Framework-agnostic utilities shared by ProTable / ProList / ProDescriptions
 * to normalize server responses, resolve row keys, and paginate local data.
 * The `PageInfo` type lives here so non-vue consumers can describe pagination
 * state without pulling in a vue-specific package.
 */
import { getPathValue, type Path } from '../path'

export interface PageInfo {
  current: number
  pageSize: number
}

export interface PagedResponse<TData> {
  data: TData[]
  total: number
  success?: boolean
}

export type RowKey<TRecord> = Path | ((record: TRecord) => string | number | undefined)

/**
 * Normalize a server response into a safe `PagedResponse`.
 * - `data` defaults to `[]` when missing or not an array.
 * - `total` defaults to `0` when missing or not finite.
 * - `success` is passed through as-is.
 */
export function normalizePagedResponse<TData>(
  response: PagedResponse<TData>
): PagedResponse<TData> {
  return {
    data: Array.isArray(response.data) ? response.data : [],
    total: Number.isFinite(response.total) ? response.total : 0,
    success: response.success
  }
}

/**
 * Slice a flat array to the given page. Used for client-side pagination
 * (e.g. ProTable with `data` instead of `request`).
 */
export function paginateData<TData>(data: TData[], pageInfo: PageInfo): TData[] {
  const start = (pageInfo.current - 1) * pageInfo.pageSize
  return data.slice(start, start + pageInfo.pageSize)
}

/**
 * Resolve the row key for a record. Accepts a dot-notation path or a function.
 */
export function getRowKey<TRecord>(
  record: TRecord,
  rowKey: RowKey<TRecord>
): string | number | undefined {
  return typeof rowKey === 'function'
    ? rowKey(record)
    : getPathValue<string | number>(record, rowKey)
}

/**
 * Move an item within an array (immutable). Returns a new array.
 * Used by drag-sort tables.
 */
export function moveItem<TData>(data: TData[], oldIndex: number, newIndex: number): TData[] {
  if (
    oldIndex === newIndex ||
    oldIndex < 0 ||
    newIndex < 0 ||
    oldIndex >= data.length ||
    newIndex >= data.length
  ) {
    return [...data]
  }

  const next = [...data]
  const [item] = next.splice(oldIndex, 1)
  next.splice(newIndex, 0, item)
  return next
}

// --- Pro-prefixed aliases (back-compat with @framebase/element-plus-pro-components) ---

export type ProPagedResponse<TData> = PagedResponse<TData>
export type ProRowKey<TRecord> = RowKey<TRecord>

export { normalizePagedResponse as normalizeProPagedResponse }
export { paginateData as paginateProData }
export { getRowKey as getProRowKey }
export { moveItem as moveProItem }
