# normalizePagedResponse

规范化服务端分页响应，将不规范字段补齐为安全默认值。

## 用法

```ts
import { normalizePagedResponse } from '@framebase/core'

// data 缺失 → []
normalizePagedResponse({ total: 100 })
// { data: [], total: 100 }

// data 非数组 → []
normalizePagedResponse({ data: null, total: 100 })
// { data: [], total: 100 }

// total 非有限数 → 0
normalizePagedResponse({ data: [{ id: 1 }], total: 'abc' })
// { data: [{ id: 1 }], total: 0 }

// success 透传
normalizePagedResponse({ data: [], total: 0, success: true })
// { data: [], total: 0, success: true }
```

## 签名

```ts
function normalizePagedResponse<TData>(response: PagedResponse<TData>): PagedResponse<TData>
```

## 参数

| 参数       | 类型                   | 说明           |
| ---------- | ---------------------- | -------------- |
| `response` | `PagedResponse<TData>` | 服务端原始响应 |
| `TData`    | 泛型                   | 数据项类型     |

## 返回值

```ts
interface PagedResponse<TData> {
  data: TData[] // 一定为数组
  total: number // 一定为有限数
  success?: boolean // 透传
}
```

## 说明

- `data` 缺失或非数组时回退到 `[]`
- `total` 缺失或非有限数时回退到 `0`
- `success` 字段直接透传
- ProTable / ProList / ProDescriptions 内部都用此函数处理响应
