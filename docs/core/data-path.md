# DataPath / DataIndex

路径字面量类型推导，为 `getPathValue` / `dataIndex` 等场景提供编辑器自动补全与错误校验。

## 用法

```ts
import { type DataPath, type DataIndex, getPathValue } from '@framebase/core'

interface UserRecord {
  user: { name: string; address: { city: string } }
  items: { id: number }[]
}

// 自动补全：输入 'user.' 时 IDE 提示 'name' / 'address'
// 自动校验：写错路径 'user.age' 会编译报错
type ValidPath = DataPath<UserRecord>
// 'user' | 'user.name' | 'user.address' | 'user.address.city' | 'items'

// 配合 getPathValue 使用
function read<R>(record: R, path: DataPath<R>) {
  return getPathValue(record, path)
}

read({ user: { name: 'Ada' } }, 'user.name') // OK
read({ user: { name: 'Ada' } }, 'user.unknown') // 编译报错
```

## 类型签名

```ts
type PathSegment = string | number
type LiteralUnion<T extends string> = T | (string & Record<never, never>)

type DataPath<T, TDepth extends 1 | 2 | 3 | 4 = 4>
  = /* 递归映射，详见下方说明 */

type DataIndex<T>
  = LiteralUnion<Extract<DataPath<T>, string>> | readonly PathSegment[]
```

## 参数

### DataPath

| 参数     | 类型               | 说明                                                                  |
| -------- | ------------------ | --------------------------------------------------------------------- |
| `T`      | 任意对象类型       | 要推导路径的目标类型                                                  |
| `TDepth` | `1 \| 2 \| 3 \| 4` | 递归深度，默认 `4`。深度越大，推导出的路径越长，但 `vue-tsc` 性能越差 |

### DataIndex

| 参数 | 类型         | 说明                 |
| ---- | ------------ | -------------------- |
| `T`  | 任意对象类型 | 要推导路径的目标类型 |

## 返回值

- `DataPath<T>` 返回所有合法点号路径的字面量联合类型
- `DataIndex<T>` 返回 `LiteralUnion<...> | readonly PathSegment[]`，兼容字符串路径与数组路径，同时开放声明合并扩展

## 类型声明

```ts
type Builtin = Date | RegExp | ((...args: never[]) => unknown)
type StringKey<T> = Extract<keyof T, string | number>
type DepthMap = {
  1: [unknown]
  2: [unknown, unknown]
  3: [unknown, unknown, unknown]
  4: [unknown, unknown, unknown, unknown]
}

type JoinPath<TKey extends string | number, TPath> = TPath extends string | number
  ? `${TKey}.${TPath}`
  : never

type DataPathInternal<T, TDepth extends unknown[]> = TDepth extends [unknown, ...infer TRest]
  ? T extends Builtin | readonly unknown[]
    ? never
    : T extends object
      ? {
          [TKey in StringKey<T>]:
            | `${TKey}`
            | (NonNullable<T[TKey]> extends object
                ? JoinPath<TKey, DataPathInternal<NonNullable<T[TKey]>, TRest>>
                : never)
        }[StringKey<T>]
      : never
  : never

export type DataPath<T, TDepth extends 1 | 2 | 3 | 4 = 4> = DataPathInternal<T, DepthMap[TDepth]>

export type DataIndex<T> = LiteralUnion<Extract<DataPath<T>, string>> | readonly PathSegment[]
```

## 说明

### 为什么不自动推导返回值类型

`getPathValue` 的返回值需要靠 `TValue` 显式声明，因为路径与值类型的映射在 TS 类型系统中表达成本极高。`DataPath<T>` 只负责**约束路径字符串本身**，让 IDE 提示哪些路径合法、哪些路径写错。

### 为什么要限制深度

深度过大会导致递归类型展开爆炸，`vue-tsc` 与 IDE 性能会显著下降。默认 `4` 层足够覆盖 ProTable / ProForm 的真实嵌套场景；如需更浅可显式传 `DataPath<T, 2>`。

### LiteralUnion 的扩展性

`LiteralUnion<T>` 是开放式字面量联合，外部可通过声明合并追加已知值。`DataIndex<T>` 借助它让 ProField 的 `valueType` 等配置既能自动补全内置值，又能接受任意自定义字符串。
