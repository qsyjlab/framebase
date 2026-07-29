# useTableFilters

表格筛选状态：`Record<field, value[]>` + 可选 URL 同步。匹配 Element Plus `el-table` 的 `filter-change` 事件。

## 用法

```ts
import { useTableFilters } from '@framebase/vue'

const { filters, hasFilters, setFilter, clear, clearAll } = useTableFilters({
  initial: { status: ['active'] },
  onChange: f => fetchList(f)
})

// el-table
// <el-table-column :filters="..." :filter-method="..." @filter-change="onFilterChange">
function onFilterChange(newFilters) {
  for (const [field, values] of Object.entries(newFilters)) {
    setFilter(field, values ?? [])
  }
}
```

## URL 同步

```ts
const { filters } = useTableFilters({
  urlKey: 'filters' // 持久化到 ?filters={"status":["active"]}
})
```

## 签名

```ts
function useTableFilters(options?: UseTableFiltersOptions): UseTableFiltersReturn
```

## 返回值

| 属性         | 类型                      | 说明                                     |
| ------------ | ------------------------- | ---------------------------------------- |
| `filters`    | `Ref<TableFilters>`       | `Record<field, value[]>`，空数组自动剪枝 |
| `hasFilters` | `ComputedRef<boolean>`    | 是否有活跃筛选                           |
| `setFilter`  | `(field, values) => void` | 设置字段筛选，空数组清除该字段           |
| `clear`      | `(field) => void`         | 清除单个字段                             |
| `clearAll`   | `() => void`              | 清除所有                                 |
| `reset`      | `() => void`              | 恢复到初始                               |

## 说明

### 空数组即无筛选

`setFilter('status', [])` 等价于 `clear('status')`。URL 同步时空数组字段会被剪枝，保持 query 干净。
