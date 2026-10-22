# ProForm 表单

ProForm 是 Schema 驱动的高级表单组件，通过 `fields` 配置字段即可生成完整的表单。内置栅格布局、校验、字段联动、折叠、提交与重置等能力，底层字段统一由 ProField 渲染，编辑态与只读态共享格式化规则。

## 基础用法

通过 `model` 绑定表单数据，`fields` 描述字段（key/valueType/col 等），`onFinish` 接收校验通过后的提交值。`submitter` 可自定义提交与重置按钮文案。

:::demo Schema 驱动表单，包含文本、选择、数字、开关字段，提交后展示 JSON
pro-form/basic
:::

## useProForm 查询表单

`useProForm` 除了提供表单命令（`validate`、`setFieldValue` 等），还内置查询参数维护：提交/重置时自动把表单值写入 `params`，配合 ProTable 的 `:params` 或 `usePagedList` 的 `params`，参数变化自动回第一页重新请求，不再需要手写 search 函数：

```ts
// ❌ 之前：每个页面都要手写一遍
function search(val: { scopeName?: string }) {
  params.value = Object.assign({}, params.value, val)
}
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProForm } from '@framebase/element-plus-pro-components'

const formRef = ref()

const searchFields = [
  { key: 'scopeName', label: '名称', valueType: 'input' },
  { key: 'status', label: '状态', valueType: 'select', valueEnum: {...} }
]

const { params, search, reset } = useProForm<{
  scopeName?: string
  status?: string
}>(formRef, {
  removeEmpty: true // 提交时去掉 '' / null / undefined / []
})
</script>

<template>
  <!-- search / reset 直接作为事件处理器：事件携带的表单值写入 params -->
  <pro-form
    ref="formRef"
    inline
    :fields="searchFields"
    :action-props="{ autoOffset: false }"
    @submit="search"
    @reset="reset"
  />

  <pro-table :columns="columns" :request="request" :params="params" />
</template>
```

`search` / `reset` 都是双模式函数：

- **带值调用**（作为 `@submit` / `@reset` 事件处理器）：事件携带的表单值直接写入 `params`（提交前表单已完成校验，不会重复校验；`@reset` 路径不会二次 reset）
- **无参调用**（程序化触发）：`search()` 校验通过后读取表单值写入 `params`；`reset()` 重置表单后写入重置值

两者都返回是否发生更新（值未变化时为 `false`）。需要在 `params` 变化时做额外事情（如埋点、额外请求），直接 `watch(params, cb)`。

搭配 `usePagedList` / `useCrud` 时，把 `params` 作为查询参数传入即可：

```ts
const table = usePagedList({
  request,
  params: () => form.params.value
})
```

需要额外查询条件（非表单来源，如 Tab、排序）时在绑定处组合：

```ts
params: () => ({ ...form.params.value, tab: activeTab.value })
```

### 查询相关返回值

| 属性     | 类型                            | 说明                                                  |
| -------- | ------------------------------- | ----------------------------------------------------- |
| `params` | `Ref<TModel>`                   | 当前查询参数，整体替换更新；绑定到 ProTable `:params` |
| `search` | `(values?) => Promise<boolean>` | 查询；`@submit` 事件处理器或无参程序化调用            |
| `reset`  | `(values?) => Promise<boolean>` | 重置；`@reset` 事件处理器或无参程序化调用             |

### UseProFormOptions

| 属性            | 类型                         | 默认值  | 说明                                                          |
| --------------- | ---------------------------- | ------- | ------------------------------------------------------------- |
| `initialValues` | `Partial<TModel>`            | `{}`    | 初始查询参数                                                  |
| `transform`     | `(values: TModel) => TModel` | —       | 值进入 `params` 前的最后加工（改写 key、补充派生参数等）      |
| `removeEmpty`   | `boolean`                    | `false` | 移除空值（`''` / `null` / `undefined` / `[]`）后再写入 params |

### 设计说明

- **整体替换而非合并**：每次提交/重置都用最新表单值整体替换 `params`，字段被移除后不会残留旧查询条件；额外的非表单参数在表格绑定处组合。
- **值未变化则跳过更新**：重复点击查询不会触发重复请求；强制刷新请使用表格的 `reload` / `refresh`。
- 不传 options 时查询能力保持惰性（`params` 初始为 `{}`），原有 `useProForm(formRef)` 用法完全不受影响。

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
