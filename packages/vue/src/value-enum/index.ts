/**
 * Value enum: declarative option maps with reactive `options` / lookup helpers.
 *
 * A `ValueEnum` is a `Record<value, text | item>` or `Map<value, text | item>`
 * describing the options for a field / column. This hook normalizes the enum
 * into a reactive `options` list (for `el-select` / `el-table` filters) and
 * provides `getText` / `getItem` for rendering cells by value.
 *
 * `@framebase/vue` defines its own lightweight `ValueEnum` / `ValueEnumItem`
 * types so the composable stays framework-agnostic. `@framebase/element-plus-
 * pro-components` reuses this same shape for its `ProFieldValueEnum`.
 */
import { computed, type ComputedRef } from 'vue'
import { toValue, type MaybeRefOrGetter } from 'vue'

export interface ValueEnumItem {
  /** Display label. */
  text: string
  /** Tag type for colored badges (aligns with Element Plus `el-tag` type). */
  type?: 'success' | 'info' | 'warning' | 'danger' | 'primary'
  /** Custom color (overrides `type`). */
  color?: string
  /** Option disabled flag. */
  disabled?: boolean
}

export type ValueEnumValue = string | number | ValueEnumItem

export type ValueEnum = Record<string, ValueEnumValue> | Map<unknown, ValueEnumValue>

export interface ValueEnumOption {
  label: string
  value: unknown
  disabled?: boolean
}

export interface UseValueEnumReturn {
  /** Normalized options for `el-select` / filter dropdowns. */
  options: ComputedRef<ValueEnumOption[]>
  /** Lookup the display text for a value. Returns `''` when unknown. */
  getText: (value: unknown) => string
  /** Lookup the full item (with status / color) for a value. */
  getItem: (value: unknown) => ValueEnumItem | undefined
}

function normalizeItem(item: ValueEnumValue | undefined): ValueEnumItem | undefined {
  if (item === undefined || item === null) return undefined
  if (typeof item === 'string' || typeof item === 'number') return { text: String(item) }
  return item
}

function getEntry(valueEnum: ValueEnum, value: unknown): ValueEnumValue | undefined {
  if (valueEnum instanceof Map) return valueEnum.get(value)
  return valueEnum[String(value)]
}

export function useValueEnum(
  valueEnum: MaybeRefOrGetter<ValueEnum | undefined>
): UseValueEnumReturn {
  const options = computed<ValueEnumOption[]>(() => {
    const enumValue = toValue(valueEnum)
    if (!enumValue) return []
    const entries: [unknown, ValueEnumValue][] =
      enumValue instanceof Map ? [...enumValue.entries()] : Object.entries(enumValue)
    return entries.map(([value, item]) => {
      const normalized = normalizeItem(item)
      return {
        label: normalized?.text ?? String(value),
        value,
        disabled: normalized?.disabled
      }
    })
  })

  function getText(value: unknown): string {
    const enumValue = toValue(valueEnum)
    if (!enumValue || value === null || value === undefined) return ''
    const item = normalizeItem(getEntry(enumValue, value))
    return item?.text ?? ''
  }

  function getItem(value: unknown): ValueEnumItem | undefined {
    const enumValue = toValue(valueEnum)
    if (!enumValue || value === null || value === undefined) return undefined
    return normalizeItem(getEntry(enumValue, value))
  }

  return { options, getText, getItem }
}

// --- Pro-prefixed aliases ---

export type UseProValueEnumReturn = UseValueEnumReturn
export { useValueEnum as useProValueEnum }
