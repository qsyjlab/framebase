# getPathValue

读取嵌套对象/数组的值。底层委托 lodash `get`，支持点号与方括号两种路径写法。

## 用法

```ts
import { getPathValue } from '@framebase/core'

const source = {
  user: { profile: { name: 'Ada' } },
  items: [{ id: 7 }, { id: 8 }],
  'first name': 'Ada'
}

// 点号
getPathValue(source, 'user.profile.name') // 'Ada'

// 方括号（数字索引）
getPathValue(source, 'items[0].id') // 7
getPathValue(source, 'items[1].id') // 8

// 方括号（字符串键，可含空格、特殊字符）
getPathValue(source, "user['first name']") // 'Ada'

// 数组形式的路径
getPathValue(source, ['items', 0, 'id']) // 7

// 缺失路径返回 undefined，不会抛错
getPathValue(source, 'user.missing.name') // undefined
```

## 签名

```ts
function getPathValue<TValue = unknown>(source: unknown, path: Path): TValue | undefined
```

## 参数

| 参数     | 类型   | 说明                                                             |
| -------- | ------ | ---------------------------------------------------------------- |
| `source` | `any`  | 源对象或数组，`null` / `undefined` 直接返回 `undefined`          |
| `path`   | `Path` | 路径，支持 `string` / `number` / `readonly (string \| number)[]` |
| `TValue` | 泛型   | 返回值类型，默认 `unknown`                                       |

## 返回值

路径上的值；任意中间段缺失时返回 `undefined`，不会抛错。

## 类型声明

```ts
type PathSegment = string | number
type Path = PathSegment | readonly PathSegment[]

function getPathValue<TValue = unknown>(source: unknown, path: Path): TValue | undefined
```

## 说明

- 路径解析委托 lodash-es 的 `toPath` + `get`，覆盖 `a[0].b`、`a['name']`、`a["name"]`、转义路径等所有边界情况
- `TValue` 是显式声明的返回类型，**不会**根据 `source` 自动推导；如需类型推导请配合 [`DataPath<T>`](./data-path) 使用
