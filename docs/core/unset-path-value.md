# unsetPathValue

删除嵌套对象上的值。缺失路径为 no-op，不会抛错。

## 用法

```ts
import { unsetPathValue } from '@framebase/core'

const target = {
  user: { profile: { name: 'Ada', age: 30 } },
  items: [{ id: 7 }, { id: 8 }]
}

// 点号
unsetPathValue(target, 'user.profile.name')
// target.user.profile = { age: 30 }

// 方括号
unsetPathValue(target, 'items[0].id')
// target.items = [{}, { id: 8 }]

// 中间段缺失：no-op，不抛错
unsetPathValue(target, 'user.missing.name')
unsetPathValue(target, 'ghost.path')
// target 不变
```

## 签名

```ts
function unsetPathValue(target: object, path: Path): void
```

## 参数

| 参数     | 类型     | 说明     |
| -------- | -------- | -------- |
| `target` | `object` | 目标对象 |
| `path`   | `Path`   | 路径     |

## 返回值

`void`。直接修改 `target`，不返回新对象。

## 说明

- 行为与 lodash `unset` 一致：只删除叶子段，中间容器保留
- 路径解析委托 lodash-es 的 `toPath` + `unset`
