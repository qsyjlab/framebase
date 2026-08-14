# useRequest

可中止的异步状态容器，内置防抖、重试、最新请求胜出（latest-wins）语义。

## 用法

```ts
import { useRequest, type RequestContext } from '@framebase/vue'

interface User {
  id: number
  name: string
}

const {
  data, // ShallowRef<User[] | undefined>
  loading, // ComputedRef<boolean>
  error, // ShallowRef<unknown>
  phase, // ShallowRef<'idle' | 'pending' | 'success' | 'error'>
  action, // ShallowRef<RequestAction | undefined>
  initialLoading, // ComputedRef<boolean>  仅首次请求为 true
  refreshing, // ComputedRef<boolean>  非首次请求为 true
  execute,
  cancel,
  retry
} = useRequest<User[]>({
  debounce: 300,
  retry: 2,
  retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000)
})

async function fetchUsers(
  params: { current: number; pageSize: number },
  { signal }: RequestContext
) {
  const res = await fetch(`/api/users?page=${params.current}&size=${params.pageSize}`, { signal })
  return res.json()
}

// 触发：第二个参数会原样传给 fetchUsers
await execute(fetchUsers, { current: 1, pageSize: 10 }, { action: 'initial' })

// 中止当前请求
cancel()

// 重试上一次请求
await retry()
```

## 签名

```ts
function useRequest<TData>(defaults?: RequestOptions): RequestState<TData>
```

## 参数

### RequestOptions

`useRequest` 的默认配置，可在每次 `execute` 时被覆盖。

| 属性         | 类型                                     | 默认值 | 说明                       |
| ------------ | ---------------------------------------- | ------ | -------------------------- |
| `debounce`   | `number`                                 | `0`    | 防抖毫秒数                 |
| `retry`      | `number`                                 | `0`    | 失败重试次数               |
| `retryDelay` | `number \| ((attempt, error) => number)` | `0`    | 重试延迟，可传函数动态计算 |

### RequestExecuteOptions

`execute` 的第三参数，覆盖 `RequestOptions` 默认值。

| 属性         | 类型                                                                  | 说明                                                                                              |
| ------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `action`     | `'initial' \| 'reload' \| 'refresh' \| 'page' \| 'retry' \| 'submit'` | 标识本次请求来源，影响 `initialLoading` / `refreshing` 判断，未传时根据 `data` 是否已有值自动判断 |
| `debounce`   | `number`                                                              | 覆盖默认防抖                                                                                      |
| `retry`      | `number`                                                              | 覆盖默认重试次数                                                                                  |
| `retryDelay` | `number \| ((attempt, error) => number)`                              | 覆盖默认重试延迟                                                                                  |

### RequestContext

请求函数的第二个参数，提供中止能力。

| 属性      | 类型          | 说明                                |
| --------- | ------------- | ----------------------------------- |
| `signal`  | `AbortSignal` | 中止信号，传给 `fetch` / `axios` 等 |
| `attempt` | `number`      | 当前重试次数（首次为 `0`）          |

## 返回值

### RequestState

| 属性             | 类型                                                      | 说明                                                      |
| ---------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `data`           | `ShallowRef<TData \| undefined>`                          | 响应数据                                                  |
| `error`          | `ShallowRef<unknown>`                                     | 错误对象，请求成功时为 `undefined`                        |
| `loading`        | `ComputedRef<boolean>`                                    | `phase === 'pending'`                                     |
| `initialLoading` | `ComputedRef<boolean>`                                    | `loading && action === 'initial'`，用于首次加载骨架屏区分 |
| `refreshing`     | `ComputedRef<boolean>`                                    | `loading && action !== undefined && action !== 'initial'` |
| `phase`          | `ShallowRef<'idle' \| 'pending' \| 'success' \| 'error'>` | 当前阶段                                                  |
| `action`         | `ShallowRef<RequestAction \| undefined>`                  | 当前请求来源                                              |
| `execute`        | `<TParams>(request, params, options?) => Promise<TData>`  | 触发请求                                                  |
| `cancel`         | `(reason?) => void`                                       | 中止当前请求，状态重置为 `idle`                           |
| `retry`          | `() => Promise<TData \| undefined>`                       | 重试上一次请求（沿用其参数与选项）                        |

## 类型声明

```ts
type RequestPhase = 'idle' | 'pending' | 'success' | 'error'
type RequestAction = 'initial' | 'reload' | 'refresh' | 'page' | 'retry' | 'submit'

interface RequestContext {
  signal: AbortSignal
  attempt: number
}

interface RequestState<TData> {
  data: ShallowRef<TData | undefined>
  error: ShallowRef<unknown>
  loading: ComputedRef<boolean>
  initialLoading: ComputedRef<boolean>
  refreshing: ComputedRef<boolean>
  phase: ShallowRef<RequestPhase>
  action: ShallowRef<RequestAction | undefined>
  execute: <TParams>(
    request: (params: TParams, context: RequestContext) => Promise<TData>,
    params: TParams,
    options?: RequestExecuteOptions
  ) => Promise<TData>
  cancel: (reason?: unknown) => void
  retry: () => Promise<TData | undefined>
}
```

## 说明

### 最新请求胜出

连续快速调用 `execute` 时，先前的未完成请求会被 `AbortController` 中止，只有最后一次调用的结果会写入 `data`。请求函数应通过 `RequestContext.signal` 感知中止：

```ts
async function fetchUsers(params, { signal }: RequestContext) {
  const res = await fetch('/api/users', { signal })
  return res.json()
}
```

中止不会写入 `error`，`phase` 会回到 `idle`。

### 中止错误识别

`isRequestAbort(error)` 工具函数识别 `AbortError`、axios `CanceledError`（`ERR_CANCELED`），内部判断 `error` / `phase` 时会用它排除中止场景。

### action 的作用

`action` 不影响请求行为，只用于区分 `initialLoading` 与 `refreshing`，方便 UI 区分首次加载骨架屏与刷新遮罩。

| action         | initialLoading | refreshing |
| -------------- | -------------- | ---------- |
| `initial`      | `true`         | `false`    |
| `reload`       | `false`        | `true`     |
| `refresh`      | `false`        | `true`     |
| `page`         | `false`        | `true`     |
| `retry`        | `false`        | `true`     |
| `submit`       | `false`        | `true`     |
| 未传（首次）   | `true`         | `false`    |
| 未传（非首次） | `false`        | `true`     |
