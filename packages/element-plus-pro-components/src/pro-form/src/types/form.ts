import type { ButtonProps, FormItemRule, ColProps, FormItemProps } from 'element-plus'
import type { Component } from 'vue'
import type { FormProps as EpFormProps } from 'element-plus'
import type { ProFieldMode, ProFieldValueEnum, ProFieldValueType } from '../../../pro-field'
import type { ProOption, ProOptionFields } from '../../../shared/pro-option'
import type { ProDataIndex, ProPath } from '../../../shared/pro-path'
import type {
  ProRequestContext,
  ProRequestControl,
  ProRequestExecuteOptions
} from '../../../shared/pro-request'

export type FormModel = Record<string, any>
export type FormFieldPath<TModel extends FormModel = FormModel> = ProDataIndex<TModel>
export type FormBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ProFormCollapsedRows = number | Partial<Record<FormBreakpoint, number>>

export interface ProFormSubmitterConfig {
  submitText?: string
  resetText?: string
  showSubmit?: boolean
  showReset?: boolean
  /** 是否显示展开/收起操作；默认仅 inline 表单显示。 */
  showCollapse?: boolean
  submitButtonProps?: Partial<ButtonProps>
  resetButtonProps?: Partial<ButtonProps>
  col?: Partial<ColProps>
  align?: 'start' | 'center' | 'end'
}

export interface FormFieldDependencyContext<TModel extends FormModel = FormModel> {
  name: FormFieldPath<TModel> | string | number
  value: unknown
  values: Readonly<TModel>
  dependencies: Readonly<Record<string, unknown>>
  dependencyValues: readonly unknown[]
  getFieldValue: FormMethodsType<TModel>['getFieldValue']
}

/**
 * Effect context handed to a field's `effects` callback.
 *
 * Extends the dependency context with mutation helpers so effects can drive
 * cross-field side effects (clearing, cascading options, conditional
 * validation, etc.). The `setFieldValue` helper writes the literal value
 * without running the target field's `normalize` hook, since effects
 * typically produce already-valid programmatic values rather than raw user
 * input.
 */
export interface FormFieldEffectContext<TModel extends FormModel = FormModel>
  extends FormFieldDependencyContext<TModel> {
  /** Previous value of the field itself (undefined on the immediate run). */
  previousValue: unknown
  /** Previous dependency values, aligned with `dependencyValues` (undefined on the immediate run). */
  previousDependencyValues: readonly unknown[] | undefined
  /** Set a field value without running its `normalize` hook. */
  setFieldValue: FormMethodsType<TModel>['setFieldValue']
  /** Delete a field value at the given path. */
  clearFieldValue: (name: ProPath) => void
  /** Validate the given field(s). */
  validateField: FormMethodsType<TModel>['validateField']
  /** Clear validation errors for the given field(s). */
  clearFieldError: (name: FormFieldProp | FormFieldProp[]) => void
}

/**
 * Field-level side effect. Triggered when the field's declared `dependencies`
 * change (or when `shouldUpdate` reports a change). Use this for cross-field
 * mutations; for pure re-renders prefer `show`/`disabled`/`fieldProps`/`rules`.
 */
export type FormFieldEffect<TModel extends FormModel = FormModel> = (
  context: FormFieldEffectContext<TModel>
) => void

export type FormValueTransformContext<TModel extends FormModel = FormModel> =
  FormFieldDependencyContext<TModel>

export interface FormFieldError<TModel extends FormModel = FormModel> {
  name: FormFieldPath<TModel> | string | number
  errors: string | string[]
}

export type FormFieldErrorsInput<TModel extends FormModel = FormModel> =
  | FormFieldError<TModel>[]
  | Record<string, string | string[]>

export interface GetFormValuesOptions {
  transform?: boolean
}

type FormCallback<TArgs extends unknown[], TResult> = {
  bivarianceHack(...args: TArgs): TResult
}['bivarianceHack']

export type FormLegacyResolver<TModel extends FormModel, TValue> = FormCallback<
  [value: unknown, values: TModel],
  TValue
>

export type FormContextResolver<TModel extends FormModel, TValue> = FormCallback<
  [context: FormFieldDependencyContext<TModel>],
  TValue
>

export type FormDynamicValue<TModel extends FormModel, TValue> =
  | TValue
  | FormLegacyResolver<TModel, TValue>
  | FormContextResolver<TModel, TValue>

export interface FormSchema<
  TModel extends FormModel = FormModel,
  TOption extends object = ProOption
