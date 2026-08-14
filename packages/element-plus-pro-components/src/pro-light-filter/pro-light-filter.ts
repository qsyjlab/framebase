import type { ComponentSize } from 'element-plus'
import type { Ref, VNode } from 'vue'
import type { ProFieldValueEnum, ProFieldValueType } from '../pro-field'
import type { ProOption, ProOptionFields } from '../shared/pro-option'

export interface ProLightFilterFieldRenderContext<TValue = unknown> {
  value: TValue
  setValue: (value: TValue) => void
  field: ProLightFilterField<TValue>
}

export interface ProLightFilterField<TValue = unknown> {
  key: string
  label: string
  /** 复用 ProField 的 valueType，直接享受所有内置类型 + 自定义注册类型 */
  valueType?: ProFieldValueType
  valueEnum?: ProFieldValueEnum
  options?: ProOption[]
  optionFields?: Partial<ProOptionFields<ProOption>>
  collapsed?: boolean
  fieldProps?: Record<string, unknown>
  placeholder?: string
  /** 自定义 popover 宽度，不设则按 valueType 自动推断 */
  popoverWidth?: number | 'auto'
  /**
   * 是否即时提交
   * - true：选中即提交并关闭 popover（select/date 等默认）
   * - false：只更新临时值，需点确认才提交（text/number 等默认）
   * - 不设：按 valueType 自动推断
   */
  instant?: boolean
  /** 自定义 popover 面板内控件渲染 */
  render?: (ctx: ProLightFilterFieldRenderContext<TValue>) => VNode
  /** 自定义 chip 中值文本显示 */
  renderLabel?: (value: TValue, field: ProLightFilterField<TValue>) => string
}

export type ProLightFilterModelValue = Record<string, unknown>

export type ProLightFilterBorderStyle = 'borderless' | 'outlined' | 'filled' | 'underlined'

export interface ProLightFilterProps {
  modelValue?: ProLightFilterModelValue
  fields?: ProLightFilterField[]
  size?: ComponentSize
  borderStyle?: ProLightFilterBorderStyle
  collapsedCount?: number
  showMoreToggle?: boolean
  disabled?: boolean
}

export interface ProLightFilterSlots {
  /** 通用字段插槽：覆盖所有字段渲染，参数为字段配置、当前值、设置值方法 */
  field?: (props: {
    field: ProLightFilterField
    value: unknown
    setValue: (v: unknown) => void
  }) => VNode[]
  /** 按 valueType 插槽：覆盖特定 valueType 的渲染，如 #field-select */
  [key: `field-${string}`]:
    | ((props: {
        field: ProLightFilterField
        value: unknown
        setValue: (v: unknown) => void
      }) => VNode[])
    | undefined
  /** 自定义 popover 底部 footer（仅延迟型字段显示） */
  footer?: (props: {
    field: ProLightFilterField
    confirm: () => void
    clear: () => void
  }) => VNode[]
}

export interface ProLightFilterExpose {
  values: Readonly<ProLightFilterModelValue>
  collapsed: Readonly<Ref<boolean>>
  toggleCollapsed: () => void
  setValue: (key: string, value: unknown) => void
  reset: () => void
}

export type ProLightFilterInstance = ProLightFilterExpose
