# useCrud

在 `usePagedList` 之上叠加 `create` / `update` / `remove`，写操作成功后自动刷新列表。每个写操作有独立的 `useRequest` 与防重入保护，互不阻塞。

## 用法

```ts
import { useCrud } from '@framebase/vue'

interface User {
  id: number
  name: string
}

const crud = useCrud<User, Record<string, any>, { name: string }, { name: string }>({
  list: {
    request: async ({ current, pageSize }) => {
      const res = await fetch(`/api/users?page=${current}&size=${pageSize}`)
      return res.json()
    },
    pageSize: 10
  },
  create: async payload => {
    await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  update: async (record, payload) => {
    await fetch(`/api/users/${record.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },
  remove: async record => {
    await fetch(`/api/users/${record.id}`, { method: 'DELETE' })
  }
})

// 继承 usePagedList 全部字段
const { list, loading, pagination } = crud

// 写操作
await crud.create({ name: 'Ada' })
await crud.update({ id: 1, name: 'old' }, { name: 'new' })
await crud.remove({ id: 2, name: 'Bob' })
```

模板里用 `submitting` / `creating` / `updating` / `removing` 控制按钮态：

```vue
<el-button type="primary" :loading="crud.creating.value" @click="onCreate">新增</el-button>
<el-button type="danger" :loading="crud.removing.value" @click="onRemove(row)">删除</el-button>
```

## 关闭自动刷新

```ts
const crud = useCrud({
  list,
  create,
  update,
  remove,
  autoRefresh: false // 写操作后不 reload 列表
})
```

## 签名

```ts
function useCrud<
  TRecord,
  TParams = Record<string, any>,
  TCreatePayload = any,
  TUpdatePayload = any
>(options: UseCrudOptions<TRecord, TParams, TCreatePayload, TUpdatePayload>): UseCrudReturn
```

## 参数

### UseCrudOptions

| 属性          | 类型                                                 | 默认值 | 说明                                 |
| ------------- | ---------------------------------------------------- | ------ | ------------------------------------ |
| `list`        | `UsePagedListOptions<TRecord, TParams>`              | —      | 列表请求配置，与 `usePagedList` 一致 |
| `create`      | `(payload, ctx) => Promise<TRecord \| void>`         | —      | 创建；未配置时调用 `create()` 抛错   |
| `update`      | `(record, payload, ctx) => Promise<TRecord \| void>` | —      | 更新；未配置时调用 `update()` 抛错   |
| `remove`      | `(record, ctx) => Promise<void>`                     | —      | 删除；未配置时调用 `remove()` 抛错   |
| `autoRefresh` | `boolean`                                            | `true` | 写操作成功后是否自动 `reload` 列表   |

## 返回值

继承 `UsePagedListReturn` 全部字段，额外增加：

| 属性         | 类型                                                         | 说明                                       |
| ------------ | ------------------------------------------------------------ | ------------------------------------------ |
| `create`     | `(payload) => Promise<TRecord \| void \| undefined>`         | 创建；进行中调用返回 `undefined`（被忽略） |
| `update`     | `(record, payload) => Promise<TRecord \| void \| undefined>` | 更新；同上                                 |
| `remove`     | `(record) => Promise<void \| undefined>`                     | 删除；同上                                 |
| `submitting` | `ComputedRef<boolean>`                                       | 任一写操作进行中                           |
| `creating`   | `ComputedRef<boolean>`                                       | 创建中                                     |
| `updating`   | `ComputedRef<boolean>`                                       | 更新中                                     |
| `removing`   | `ComputedRef<boolean>`                                       | 删除中                                     |

## 说明

### 防重入

同一写操作进行中时，再次调用返回 `undefined` 且不执行 `fn`。调用方应判断返回值：

```ts
const result = await crud.create(payload)
if (result === undefined) {
  // 被忽略（正在创建中），或 create fn 本身返回 void
}
```

不同写操作（create / update / remove）互不阻塞，可并发。

### 失败不刷新

写操作抛错时不会触发 `reload`，错误会从 `create` / `update` / `remove` 抛出，调用方自行 try/catch 处理提示。

### autoRefresh 行为

`autoRefresh: true`（默认）时，写操作成功后调用 `pagedList.reload()`，重新请求当前页。若 `reload` 失败，错误不会抛给 `create` 调用方（已吞掉），只影响列表展示。

### 泛型推导

| 泛型             | 默认                  | 用途              |
| ---------------- | --------------------- | ----------------- |
| `TRecord`        | —                     | 记录类型          |
| `TParams`        | `Record<string, any>` | 列表查询参数类型  |
| `TCreatePayload` | `any`                 | 创建 payload 类型 |
| `TUpdatePayload` | `any`                 | 更新 payload 类型 |
