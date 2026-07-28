# usePagination

响应式分页状态容器，管理 `current` / `pageSize` / `total`，提供变更原因订阅。

## 用法

```ts
import { usePagination } from '@framebase/vue'

const {
  current, // Ref<number>
  pageSize, // Ref<number>
  total, // Ref<number>
  pageInfo, // ComputedRef<PageInfo>
  isLastPage, // ComputedRef<boolean>
  setCurrent,
  setPageSize,
  setTotal,
  setPageInfo,
  reset,
  onChange
} = usePagination({ current: 1, pageSize: 10 })

// 订阅变化，reason 区分 'init' | 'current' | 'size' | 'reset' | 'external'
const unsubscribe = onChange(({ pageInfo, previous, reason }) => {
  console.log(`${previous.current} -> ${pageInfo.current} (${reason})`)
  // 在这里触发后端请求
})

setPageSize(20) // reason: 'size'，自动重置 current 为 1
```

## 签名

```ts
function usePagination(options?: PaginationOptions): UsePaginationReturn
```

## 参数

### PaginationOptions

| 属性       | 类型     | 默认值 | 说明     |
| ---------- | -------- | ------ | -------- |
| `current`  | `number` | `1`    | 当前页   |
| `pageSize` | `number` | `10`   | 每页大小 |
| `total`    | `number` | `0`    | 总条数   |

## 返回值

### UsePaginationReturn

| 属性          | 类型                                             | 说明                                                              |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `current`     | `Ref<number>`                                    | 当前页                                                            |
| `pageSize`    | `Ref<number>`                                    | 每页大小                                                          |
| `total`       | `Ref<number>`                                    | 总条数                                                            |
| `pageInfo`    | `ComputedRef<PageInfo>`                          | `{ current, pageSize }` 派生                                      |
| `isLastPage`  | `ComputedRef<boolean>`                           | `total` 已知且当前页超出最后一页时为 `true`                       |
| `setCurrent`  | `(current: number, reason?) => void`             | 设置当前页                                                        |
| `setPageSize` | `(pageSize: number, reason?) => void`            | 设置每页大小，**会自动重置 `current` 为 `1`，reason 为 `'size'`** |
| `setTotal`    | `(total: number) => void`                        | 设置总条数                                                        |
| `setPageInfo` | `(pageInfo: Partial<PageInfo>, reason?) => void` | 批量更新                                                          |
| `reset`       | `(reason?) => void`                              | 重置为初始值，reason 为 `'reset'`                                 |
| `onChange`    | `(listener) => () => void`                       | 订阅变化，返回取消订阅函数                                        |

### PaginationChangeContext

`onChange` 回调的参数。

| 属性       | 类型                                                     | 说明                             |
| ---------- | -------------------------------------------------------- | -------------------------------- |
| `pageInfo` | `PageInfo`                                               | 变更后的 `{ current, pageSize }` |
| `previous` | `PageInfo`                                               | 变更前的 `pageInfo`              |
| `reason`   | `'init' \| 'current' \| 'size' \| 'reset' \| 'external'` | 变更原因                         |

## 类型声明

```ts
interface PageInfo {
  current: number
  pageSize: number
}

interface UsePaginationReturn {
  current: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  pageInfo: ComputedRef<PageInfo>
  isLastPage: ComputedRef<boolean>
  setCurrent: (current: number, reason?: PaginationChangeContext['reason']) => void
  setPageSize: (pageSize: number, reason?: PaginationChangeContext['reason']) => void
  setTotal: (total: number) => void
  setPageInfo: (pageInfo: Partial<PageInfo>, reason?: PaginationChangeContext['reason']) => void
  reset: (reason?: PaginationChangeContext['reason']) => void
  onChange: (listener: (ctx: PaginationChangeContext) => void) => () => void
}
```

## 说明

### reason 的作用

`reason` 用于下游（如 ProTable）根据变更原因选择不同的请求 action：`'size'` 通常需要重置到第一页重新请求，`'current'` 只是翻页，`'external'` 表示外部受控更新。

### 跨页保留

`usePagination` 本身不处理选择状态，跨页保留由 [`useSelection`](./use-selection) 配合实现。

### PageInfo 来源

`PageInfo` 类型从 `@framebase/core` 复用，跨包一致。非 Vue 消费者也能描述分页状态。
