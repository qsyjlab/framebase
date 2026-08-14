import dayjs from 'dayjs'
import {
  DEFAULT_PRO_OPTION_FIELDS,
  getProOptionField,
  type ProOption,
  type ProOptionFields
} from '../shared/pro-option'
import { getProDictionary } from './pro-dictionary-registry'
import type {
  ProFieldValueEnum,
  ProFieldValueEnumItem,
  ProFieldValueEnumValue,
  ProFieldValueType,
  ProFieldValueTypeConfig
} from './pro-field'

export function resolveProFieldValueType(
  valueType: ProFieldValueType = 'text'
): ProFieldValueTypeConfig {
  return typeof valueType === 'string' ? { type: valueType } : valueType
}

/** Prefix marking an explicit dictionary reference, e.g. `'dict:gender'`. */
const PRO_DICT_PREFIX = 'dict:'

/**
 * If `valueEnum` is a dictionary name reference, return the resolved name
 * (stripping the optional `dict:` prefix). Returns `undefined` for inline
 * Record/Map enums.
 */
export function resolveProDictionaryName(
  valueEnum: ProFieldValueEnum | undefined
): string | undefined {
  if (typeof valueEnum !== 'string') return undefined
  return valueEnum.startsWith(PRO_DICT_PREFIX) ? valueEnum.slice(PRO_DICT_PREFIX.length) : valueEnum
}

/**
 * Resolve a `valueEnum` into its inline Record/Map form.
 *
 * - Inline `Record`/`Map` are returned as-is.
 * - A string reference is looked up against `dictionaries` (typically
 *   `ProConfigProvider.dictionaries`) first, then the global dictionary
 *   registry. Returns `undefined` when the name is unknown.
 */
export function resolveProFieldValueEnum(
  valueEnum: ProFieldValueEnum | undefined,
  dictionaries?: Record<string, ProFieldValueEnum>
): ProFieldValueEnum | undefined {
  if (!valueEnum) return undefined
  if (typeof valueEnum !== 'string') return valueEnum
  const name = resolveProDictionaryName(valueEnum)!
  return dictionaries?.[name] ?? getProDictionary(name)
}

export function normalizeProFieldEnumItem(
  item: ProFieldValueEnumValue | undefined
): ProFieldValueEnumItem | undefined {
  if (item === undefined) return undefined
  if (typeof item === 'string' || typeof item === 'number') return { text: String(item) }
  return item
}

export function getProFieldEnumItem(
  valueEnum: ProFieldValueEnum | undefined,
  value: unknown
): ProFieldValueEnumItem | undefined {
  if (!valueEnum || value === null || value === undefined) return undefined
  const item = valueEnum instanceof Map ? valueEnum.get(value as never) : valueEnum[String(value)]
  return normalizeProFieldEnumItem(item)
}

export function proFieldEnumToOptions(valueEnum?: ProFieldValueEnum) {
  if (!valueEnum) return []
  const entries = valueEnum instanceof Map ? [...valueEnum.entries()] : Object.entries(valueEnum)

  return entries.map(([value, item]) => {
    const normalized = normalizeProFieldEnumItem(item)
    return {
      label: normalized?.text ?? String(value),
      value,
      disabled: normalized?.disabled
    }
  })
}

export function isProFieldEmpty(value: unknown) {
  return (
    value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)
  )
}

export function resolveProFieldOptionLabels<TOption extends object = ProOption>(
  value: unknown,
  options: TOption[],
  fields: ProOptionFields<TOption>
) {
  const values = Array.isArray(value) ? value : [value]

  return values.map(currentValue => {
    const matched = options.find(
      option => getProOptionField<TOption>(option, fields.value) === currentValue
    )
    return matched
      ? String(getProOptionField<TOption>(matched, fields.label) ?? currentValue)
      : String(currentValue)
  })
}

export function formatProFieldValue(
  value: unknown,
  valueType: ProFieldValueTypeConfig,
  options: object[] = [],
  fields: ProOptionFields<object> = DEFAULT_PRO_OPTION_FIELDS
) {
  if (isProFieldEmpty(value)) return ''

  if (['select', 'radio', 'checkbox'].includes(valueType.type) && options.length) {
    return resolveProFieldOptionLabels(value, options, fields).join(' / ')
  }

  if (valueType.type === 'number') {
    const numberValue = Number(value)
    return Number.isFinite(numberValue)
      ? new Intl.NumberFormat(valueType.locale).format(numberValue)
      : String(value)
  }

  if (valueType.type === 'money') {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return String(value)
    return new Intl.NumberFormat(valueType.locale, {
      style: 'currency',
      currency: valueType.currency ?? 'CNY',
      minimumFractionDigits: valueType.precision ?? 2,
      maximumFractionDigits: valueType.precision ?? 2
    }).format(numberValue)
  }

  if (valueType.type === 'percent') return `${value}%`

  if (valueType.type === 'date' || valueType.type === 'datetime') {
    const dateValue = dayjs(value as string | number | Date)
    if (!dateValue.isValid()) return String(value)
    return dateValue.format(
      valueType.dateFormat ?? (valueType.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
    )
  }

  if (valueType.type === 'switch') return value ? '是' : '否'
  if (valueType.type === 'upload' && Array.isArray(value)) {
    return value
      .map(file =>
        file && typeof file === 'object' && 'name' in file ? String(file.name) : String(file)
      )
      .join(' / ')
  }
  if (Array.isArray(value)) return value.join(' / ')
  return String(value)
}
