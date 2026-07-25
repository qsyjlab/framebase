# ProField 字段

ProField 是统一字段渲染组件，同一 `valueType` 在编辑态（`mode="edit"`）和只读态（`mode="read"`）共享相同的格式化规则。它是 ProForm、ProTable、ProDescriptions 等组件的底层渲染单元，也可单独使用以快速展示或编辑某一类型的值。

## 基础用法

通过 `valueType` 指定值类型，`mode` 切换编辑/只读态。`money` 类型自动按货币格式化，`status` 配合 `valueEnum` 渲染为标签。

:::demo 展示 text/money/status/select 等 valueType 的编辑态与只读态
pro-field/basic
:::

## Props

| 参数       | 说明                 | 类型                          | 默认值   |
| ---------- | -------------------- | ----------------------------- | -------- |
| modelValue | 字段值（v-model）    | `TValue`                      | —        |
| mode       | 渲染模式             | `'read' \| 'edit'`            | `'read'` |
| valueType  | 值类型，详见下表     | `ProFieldValueType`           | —        |
| valueEnum  | 枚举映射             | `ProFieldValueEnum`           | —        |
| options    | 选项列表             | `ProOption[]`                 | —        |
| fieldProps | 传递给底层组件的属性 | `Record<string, unknown>`     | —        |
| emptyText  | 只读态空值占位       | `string`                      | —        |
| disabled   | 是否禁用             | `boolean`                     | —        |
| readonly   | 是否只读             | `boolean`                     | —        |
| block      | 是否块级渲染         | `boolean`                     | —        |
| formatter  | 自定义格式化函数     | `(value, context) => unknown` | —        |

### valueType 列表

| valueType  | 说明     | 编辑态组件       | 只读态展示                 |
| ---------- | -------- | ---------------- | -------------------------- |
| `text`     | 文本     | ElInput          | 文本                       |
| `textarea` | 多行文本 | ElInput textarea | 文本                       |
| `number`   | 数字     | ElInputNumber    | 数字                       |
| `money`    | 金额     | ElInputNumber    | 按货币格式化               |
| `percent`  | 百分比   | ElInputNumber    | 百分比                     |
| `date`     | 日期     | ElDatePicker     | 日期文本                   |
| `datetime` | 日期时间 | ElDatePicker     | 日期时间文本               |
| `select`   | 下拉选择 | ElSelect         | valueEnum/options 映射文本 |
| `radio`    | 单选组   | ElRadioGroup     | 映射文本                   |
| `checkbox` | 多选组   | ElCheckboxGroup  | 映射文本                   |
| `switch`   | 开关     | ElSwitch         | 是/否                      |
| `tag`      | 标签     | ElInput          | ElTag                      |
| `status`   | 状态     | ElSelect         | ElTag（带 type）           |
| `enum`     | 枚举     | ElSelect         | 映射文本                   |
| `progress` | 进度     | ElSlider         | ElProgress                 |
| `image`    | 图片     | ElUpload         | ElImage                    |

`valueType` 也支持对象形式 `{ type, currency, precision, dateFormat, locale }` 以传递额外配置。

## 类型

```ts
type ProFieldMode = 'read' | 'edit'

type ProFieldBuiltinValueType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'money'
  | 'percent'
  | 'date'
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'enum'
  | 'tag'
  | 'status'
  | 'progress'
  | 'image'
  | 'upload'

interface ProFieldValueTypeConfig {
  type: ProFieldBuiltinValueType
  currency?: string
  locale?: string
  precision?: number
  dateFormat?: string
}

type ProFieldValueType = ProFieldBuiltinValueType | ProFieldValueTypeConfig

interface ProFieldValueEnumItem {
  text?: string
  color?: string
  type?: 'primary' | 'success' | 'warning' | 'info' | 'danger'
  disabled?: boolean
}

type ProFieldValueEnum =
  | Record<string, string | number | ProFieldValueEnumItem>
  | Map<ProChoiceValue, string | number | ProFieldValueEnumItem>
```
