# setPathValue

写入嵌套对象的值，自动创建缺失的中间容器（对象或数组）。

## 用法

```ts
import { setPathValue } from '@framebase/core'

const target: Record<string, unknown> = {}

// 点号
setPathValue(target, 'user.profile.name', 'Ada')
// target.user = { profile: { name: 'Ada' } }

// 方括号（数字索引，自动创建数组）
setPathValue(target, 'items[0].id', 7)
setPathValue(target, 'items[1].id', 8)
// target.items = [{ id: 7 }, { id: 8 }]

// 方括号（字符串键，可含空格）
setPathValue(target, "user['first name']", 'Ada')
// target.user = { 'first name': 'Ada' }

// 数组形式的路径
setPathValue(target, ['items', 2, 'id'], 9)
```

## 签名

```ts
function setPathValue(target: object, path: Path, value: unknown): void
```

## 参数

| 参数     | 类型      | 说明                   |
| -------- | --------- | ---------------------- |
| `target` | `object`  | 目标对象，会被原地修改 |
| `path`   | `Path`    | 路径                   |
| `value`  | `unknown` | 要写入的值             |

## 返回值

`void`。直接修改 `target`，不返回新对象。

## 说明

- 中间段缺失时，根据下一段是否为数字索引决定创建数组还是对象
- 路径解析委托 lodash-es 的 `toPath` + `set`