> extends Partial<Pick<FormItemProps, 'labelWidth' | 'size'>> {
  /** 标题 */
  label?: string
  /** 组件或者全局组件 */
  el?: Component | string
  /** 列表渲染的稳定标识，不参与字段取值。 */
  key: string | number
  /** 表单字段路径；未设置时为兼容旧配置使用 key。 */
  name?: FormFieldPath<TModel>
  /** tooltip 提示 */
  tip?: string
  /** 是否充满 content */
  fill?: boolean
  /** 是否必填 */
  required?: boolean
  // 验证失败信息
  requiredMessage?: string
  /**
   * 是否显示在表单上
   * @default true
   */
  /** 仅依赖路径变化时重新计算该字段的动态配置。 */
  dependencies?: FormFieldPath<TModel>[]
  /** 完整模型比较入口；适合无法通过 dependencies 描述的高级场景。 */
  shouldUpdate?: FormCallback<[previous: Readonly<TModel>, current: Readonly<TModel>], boolean>
  /**
   * 字段级副作用回调。当声明的 `dependencies` 发生变化（或 `shouldUpdate`
   * 返回 true）时触发，用于跨字段联动：清空关联字段、级联拉取选项、改写
   * 其他字段值等。与 `show`/`disabled`/`fieldProps`/`rules` 的纯函数响应
   * 不同，effects 可以直接修改其他字段。
   */
  effects?: FormFieldEffect<TModel>
  /**
   * 是否在字段挂载后立即执行一次 `effects`。默认 false。
   */
  effectsImmediate?: boolean
  /** 输入写入模型前执行。 */
  normalize?: FormCallback<
    [value: unknown, previousValue: unknown, values: Readonly<TModel>],
    unknown
  >
  /** 校验通过后生成提交值时执行，不修改内部模型。 */
  transform?: FormCallback<[value: unknown, context: FormValueTransformContext<TModel>], unknown>
  show?: FormDynamicValue<TModel, boolean>
  disabled?: FormDynamicValue<TModel, boolean>
  /** 组件属性 */
  attrs?: Record<string, any>
  /** 组件事件 */
  events?: Record<string, any>
  /** 使用 ProField 渲染时的值类型。 */
  valueType?: ProFieldValueType
  valueEnum?: ProFieldValueEnum
  options?: TOption[]
  optionFields?: Partial<ProOptionFields<TOption>>
  fieldProps?: FormDynamicValue<TModel, Record<string, unknown>>
  mode?: ProFieldMode
  /** 组件验证规则 */
  rules?: FormDynamicValue<TModel, FormItemRule[]>
  /** grid 布局 属性 */
  col?: Partial<ColProps>
}

/** ProForm 字段数组的简写类型。 */
export type ProFormSchema<
  TModel extends FormModel = FormModel,
  TOption extends object = ProOption
> = FormSchema<TModel, TOption>[]

export type FormFieldProp = string | string[]
export type FormValidationCallback = (isValid: boolean, invalidFields?: unknown) => void

export interface FormMethodsType<TModel extends FormModel = FormModel>
  extends ProRequestControl<TModel> {
  submit: () => Promise<boolean>
  reset: () => void
  validate: (handle?: (model: TModel) => void) => Promise<boolean>
  resetFields: () => void
  clearValidate: (props?: FormFieldProp | FormFieldProp[]) => void
  validateField: (
    props?: FormFieldProp | FormFieldProp[],
    callback?: FormValidationCallback
  ) => Promise<boolean>
  scrollToField: (prop: FormFieldProp) => void
  // 强制更新 数据
  forceUpdateModel: (model?: Partial<TModel>) => void
  setFieldValue: <TValue = unknown>(name: ProPath, value: TValue) => void
  getFieldValue: <TValue = unknown>(name: ProPath) => TValue | undefined
  clearFieldValue: (name: ProPath) => void
  getFieldsValue: (options?: GetFormValuesOptions) => TModel
  setFieldErrors: (errors: FormFieldErrorsInput<TModel>) => void
  clearFieldErrors: (names?: FormFieldProp | FormFieldProp[]) => void
  getCollapsed: () => boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapse: () => void
  load: () => Promise<TModel>
  getLoading: () => boolean
  getSubmitting: () => boolean
  isDirty: () => boolean
  markClean: () => void
}

export interface ProFormProps<TModel extends FormModel = FormModel>
  extends Omit<Partial<EpFormProps>, 'inline' | 'model'> {
  fields?: FormSchema<TModel>[]
  model?: TModel
  loading?: boolean
  dirty?: boolean
  inline?: boolean
  enableEffect?: boolean
  layout?: boolean
  /** undefined 时仅 inline 表单显示默认 actions；false 时始终隐藏。 */
  submitter?: false | ProFormSubmitterConfig
  collapsible?: boolean
  collapsed?: boolean
  defaultCollapsed?: boolean
  collapsedRows?: ProFormCollapsedRows
  expandOnInvalid?: boolean
  request?: (context: ProRequestContext) => Promise<Partial<TModel>>
  autoRequest?: boolean
  requestDebounce?: number
  requestRetry?: number
  requestRetryDelay?: ProRequestExecuteOptions['retryDelay']
  onFinish?: (values: TModel) => unknown | Promise<unknown>
}
