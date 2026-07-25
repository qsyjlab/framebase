# ProTable 表格

ProTable 是基于 Element Plus Table 封装的高级表格组件，内置分页请求、状态渲染、列设置、密度切换、行选择等能力。通过 `columns` 配置列，`request` 函数返回分页数据，即可获得一个开箱即用的业务表格。

## 基础用法

通过 `columns` 定义列，`request` 函数接收分页参数并返回 `{ data, total, success }`。`valueType` 配合 `valueEnum` 可快速渲染金额、状态等格式化内容。

:::demo 通过 request 进行分页请求，状态列使用 valueEnum 渲染为标签
pro-table/basic
:::

## Props

| 参数             | 说明                                | 类型                                      | 默认值  |
| ---------------- | ----------------------------------- | ----------------------------------------- | ------- |
| columns          | 列配置，详见 ProTableColumn         | `ProTableColumns<TRecord>`                | —       |
| data             | 静态数据，设置后不会触发 request    | `TRecord[]`                               | `[]`    |
| request          | 分页请求函数                        | `(params, context) => Promise<TResponse>` | —       |
| params           | 额外查询参数，会合并到 request 入参 | `TQuery`                                  | `{}`    |
| responseAdapter  | 自定义响应适配器                    | `(response) => ProTableRequestResult`     | —       |
| pagination       | 分页配置，false 关闭                | `boolean \| ProTablePagination`           | `true`  |
| autoRequest      | 是否在挂载时自动请求                | `boolean`                                 | `true`  |
| rowKey           | 行唯一标识字段或函数                | `string \| ((row) => string\|number)`     | `'id'`  |
| checkable        | 是否显示多选列                      | `boolean`                                 | `false` |
| reserveSelection | 翻页是否保留选择                    | `boolean`                                 | `false` |
| selectedKeys     | 选中行的 key 列表（v-model）        | `Array<string \| number>`                 | `[]`    |
| headerTitle      | 表格标题                            | `string`                                  | —       |
| options          | 工具栏选项（刷新/密度/列设置）      | `boolean \| ProTableOptions`              | `true`  |
| columnsState     | 列状态配置（显隐/顺序/固定）        | `ProTableColumnsState`                    | —       |
| loading          | 自定义加载状态                      | `boolean`                                 | —       |
| border           | 是否显示边框                        | `boolean`                                 | `true`  |
| size             | 表格尺寸                            | `'large' \| 'default' \| 'small'`         | —       |
| height           | 表格高度                            | `number \| string`                        | —       |
| autoFitHeight    | 是否自适应容器高度                  | `boolean`                                 | `false` |
| showAlert        | 是否显示选择提示条                  | `boolean`                                 | `true`  |
| emptyText        | 空数据提示文案                      | `string`                                  | —       |

### ProTableColumn

| 参数         | 说明                      | 类型                              | 默认值 |
| ------------ | ------------------------- | --------------------------------- | ------ |
| key          | 列唯一标识                | `string`                          | —      |
| dataIndex    | 取值字段路径              | `ProDataIndex<TRecord>`           | —      |
| title        | 列标题                    | `string`                          | —      |
| width        | 列宽                      | `number \| string`                | —      |
| minWidth     | 最小列宽                  | `number \| string`                | —      |
| fixed        | 固定列                    | `'left' \| 'right' \| boolean`    | —      |
| align        | 对齐方式                  | `'left' \| 'center' \| 'right'`   | —      |
| valueType    | 字段值类型，复用 ProField | `ProFieldValueType`               | —      |
| valueEnum    | 枚举映射                  | `ProFieldValueEnum`               | —      |
| fieldProps   | 传递给字段组件的属性      | `Record<string, unknown>`         | —      |
| formatter    | 自定义格式化函数          | `(value) => unknown`              | —      |
| emptyText    | 空值占位文案              | `string`                          | —      |
| hideInTable  | 是否在表格中隐藏          | `boolean`                         | —      |
| serverSort   | 是否服务端排序            | `boolean \| string`               | —      |
| serverFilter | 是否服务端筛选            | `boolean \| string`               | —      |
| editable     | 是否可编辑                | `boolean \| ((scope) => boolean)` | —      |
| render       | 自定义单元格渲染          | `(scope) => VNodeChild`           | —      |
| children     | 子列（多级表头）          | `ProTableColumn[]`                | —      |

## Events

| 事件名               | 说明                     | 回调参数                              |
| -------------------- | ------------------------ | ------------------------------------- |
| update:selectedKeys  | 选中 key 变化（v-model） | `keys: Array<string \| number>`       |
| selection-change     | 选中行变化               | `rows: TRecord[]`                     |
| page-change          | 页码/页大小变化          | `current: number, pageSize: number`   |
| pagination-change    | 分页信息变化             | `pageInfo: ProTablePageInfo`          |
| sort-change          | 排序变化                 | `sorter: ProTableSorter \| undefined` |
| filter-change        | 筛选变化                 | `filters: ProTableFilters`            |
| update:loading       | 加载状态变化             | `loading: boolean`                    |
| update:data          | 数据变化                 | `data: TRecord[]`                     |
| request-state-change | 请求生命周期变化         | `lifecycle: ProTableRequestLifecycle` |
| request-error        | 请求出错                 | `error: unknown`                      |

## 类型

```ts
type ProTableRowKey<TRecord> = string | ((row: TRecord) => string | number)

interface ProTablePageInfo {
  current: number
  pageSize: number
}

type ProTableSortOrder = 'ascending' | 'descending'

interface ProTableSorter {
  key: string
  field?: string
  order: ProTableSortOrder
}

type ProTableFilters = Record<string, unknown[]>

interface ProTableServerState extends ProTablePageInfo {
  sorter?: ProTableSorter
  filters: ProTableFilters
}

// request 入参：查询参数 + 分页/排序/筛选状态
type ProTableRequestParams<TQuery extends object> = TQuery & ProTableServerState

// request 返回值
interface ProTableRequestResult<TRecord extends object> {
  data: TRecord[]
  total: number
  success?: boolean
}

interface ProTableColumn<TRecord, TValue = unknown> {
  key: string
  dataIndex?: ProDataIndex<TRecord>
  title?: string
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right' | boolean
  align?: 'left' | 'center' | 'right'
  valueType?: ProFieldValueType
  valueEnum?: ProFieldValueEnum
  fieldProps?: Record<string, unknown>
  formatter?: (value: TValue) => unknown
  hideInTable?: boolean
  serverSort?: boolean | string
  editable?: boolean | ((scope) => boolean)
  render?: (scope) => VNodeChild
  children?: ProTableColumn<TRecord>[]
}

type ProTableColumns<TRecord extends object> = ProTableColumn<TRecord>[]
```
