# ProForm 表单

ProForm 是 Schema 驱动的高级表单组件，通过 `fields` 配置字段即可生成完整的表单。内置栅格布局、校验、字段联动、折叠、提交与重置等能力，底层字段统一由 ProField 渲染，编辑态与只读态共享格式化规则。

## 基础用法

通过 `model` 绑定表单数据，`fields` 描述字段（key/valueType/col 等），`onFinish` 接收校验通过后的提交值。`submitter` 可自定义提交与重置按钮文案。

:::demo Schema 驱动表单，包含文本、选择、数字、开关字段，提交后展示 JSON
pro-form/basic
:::

## Props

| 参数             | 说明                              | 类型                                              | 默认值 |
| ---------------- | --------------------------------- | ------------------------------------------------- | ------ |
| model            | 表单数据模型（双向绑定）          | `TModel`                                          | —      |
| fields           | 字段 Schema 配置，详见 FormSchema | `FormSchema<TModel>[]`                            | —      |
| loading          | 自定义加载状态                    | `boolean`                                         | —      |
| inline           | 是否行内表单                      | `boolean`                                         | —      |
| layout           | 是否启用栅格布局                  | `boolean`                                         | —      |
| submitter        | 提交区配置，false 隐藏            | `false \| ProFormSubmitterConfig`                 | —      |
| labelWidth       | 标签宽度                          | `string \| number`                                | —      |
| labelPosition    | 标签位置                          | `'left' \| 'right' \| 'top'`                      | —      |
| size             | 表单尺寸                          | `'large' \| 'default' \| 'small'`                 | —      |
| collapsible      | 是否可折叠                        | `boolean`                                         | —      |
| collapsed        | 是否折叠（v-model）               | `boolean`                                         | —      |
| defaultCollapsed | 默认是否折叠                      | `boolean`                                         | —      |
| collapsedRows    | 折叠时显示的行数                  | `number \| Partial<Record<Breakpoint, number>>`   | —      |
| request          | 远程初始化表单的函数              | `(context) => Promise<Partial<TModel>>`           | —      |
| autoRequest      | 是否自动请求初始化                | `boolean`                                         | —      |
| onFinish         | 提交回调，校验通过后触发          | `(values: TModel) => unknown \| Promise<unknown>` | —      |

### ProFormSubmitterConfig

| 参数              | 说明              | 类型                           | 默认值 |
| ----------------- | ----------------- | ------------------------------ | ------ |
| submitText        | 提交按钮文案      | `string`                       | —      |
| resetText         | 重置按钮文案      | `string`                       | —      |
| showSubmit        | 是否显示提交按钮  | `boolean`                      | —      |
| showReset         | 是否显示重置按钮  | `boolean`                      | —      |
| showCollapse      | 是否显示展开/收起 | `boolean`                      | —      |
| submitButtonProps | 提交按钮属性      | `Partial<ButtonProps>`         | —      |
| resetButtonProps  | 重置按钮属性      | `Partial<ButtonProps>`         | —      |
| col               | 提交区栅格配置    | `Partial<ColProps>`            | —      |
| align             | 提交区对齐        | `'start' \| 'center' \| 'end'` | —      |

## 类型

```ts
type FormModel = Record<string, any>

interface FormSchema<TModel extends FormModel = FormModel> {
  /** 列表渲染的稳定标识，不参与字段取值 */
  key: string | number
  /** 表单字段路径；未设置时使用 key */
  name?: FormFieldPath<TModel>
  /** 标题 */
  label?: string
  /** 使用 ProField 渲染时的值类型 */
  valueType?: ProFieldValueType
  /** 枚举映射 */
  valueEnum?: ProFieldValueEnum
  /** 选项列表（select/radio/checkbox 等） */
  options?: ProOption[]
  /** 组件属性 */
  fieldProps?: FormDynamicValue<TModel, Record<string, unknown>>
  /** 是否必填 */
  required?: boolean
  /** 校验规则 */
  rules?: FormDynamicValue<TModel, FormItemRule[]>
  /** 栅格布局 */
  col?: Partial<ColProps>
  /** tooltip 提示 */
  tip?: string
  /** 是否充满 content */
  fill?: boolean
  /** 是否显示在表单上 */
  show?: FormDynamicValue<TModel, boolean>
  /** 是否禁用 */
  disabled?: FormDynamicValue<TModel, boolean>
  /** 依赖字段，变化时重新计算 */
  dependencies?: FormFieldPath<TModel>[]
  /** 写入模型前的归一化 */
  normalize?: (value, previousValue, values) => unknown
  /** 提交值转换 */
  transform?: (value, context) => unknown
  /** 自定义渲染组件 */
  el?: Component | string
  /** 组件事件 */
  events?: Record<string, any>
}

/** ProForm 字段数组的简写类型 */
type ProFormSchema<TModel extends FormModel = FormModel> = FormSchema<TModel>[]
```
