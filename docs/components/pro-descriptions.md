# ProDescriptions 描述列表

ProDescriptions 是基于 Element Plus Descriptions 封装的描述列表组件，用于展示对象的详细信息。每个列基于 ProField 的只读态渲染，自动复用 `valueType`/`valueEnum` 的格式化规则，支持分组、折叠、复制、远程请求等能力。

## 基础用法

通过 `columns` 定义列，`data` 传入展示对象。`valueType` 控制格式化方式，`valueEnum` 用于枚举字段的状态标签渲染。

:::demo 展示用户信息，状态字段使用 valueEnum 渲染为标签
pro-descriptions/basic
:::

## Props

| 参数             | 说明                               | 类型                                            | 默认值                 |
| ---------------- | ---------------------------------- | ----------------------------------------------- | ---------------------- |
| data             | 展示的数据对象                     | `TRecord`                                       | —                      |
| columns          | 列配置，详见 ProDescriptionsColumn | `ProDescriptionColumns<TRecord>`                | `[]`                   |
| request          | 远程获取数据的函数                 | `(params, context) => Promise<TRecord>`         | —                      |
| params           | 请求参数                           | `TParams`                                       | `{}`                   |
| autoRequest      | 是否自动请求                       | `boolean`                                       | `true`                 |
| loading          | 自定义加载状态                     | `boolean`                                       | —                      |
| title            | 标题                               | `string`                                        | —                      |
| border           | 是否显示边框                       | `boolean`                                       | `true`                 |
| column           | 列数（支持响应式）                 | `number \| Partial<Record<Breakpoint, number>>` | `{ xs:1, sm:2, md:3 }` |
| direction        | 排列方向                           | `'horizontal' \| 'vertical'`                    | `'horizontal'`         |
| size             | 尺寸                               | `'large' \| 'default' \| 'small'`               | —                      |
| labelWidth       | 标签宽度                           | `string \| number`                              | —                      |
| groupTitles      | 分组标题映射                       | `Record<string, string>`                        | —                      |
| collapsible      | 是否可折叠                         | `boolean`                                       | `false`                |
| collapsed        | 是否折叠（v-model）                | `boolean`                                       | —                      |
| defaultCollapsed | 默认是否折叠                       | `boolean`                                       | `false`                |
| collapsedRows    | 折叠时显示的行数                   | `number \| Partial<Record<Breakpoint, number>>` | `1`                    |
| emptyText        | 空数据提示文案                     | `string`                                        | —                      |

### ProDescriptionsColumn

| 参数        | 说明                        | 类型                                            | 默认值 |
| ----------- | --------------------------- | ----------------------------------------------- | ------ |
| key         | 列唯一标识                  | `string`                                        | —      |
| dataIndex   | 取值字段路径                | `ProDataIndex<TRecord>`                         | —      |
| label       | 标签                        | `string`                                        | —      |
| group       | 所属分组                    | `string`                                        | —      |
| span        | 跨列数                      | `number \| Partial<Record<Breakpoint, number>>` | —      |
| width       | 宽度                        | `string \| number`                              | —      |
| minWidth    | 最小宽度                    | `string \| number`                              | —      |
| align       | 内容对齐                    | `'left' \| 'center' \| 'right'`                 | —      |
| valueType   | 字段值类型（复用 ProField） | `ProFieldValueType`                             | —      |
| valueEnum   | 枚举映射                    | `ProFieldValueEnum`                             | —      |
| options     | 选项列表                    | `ProOption[]`                                   | —      |
| fieldProps  | 字段组件属性                | `Record<string, unknown>`                       | —      |
| emptyText   | 空值占位                    | `string`                                        | —      |
| tooltip     | 标签提示                    | `string`                                        | —      |
| copyable    | 是否可复制                  | `boolean \| ProDescriptionsCopyConfig`          | —      |
| hide        | 是否隐藏                    | `boolean \| ((data) => boolean)`                | —      |
| formatter   | 自定义格式化                | `(value) => unknown`                            | —      |
| render      | 自定义内容渲染              | `(scope) => VNodeChild`                         | —      |
| renderLabel | 自定义标签渲染              | `(scope) => VNodeChild`                         | —      |

## 类型

```ts
interface ProDescriptionsColumn<TRecord, TValue = unknown> {
  key: string
  dataIndex?: ProDataIndex<TRecord>
  label?: string
  group?: string
  span?: number | Partial<Record<Breakpoint, number>>
  width?: string | number
  align?: 'left' | 'center' | 'right'
  valueType?: ProFieldValueType
  valueEnum?: ProFieldValueEnum
  options?: ProOption[]
  emptyText?: string
  tooltip?: string
  copyable?: boolean | ProDescriptionsCopyConfig
  hide?: boolean | ((data: TRecord) => boolean)
  formatter?: (value: TValue) => unknown
  render?: (scope: ProDescriptionsRenderScope<TRecord, TValue>) => VNodeChild
  renderLabel?: (scope: ProDescriptionsRenderScope<TRecord, TValue>) => VNodeChild
}

type ProDescriptionColumns<TRecord extends object = Record<string, unknown>> =
  ProDescriptionsColumn<TRecord>[]
```
