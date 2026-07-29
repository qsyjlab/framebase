# usePagedList

分页列表请求：组合 [`usePagination`](./use-pagination) + [`useRequest`](./use-request)，分页或查询参数变化时自动发起请求，内部基于 `useRequest` 的 latest-wins 机制处理乱序响应与重复触发。

## 用法

### 基础用法

```ts
import { usePagedList } from '@framebase/vue'

interface User {
  id: number
  name: string
}

const { list, current, pageSize, total, loading, reload, refresh } = usePagedList<User>({
  request: async params => {
    // params = { current, pageSize }
    const res = await fetch(`/api/users?page=${params.current}&size=${params.pageSize}`)
    return { data: res.items, total: res.total }
  },
  pageSize: 10
})

// 挂载时自动发起首次请求（immediate: true）
// 分页变化（current/pageSize）自动请求
list.value // 当前页数据
total.value // 总条数
loading.value // 请求中状态
```

### 携带查询参数

`params` 为响应式 getter，变化时自动回到第一页重新请求。

```ts
import { ref } from 'vue'
import { usePagedList } from '@framebase/vue'

const keyword = ref('')

const { list, refresh } = usePagedList<User, { keyword: string }>({
  request: async params => {
    // params = { current, pageSize, keyword }
    const res = await fetch(`/api/users?keyword=${params.keyword}&page=${params.current}`)
    return { data: res.items, total: res.total }
  },
  params: () => ({ keyword: keyword.value }),
  pageSize: 10
})

// keyword 变化 → 自动回第一页请求
keyword.value = 'foo'
```

### 关闭自动请求

```ts
const { reload } = usePagedList({
  request: async () => ({ data: [], total: 0 }),
  immediate: false
})

// 手动触发
reload()
```

## 签名

```ts
function usePagedList<TRecord, TParams extends Record<string, any> = Record<string, any>>(
  options: UsePagedListOptions<TRecord, TParams>
): UsePagedListReturn<TRecord, TParams>
```

## 参数

### UsePagedListOptions

| 属性        | 类型                                               | 默认值 | 说明                                         |
| ----------- | -------------------------------------------------- | ------ | -------------------------------------------- |
| `request`   | `(params, ctx) => Promise<PagedResponse<TRecord>>` | -      | 请求函数，接收分页与查询参数合并值           |
| `current`   | `number`                                           | `1`    | 初始页码                                     |
| `pageSize`  | `number`                                           | `10`   | 每页条数                                     |
| `params`    | `MaybeRefOrGetter<TParams>`                        | -      | 查询参数（响应式），变化时回到第一页重新请求 |
| `immediate` | `boolean`                                          | `true` | 是否在挂载时自动发起首次请求                 |
| `debounce`  | `number`                                           | -      | 请求防抖（ms）                               |

### PagedListRequestParams

`request` 函数的 `params` 参数类型。

```ts
interface PagedListRequestParams {
  current: number
  pageSize: number
}
```

## 返回值

### UsePagedListReturn

| 属性             | 类型                                     | 说明                                            |
| ---------------- | ---------------------------------------- | ----------------------------------------------- |
| `list`           | `ComputedRef<TRecord[]>`                 | 当前页数据列表，取自 `data.value.data`          |
| `data`           | `ShallowRef<PagedResponse \| undefined>` | 最近一次归一化后的完整响应                      |
| `current`        | `Ref<number>`                            | 当前页                                          |
| `pageSize`       | `Ref<number>`                            | 每页大小                                        |
| `total`          | `Ref<number>`                            | 总条数，请求成功后自动更新                      |
| `pageInfo`       | `Ref<PageInfo>`                          | `{ current, pageSize }`                         |
| `setCurrent`     | `(current: number) => void`              | 设置当前页，自动触发请求                        |
| `setPageSize`    | `(pageSize: number) => void`             | 设置每页大小，自动触发请求                      |
| `setPageInfo`    | `(pageInfo: Partial<PageInfo>) => void`  | 批量更新分页                                    |
| `reset`          | `() => void`                             | 重置为初始分页                                  |
| `loading`        | `ComputedRef<boolean>`                   | 请求中状态                                      |
| `initialLoading` | `ComputedRef<boolean>`                   | 首次加载中（loading 且 action 为 `initial`）    |
| `error`          | `ShallowRef<unknown>`                    | 请求错误                                        |
| `phase`          | `ShallowRef<RequestPhase>`               | 请求阶段：`idle \| pending \| success \| error` |
| `reload`         | `() => Promise<void>`                    | 重新请求当前页                                  |
| `refresh`        | `() => Promise<void>`                    | 回到第一页重新请求                              |
| `cancel`         | `() => void`                             | 取消进行中的请求                                |

## 类型声明

```ts
interface PagedResponse<TData> {
  data: TData[]
  total: number
  success?: boolean
}

interface UsePagedListOptions<TRecord, TParams> {
  request: (
    params: PagedListRequestParams & TParams,
    ctx: RequestContext
  ) => Promise<PagedResponse<TRecord>>
  current?: number
  pageSize?: number
  params?: MaybeRefOrGetter<TParams>
  immediate?: boolean
  debounce?: number
}
```

## 说明

### 自动请求时机

- **挂载时**：`immediate: true`（默认）自动发起首次请求，action 为 `initial`
- **分页变化**：`current` 或 `pageSize` 变化自动请求，action 为 `page`
- **查询参数变化**：`params` 变化自动回到第一页请求；若当前已在第一页则直接请求

### 响应归一化

请求返回后，响应会经过 [`normalizePagedResponse`](../core/normalize-paged-response) 处理：

- `data` 缺失或非数组 → 空数组 `[]`
- `total` 缺失或非数字 → `0`
- `success` 原样保留

### latest-wins

基于 [`useRequest`](./use-request) 的 latest-wins 机制：快速翻页时，后发的请求结果会覆盖先发的，乱序响应不会污染数据。

### 与全局配置的关系

`immediate` / `debounce` / `pageSize` 会读取 [全局 hook 配置](./use-hook-config) 的默认值，调用方显式传入的参数优先级更高。
