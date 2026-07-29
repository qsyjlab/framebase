# useInfiniteList

无限滚动列表：按需加载下一页并累积合并，支持 `reload` 清空重载。内部基于 `useRequest` 的 latest-wins 与 abort 机制。

与 `usePagedList`（每次翻页替换当前页）不同，`useInfiniteList` 保留已加载的所有记录，`list` 持续增长。

## 用法

```ts
import { useInfiniteList } from '@framebase/vue'

interface Item {
  id: number
  title: string
}

const {
  list, // ComputedRef<Item[]>  累积合并
  hasMore, // ComputedRef<boolean>
  loading,
  initialLoading,
  loadMore,
  reload,
  cancel
} = useInfiniteList<Item>({
  request: async ({ current, pageSize }) => {
    const res = await fetch(`/api/items?page=${current}&size=${pageSize}`)
    return res.json() // { data: Item[], total: number }
  },
  pageSize: 20
})
```

触底加载：

```ts
async function onReachBottom() {
  if (hasMore.value && !loading.value) {
    await loadMore()
  }
}
```

## 查询参数变化

`params` 变化时自动 `reload`（清空已加载记录，回到第 1 页）：

```ts
const keyword = ref('')

const { list } = useInfiniteList({
  request: async ({ current, pageSize, keyword }) => fetchItems({ current, pageSize, keyword }),
  params: () => ({ keyword: keyword.value })
})
```

## 签名

```ts
function useInfiniteList<TRecord, TParams = Record<string, any>>(
  options: UseInfiniteListOptions<TRecord, TParams>
): UseInfiniteListReturn<TRecord, TParams>
```

## 参数

### UseInfiniteListOptions

| 属性        | 类型                                               | 默认值 | 说明                                       |
| ----------- | -------------------------------------------------- | ------ | ------------------------------------------ |
| `request`   | `(params, ctx) => Promise<PagedResponse<TRecord>>` | —      | 请求函数，参数含 `current` / `pageSize`    |
| `pageSize`  | `number`                                           | `10`   | 每页条数（或读全局 `pagination.pageSize`） |
| `params`    | `MaybeRefOrGetter<TParams>`                        | —      | 查询参数，变化时触发 `reload`              |
| `immediate` | `boolean`                                          | `true` | 是否挂载时自动加载第 1 页                  |
| `hasMore`   | `(response, accumulated) => boolean`               | —      | 自定义 hasMore 判断                        |

## 返回值

### UseInfiniteListReturn

| 属性             | 类型                                     | 说明                               |
| ---------------- | ---------------------------------------- | ---------------------------------- |
| `list`           | `ComputedRef<TRecord[]>`                 | 累积合并的所有记录                 |
| `data`           | `ShallowRef<PagedResponse \| undefined>` | 最近一次单页响应                   |
| `current`        | `Ref<number>`                            | 当前已加载页码                     |
| `pageSize`       | `Ref<number>`                            | 每页条数                           |
| `total`          | `Ref<number>`                            | 服务端返回的总数                   |
| `hasMore`        | `ComputedRef<boolean>`                   | 是否还有下一页                     |
| `loading`        | `ComputedRef<boolean>`                   | 请求中                             |
| `initialLoading` | `ComputedRef<boolean>`                   | 首次加载                           |
| `error`          | `ShallowRef<unknown>`                    | 错误对象                           |
| `phase`          | `ShallowRef<RequestPhase>`               | 请求阶段                           |
| `loadMore`       | `() => Promise<void>`                    | 加载下一页；无更多或加载中时空操作 |
| `reload`         | `() => Promise<void>`                    | 清空并重新加载第 1 页              |
| `refresh`        | `() => Promise<void>`                    | 同 `reload`                        |
| `cancel`         | `() => void`                             | 取消进行中的请求                   |

## 说明

### hasMore 默认策略

1. 若响应 `total > 0`：`accumulated.length < total`
2. 否则：本页返回的 `data.length >= pageSize` 即认为还有更多
3. 可通过 `hasMore` 选项覆盖，适配游标分页等非标结构：

```ts
useInfiniteList({
  request,
  hasMore: response => Boolean(response.nextCursor)
})
```

### loadMore 的空操作保护

`loadMore` 内部会检查 `loading` 与 `hasMore`，二者不满足时直接返回，不会触发请求。调用方无需重复判断。

### 与 usePagedList 的选择

| 场景                       | 推荐              |
| -------------------------- | ----------------- |
| 传统分页表格（翻页替换）   | `usePagedList`    |
| 无限滚动 / 瀑布流 / 动态流 | `useInfiniteList` |
