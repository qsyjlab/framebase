import type { Component, Ref } from 'vue'
import type { TagProps } from 'element-plus'
import type {
  ProChoiceValue,
  ProOption,
  ProOptionFields,
  ProOptionFieldPath
} from '../shared/pro-option'
import type { ProLiteralUnion } from '../shared/pro-path'

export type ProFieldMode = 'read' | 'edit'

/**
 * Registry interface for built-in field value types.
 *
 * Extensible via TypeScript declaration merging so applications can register
 * custom value types and get full autocomplete + type checking:
 *
 * ```ts
 * declare module '@framebase/element-plus-pro-components' {
 *   interface ProFieldBuiltinValueTypes {
 *     bankCard: true
 *     idCard: true
 *   }
 * }
 * ```
 *
 * `registerProField('bankCard', { ... })` at runtime then makes the type
 * fully functional in ProField / ProForm / ProTable.
 */
export interface ProFieldBuiltinValueTypes {
  text: true
  textarea: true
  number: true
  money: true
  percent: true
  date: true
  datetime: true
  select: true
  radio: true
  checkbox: true
  switch: true
  enum: true
  tag: true
  status: true
  progress: true
  image: true
  upload: true
}

export type ProFieldBuiltinValueType = keyof ProFieldBuiltinValueTypes

export interface ProFieldValueTypeConfig {
  type: ProLiteralUnion<ProFieldBuiltinValueType>
  currency?: string
  locale?: string
  precision?: number
  dateFormat?: string
}

export type ProFieldValueType = ProLiteralUnion<ProFieldBuiltinValueType> | ProFieldValueTypeConfig

export interface ProFieldValueEnumItem {
  text?: string
  color?: string
  type?: TagProps['type']
  disabled?: boolean
}

export type ProFieldValueEnumValue = string | number | ProFieldValueEnumItem

/**
 * Builtin dictionary names registered via `registerProDictionary` or provided
 * through `ProConfigProvider.dictionaries`. Extend via declaration merging to
 * get autocomplete for `valueEnum: '<name>'` references:
 *
 * ```ts
 * declare module '@framebase/element-plus-pro-components' {
 *   interface ProFieldBuiltinDictionaries {
 *     gender: true
 *     province: true
 *   }
 * }
 * ```
 *
 * Empty by default, so any `string` is accepted; merging known names narrows
 * the union and enables editor hints without breaking ad-hoc usage.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty for declaration merging
export interface ProFieldBuiltinDictionaries {}

export type ProFieldDictionaryName = ProLiteralUnion<keyof ProFieldBuiltinDictionaries>

export type ProFieldValueEnum =
  | Record<string, ProFieldValueEnumValue>
  | Map<ProChoiceValue, ProFieldValueEnumValue>
  | ProFieldDictionaryName

export interface ProFieldProps<TValue = unknown, TOption extends object = ProOption> {
  modelValue?: TValue
  mode?: ProFieldMode
  valueType?: ProFieldValueType
  valueEnum?: ProFieldValueEnum
  options?: TOption[]
  optionFields?: Partial<ProOptionFields<TOption>>
  fieldProps?: Record<string, unknown>
  emptyText?: string
  disabled?: boolean
  readonly?: boolean
  block?: boolean
  formatter?: (value: TValue, context: ProFieldRenderContext<TValue, TOption>) => unknown
}

export interface ProFieldRenderContext<TValue = unknown, TOption extends object = ProOption> {
  value: TValue | undefined
  mode: ProFieldMode
  valueType: ProFieldValueTypeConfig
  valueEnum?: ProFieldValueEnum
  options: TOption[]
  optionFields: ProOptionFields<TOption>
  fieldProps: Record<string, unknown>
  updateValue: (value: TValue | undefined) => void
}

export interface ProFieldRendererDefinition {
  read?: Component
  edit?: Component
}

export interface ProFieldExpose<TValue = unknown> {
  fieldRef: Ref<HTMLElement | undefined>
  value: Readonly<Ref<TValue | undefined>>
  focus: () => void
  blur: () => void
}

export type ProFieldInstance<TValue = unknown> = ProFieldExpose<TValue>

export type ProFieldOptionPath<TOption extends object> = ProOptionFieldPath<TOption>
