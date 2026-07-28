# useUrlState

URL query 与响应式状态的双向同步。优先通过 `vue-router` 的 `replace`/`push` 更新（保持历史干净），无 router 时回退到 `window.history`。

## 用法

### 基础用法

```ts
import { useUrlState } from '@framebase/vue'

const { state, sync, read } = useUrlState(
  { keyword: '', status: 'all' },
  {
    key: 'filter', // URL query key，默认 'state'
    history: 'replace' // 'replace' | 'push'
  }
)

// state 变化会自动写入 URL：?filter={"keyword":"","status":"all"}
// 用户手动改 URL 后调用 read() 可重新读取
state.value.keyword = 'Ada'
// URL 自动变为 ?filter={"keyword":"Ada","status":"all"}
```

### 配合 vue-router

```ts
import { useUrlState } from '@framebase/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const { state } = useUrlState(
  { tab: 'list', page: 1 },
  { router } // 传 vue-router 实例，路由切换时使用 router.replace/push
)
```

### 自定义序列化

默认使用 `JSON.stringify` / `JSON.parse`。需要更紧凑的 URL 表示时可自定义：

```ts
useUrlState(
  { keyword: '', page: 1 },
  {
    key: 'q',
    serialize: value => btoa(JSON.stringify(value)),
    parse: raw => JSON.parse(atob(raw))
  }
)
```

## 签名

```ts
function useUrlState<T>(initial: T, options?: UrlStateOptions<T>): UseUrlStateReturn<T>
```

## 参数

### UrlStateOptions

| 属性              | 类型                                                            | 默认值           | 说明                                    |
| ----------------- | --------------------------------------------------------------- | ---------------- | --------------------------------------- |
| `key`             | `string`                                                        | `'state'`        | URL query 键名                          |
| `history`         | `'replace' \| 'push'`                                           | `'replace'`      | 历史更新模式                            |
| `serialize`       | `(value: T) => string`                                          | `JSON.stringify` | 序列化 state 到 URL 字符串              |
| `parse`           | `(raw: string) => T`                                            | `JSON.parse`     | 从 URL 字符串解析回 state               |
| `router`          | `{ replace: (to: string) => void; push: (to: string) => void }` | `undefined`      | 路由实例，省略时回退到 `window.history` |
| `skipInitialRead` | `boolean`                                                       | `false`          | 是否跳过初始化时 URL → state 同步       |

## 返回值

### UseUrlStateReturn

| 属性    | 类型            | 说明                                      |
| ------- | --------------- | ----------------------------------------- |
| `state` | `Ref<T>`        | 响应式状态，变化时自动写入 URL            |
| `sync`  | `() => void`    | 强制把当前 state 写入 URL                 |
| `read`  | `() => boolean` | 强制从 URL 读取到 state，返回是否读取成功 |

## 类型声明

```ts
interface UrlStateOptions<T> {
  key?: string
  history?: 'replace' | 'push'
  serialize?: (value: T) => string
  parse?: (raw: string) => T
  router?: { replace: (to: string) => void; push: (to: string) => void }
  skipInitialRead?: boolean
}

interface UseUrlStateReturn<T> {
  state: Ref<T>
  sync: () => void
  read: () => boolean
}
```

## 说明

### 初始化顺序

默认 `skipInitialRead: false`：构造时先从 URL 读取覆盖 `initial`，再建立 `watch(state)`。这样既能从 URL 恢复状态，又不会把初始 `initial` 立刻写回 URL 覆盖掉原值。

设为 `true` 时跳过 URL → state 这一步，`initial` 直接作为 state 初值，`watch` 一触发就会写入 URL。

### vue-router 集成

传入 `router` 后，所有 URL 写入都会走 `router.replace` 或 `router.push`，不会触发整页刷新。未传时回退到 `window.history.replaceState` / `pushState`，需要自己监听 `popstate` 事件。

### ProTable / ProList 内部用法

ProTable 的 URL 持久化能力（分页、筛选、排序存到 URL）就是在 `useUrlState` 之上封装的，把 ProTable 的 query 对象作为 state 同步到 URL，刷新页面后能恢复到上次状态。
