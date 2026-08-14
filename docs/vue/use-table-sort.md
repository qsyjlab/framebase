# useTableSort

表格单列排序状态：`{ field, order }` + 可选 URL 同步。匹配 Element Plus `el-table` 的 `sort-change` 语义。

## 用法

```ts
import { useTableSort } from '@framebase/vue'

const { state, hasSort, setSort, clear } = useTableSort({
  initial: { field: 'id', order: 'desc' },
  onChange: s => fetchList(s)
})

// el-table
// <el-table :data="data" @sort-change="onSortChange">
function onSortChange({ prop, order }) {
  setSort(prop, order) // order: 'ascending' | 'descending' | null
}
```

## URL 同步

```ts
const { state } = useTableSort({
  urlKey: 'sort', // 持久化到 ?sort={"field":"id","order":"desc"}
  urlOptions: { history: 'replace' }
})
```

## 签名

```ts
function useTableSort(options?: UseTableSortOptions): UseTableSortReturn
```

## 参数

### UseTableSortOptions

| 属性         | 类型                                           | 默认值                         | 说明                      |
| ------------ | ---------------------------------------------- | ------------------------------ | ------------------------- |
| `initial`    | `TableSortState`                               | `{ field: null, order: null }` | 初始排序                  |
| `urlKey`     | `string`                                       | —                              | 设置后持久化到 URL 该 key |
| `urlOptions` | `Omit<UrlStateOptions<TableSortState>, 'key'>` | —                              | 透传 `useUrlState` 选项   |
| `onChange`   | `(state: TableSortState) => void`              | —                              | 排序变化回调              |

## 返回值

| 属性      | 类型                     | 说明                                          |
| --------- | ------------------------ | --------------------------------------------- |
| `state`   | `Ref<TableSortState>`    | `{ field: string \| null, order: SortOrder }` |
| `hasSort` | `ComputedRef<boolean>`   | 是否有活跃排序                                |
| `setSort` | `(field, order) => void` | 设置排序，`order: null` 清除                  |
| `clear`   | `() => void`             | 清除排序                                      |
| `reset`   | `() => void`             | 恢复到初始                                    |

### SortOrder

`'asc' | 'desc' | null`
