/**
 * Dynamic field array with stable keys for `v-for` rendering.
 *
 * Each item is wrapped in `{ key, value }` so React-style stable keys survive
 * moves/removes — Element Plus form arrays (and any keyed list) benefit from
 * this to preserve component state and avoid re-mounting. `key` is generated
 * monotonically and never reused within a hook instance.
 *
 * Mutation helpers (`append` / `remove` / `move` / `insert` / `replace`)
 * return the new length and keep `fields` reactive.
 */
import { ref, computed, type ComputedRef, type Ref } from 'vue'
import { cloneDeep } from 'lodash-es'

export interface FieldArrayItem<T> {
  /** Stable unique key for `v-for` / `:key`. */
  key: number
  /** The actual record value. */
  value: T
}

export interface UseFieldArrayOptions {
  /** Value factory for `append()` with no argument. Defaults to `() => ({} as never)`. */
  defaultItem?: () => any
}

export interface UseFieldArrayReturn<T> {
  /** Wrapped items with stable keys. Bind in `v-for` as `:key="item.key"`. */
  fields: Ref<FieldArrayItem<T>[]>
  /** Convenience: just the values, computed. */
  values: ComputedRef<T[]>
  /** Number of items. */
  length: ComputedRef<number>
  /** Append one item (uses `defaultItem` when `value` omitted). Returns new length. */
  append: (value?: T) => number
  /** Insert at `index`. Returns new length. */
  insert: (index: number, value: T) => number
  /** Remove the item at `index`. Returns the removed value. */
  remove: (index: number) => T | undefined
  /** Move item from `from` to `to`. */
  move: (from: number, to: number) => void
  /** Replace the item at `index`. */
  replace: (index: number, value: T) => void
  /** Replace the whole array. */
  setAll: (values: T[]) => void
  /** Clear all items. */
  clear: () => void
  /** Reset to the initial values provided at creation. */
  reset: () => void
}

export function useFieldArray<T>(
  initial: T[] = [],
  options: UseFieldArrayOptions = {}
): UseFieldArrayReturn<T> {
  const { defaultItem = () => ({}) as T } = options

  let seq = 0
  const wrap = (value: T): FieldArrayItem<T> => ({ key: ++seq, value: cloneDeep(value) })

  const initialWrapped = initial.map(wrap)
  const fields = ref<FieldArrayItem<T>[]>(initialWrapped) as Ref<FieldArrayItem<T>[]>

  const values = computed(() => fields.value.map(f => f.value))
  const length = computed(() => fields.value.length)

  function append(value?: T): number {
    fields.value.push(wrap(value ?? defaultItem()))
    return fields.value.length
  }

  function insert(index: number, value: T): number {
    fields.value.splice(index, 0, wrap(value))
    return fields.value.length
  }

  function remove(index: number): T | undefined {
    if (index < 0 || index >= fields.value.length) return undefined
    const [removed] = fields.value.splice(index, 1)
    return removed?.value
  }

  function move(from: number, to: number): void {
    if (from === to) return
    if (from < 0 || from >= fields.value.length) return
    if (to < 0 || to >= fields.value.length) return
    const [item] = fields.value.splice(from, 1)
    fields.value.splice(to, 0, item)
  }

  function replace(index: number, value: T): void {
    if (index < 0 || index >= fields.value.length) return
    // keep the existing key so Vue reuses the rendered row
    fields.value[index] = { ...fields.value[index], value: cloneDeep(value) }
  }

  function setAll(values: T[]): void {
    fields.value = values.map(wrap)
  }

  function clear(): void {
    fields.value = []
  }

  function reset(): void {
    fields.value = initial.map(wrap)
  }

  return {
    fields,
    values,
    length,
    append,
    insert,
    remove,
    move,
    replace,
    setAll,
    clear,
    reset
  }
}

// --- Pro-prefixed aliases ---

export type UseProFieldArrayOptions = UseFieldArrayOptions
export type UseProFieldArrayReturn<T> = UseFieldArrayReturn<T>
export { useFieldArray as useProFieldArray }
