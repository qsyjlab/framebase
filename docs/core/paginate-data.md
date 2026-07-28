# paginateData

对扁平数组做客户端分页切片。用于 `ProTable` / `ProList` 的 `data` 模式（不传 `request` 时）。

## 用法

```ts
import { paginateData } from '@framebase/core'

paginateData([1, 2, 3, 4, 5], { current: 1, pageSize: 2 }) // [1, 2]
paginateData([1, 2, 3, 4, 5], { current: 2, pageSize: 2 }) // [3, 4]
paginateData([1, 2, 3, 4, 5], { current: 3, pageSize: 2 }) // [5]
paginateData([1, 2, 3, 4, 5], { current: 4, pageSize: 2 }) // []
```

## 签名

```ts
function paginateData<TData>(data: TData[], pageInfo: PageInfo): TData[]
```

## 参数

| 参数       | 类型       | 说明                    |
| ---------- | ---------- | ----------------------- |
| `data`     | `TData[]`  | 完整数据数组            |
| `pageInfo` | `PageInfo` | `{ current, pageSize }` |
| `TData`    | 泛型       | 数据项类型              |

## 返回值

`TData[]`，当前页对应的切片。当 `current` 超出总页数时返回 `[]`。

## 类型声明

```ts
interface PageInfo {
  current: number
  pageSize: number
}
```

## 说明

- `current` 从 1 开始计数
- 越界时返回空数组，不抛错
- 不会修改原数组
