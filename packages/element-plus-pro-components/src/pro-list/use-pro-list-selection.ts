import { cloneDeep } from 'lodash-es'
import { useSelection, type SelectionKey } from '@framebase/vue'
import { getProListRowKey } from './pro-list-utils'
import type { ProListRowKey } from './pro-list'

export interface UseProListSelectionOptions<TRecord extends object> {
  data: import('vue').Ref<TRecord[]>
  rowKey: () => ProListRowKey<TRecord>
  reserveSelection: () => boolean
  selectedKeys: () => Array<string | number>
  onChange: (keys: Array<string | number>, records: TRecord[]) => void
}

export type UseProListSelectionReturn<TRecord extends object> = ReturnType<
  typeof useSelection<TRecord>
>

/**
 * ProList selection hook — a thin wrapper around `@framebase/core`'s
 * `useSelection` that:
 *  - resolves the row key via `getProListRowKey`
 *  - returns deep-cloned records from `getSelectedRows` / `onChange` so callers
 *    never mutate the internal selection cache.
 */
export function useProListSelection<TRecord extends object>(
  options: UseProListSelectionOptions<TRecord>
): UseProListSelectionReturn<TRecord> {
  const selection = useSelection<TRecord>({
    data: options.data,
    rowKey: () => {
      const rowKey = options.rowKey()
      if (typeof rowKey === 'function') return rowKey
      return record => getProListRowKey(record, rowKey) as SelectionKey | undefined
    },
    reserveSelection: options.reserveSelection,
    selectedKeys: options.selectedKeys,
    onChange: (keys, records) =>
      options.onChange(
        keys,
        records.map(record => cloneDeep(record))
      )
  })

  return {
    ...selection,
    getSelectedRows: () => selection.getSelectedRows().map(record => cloneDeep(record))
  }
}
