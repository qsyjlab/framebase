# useSelection

行选择状态，可选跨页保留。维护 `selectedKeys` 与 `key -> record` 缓存，即使可见数据翻页后，已选记录仍可取回。

## 用法

```ts
import { useSelection } from '@framebase/vue'
import { ref } from 'vue'

interface Row {
  id: number
  name: string
}

const tableData = ref<Row[]>([
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Bob' }
])

const {
  selectedKeyList, // Ref<(string | number)[]>
  resolveRowKey, // (record) => key
  isSelected, // (record) => boolean
  toggleSelection, // (record, selected) => void
  clearSelection,
  syncSelectedKeys, // 外部受控更新
  cacheVisibleRecords,
  getSelectedRows
} = useSelection<Row>({
  data: tableData, // Ref<Row[]>，可见数据
  rowKey: () => 'id', // 路径字符串或函数
  reserveSelection: () => true, // 跨页保留
  selectedKeys: () => [], // 受控初始值
  onChange: (keys, records) => {
    console.log('selected:', keys, records)
  }
})

// 单选切换
toggleSelection(tableData.value[0], true)
isSelected(tableData.value[0]) // true

// 缓存当前可见的已选记录，便于翻页后仍能取回
cacheVisibleRecords()

// 取出已选记录（优先用缓存，缓存缺失时回查 data）
getSelectedRows() // [{ id: 1, name: 'Ada' }]

// 清空
clearSelection()

// 外部受控更新
syncSelectedKeys([2])
```

## 签名

```ts
function useSelection<TRecord extends object>(
  options: UseSelectionOptions<TRecord>
): UseSelectionReturn<TRecord>
```

## 参数

### UseSelectionOptions

| 属性               | 类型                                                 | 说明                             |
| ------------------ | ---------------------------------------------------- | -------------------------------- |
| `data`             | `Ref<TRecord[]>`                                     | 可见数据（响应式）               |
| `rowKey`           | `() => RowKeyResolver<TRecord>`                      | 行键解析器，返回路径字符串或函数 |
| `reserveSelection` | `() => boolean`                                      | 是否跨页保留已选记录             |
| `selectedKeys`     | `() => SelectionKey[]`                               | 受控初始已选 keys                |
| `onChange`         | `(keys: SelectionKey[], records: TRecord[]) => void` | 选择变化回调                     |

### RowKeyResolver

`rowKey` 返回值的三种形式：

| 类型                                           | 说明                                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `string`                                       | 路径字符串，委托 `@framebase/core` 的 `getPathValue` 解析，支持 `'id'`、`'user.id'`、`'items[0].id'` |
| `number`                                       | 直接作为索引                                                                                         |
| `(record, index) => SelectionKey \| undefined` | 函数，自定义键计算逻辑                                                                               |

## 返回值

### UseSelectionReturn

| 属性                  | 类型                             | 说明                                               |
| --------------------- | -------------------------------- | -------------------------------------------------- |
| `selectedKeyList`     | `Ref<SelectionKey[]>`            | 当前已选 keys                                      |
| `resolveRowKey`       | `(record) => SelectionKey`       | 解析行键，缺失时回退为 `record` 在 `data` 中的索引 |
| `isSelected`          | `(record) => boolean`            | 是否已选                                           |
| `toggleSelection`     | `(record, selected) => void`     | 切换选择状态                                       |
| `clearSelection`      | `() => void`                     | 清空选择                                           |
| `syncSelectedKeys`    | `(keys: SelectionKey[]) => void` | 外部受控更新已选 keys                              |
| `cacheVisibleRecords` | `() => void`                     | 缓存当前可见且已选的记录                           |
| `getSelectedRows`     | `() => TRecord[]`                | 取出已选记录（优先用缓存，缓存缺失时回查 `data`）  |

## 类型声明

```ts
type SelectionKey = string | number
type RowKeyResolver<TRecord> =
  | string
  | number
  | ((record: TRecord, index: number) => SelectionKey | undefined)

interface UseSelectionOptions<TRecord> {
  data: Ref<TRecord[]>
  rowKey: () => RowKeyResolver<TRecord>
  reserveSelection: () => boolean
  selectedKeys: () => SelectionKey[]
  onChange: (keys: SelectionKey[], records: TRecord[]) => void
}

interface UseSelectionReturn<TRecord> {
  selectedKeyList: Ref<SelectionKey[]>
  resolveRowKey: (record: TRecord) => SelectionKey
  isSelected: (record: TRecord) => boolean
  toggleSelection: (record: TRecord, selected: boolean) => void
  clearSelection: () => void
  syncSelectedKeys: (keys: SelectionKey[]) => void
  cacheVisibleRecords: () => void
  getSelectedRows: () => TRecord[]
}
```

## 说明

### 跨页保留

`reserveSelection: true` 时，已选记录会缓存到内部 `Map<SelectionKey, TRecord>`。翻页后 `data` 变化，已选 keys 不会丢，`getSelectedRows()` 仍可返回完整已选记录。

调用 `cacheVisibleRecords()` 的时机：每次 `data` 变更后（如分页切换、刷新），由调用方主动触发，把当前可见的已选记录写入缓存。

### getSelectedRows 的回查策略

优先用缓存中的记录；若某条 key 在缓存里找不到（例如 `reserveSelection: false` 翻页后），会从当前 `data` 里按 key 回查；都找不到的 key 会被跳过。
