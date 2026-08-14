# getRowKey

解析行键。接受路径字符串（含方括号）或函数，统一返回 `string | number | undefined`。

## 用法

```ts
import { getRowKey } from '@framebase/core'

// 路径字符串
getRowKey({ id: 7 }, 'id') // 7
getRowKey({ user: { id: 7 } }, 'user.id') // 7
getRowKey({ items: [{ id: 7 }] }, 'items[0].id') // 7

// 函数
getRowKey({ id: 7 }, record => record.id) // 7

// 缺失字段返回 undefined
getRowKey({ name: 'Ada' }, 'id') // undefined
```

## 签名

```ts
function getRowKey<TRecord>(record: TRecord, rowKey: RowKey<TRecord>): string | number | undefined
```

## 参数

| 参数      | 类型              | 说明                               |
| --------- | ----------------- | ---------------------------------- |
| `record`  | `TRecord`         | 行记录                             |
| `rowKey`  | `RowKey<TRecord>` | 行键定义，路径字符串或返回键的函数 |
| `TRecord` | 泛型              | 记录类型                           |

## 返回值

`string | number | undefined`。

## 类型声明

```ts
type RowKey<TRecord> = Path | ((record: TRecord) => string | number | undefined)
```

## 说明

- 字符串路径委托 `getPathValue` 解析，因此支持 `a[0].b`、`a['name']` 等所有 bracket notation
- ProTable / ProList 的 `rowKey` prop 最终都会经过此函数
