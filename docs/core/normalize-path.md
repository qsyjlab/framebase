# normalizePath

将任意形式的路径标准化为 `PathSegment[]`。数字段会被强制转回 `number`。

## 用法

```ts
import { normalizePath } from '@framebase/core'

normalizePath('user.profile.name') // ['user', 'profile', 'name']
normalizePath('a[0].b') // ['a', 0, 'b']
normalizePath("a['name']") // ['a', 'name']
normalizePath('a["name"]') // ['a', 'name']
normalizePath('a[0][1]') // ['a', 0, 1]
normalizePath(['items', 0, 'id']) // ['items', 0, 'id']
normalizePath(0) // [0]
```

## 签名

```ts
function normalizePath(path: Path): PathSegment[]
```

## 参数

| 参数   | 类型   | 说明                                                          |
| ------ | ------ | ------------------------------------------------------------- |
| `path` | `Path` | 输入路径，可为 `string` / `number` / `readonly PathSegment[]` |

## 返回值

`PathSegment[]`，其中纯数字字符串（如 `'0'`）会被转为 `number`，便于后续按数组索引访问。

## 说明

- 字符串路径委托 lodash `toPath` 解析，支持 `a[0].b`、`a['name']`、`a["name"]`、转义路径等
- 数组路径直接浅拷贝返回，不做变换
- 数字路径包成 `[path]`
