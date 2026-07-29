import {
  getPathValue,
  getProRowKey,
  normalizeProPagedResponse,
  paginateProData
} from '@framebase/vue'
import type {
  ProListItemMeta,
  ProListPageInfo,
  ProListRequestResult,
  ProListRowKey,
  ProListValueGetter
} from './pro-list'

export function normalizeProListResponse<TRecord extends object>(
  response: ProListRequestResult<TRecord>
): ProListRequestResult<TRecord> {
  return normalizeProPagedResponse(response)
}

export function paginateProListData<TRecord extends object>(
  data: TRecord[],
  pageInfo: ProListPageInfo
) {
  return paginateProData(data, pageInfo)
}

export function getProListRowKey<TRecord extends object>(
  record: TRecord,
  rowKey: ProListRowKey<TRecord>
) {
  return getProRowKey(record, rowKey as Parameters<typeof getProRowKey>[1])
}

export function getProListValue<TRecord extends object, TValue>(
  record: TRecord,
  index: number,
  getter?: ProListValueGetter<TRecord, TValue>
) {
  if (!getter) return undefined
  return typeof getter === 'function'
    ? (getter as (record: TRecord, index: number) => TValue)(record, index)
    : getPathValue<TValue>(record, getter)
}

export function getProListItemValues<TRecord extends object>(
  record: TRecord,
  index: number,
  meta: ProListItemMeta<TRecord>
) {
  return {
    title: getProListValue(record, index, meta.title),
    description: getProListValue(record, index, meta.description),
    avatar: getProListValue(record, index, meta.avatar),
    content: getProListValue(record, index, meta.content)
  }
}

export function getProListErrorText(
  error: unknown,
  errorText?: string | ((error: unknown) => string)
) {
  if (typeof errorText === 'function') return errorText(error)
  if (errorText) return errorText
  return error instanceof Error ? error.message : '列表加载失败'
}
