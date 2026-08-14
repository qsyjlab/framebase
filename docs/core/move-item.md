# moveItem

不可变地移动数组元素。用于拖拽排序表格等场景。

## 用法

```ts
import { moveItem } from '@framebase/core'

moveItem(['a', 'b', 'c', 'd'], 1, 3) // ['a', 'c', 'd', 'b']
moveItem(['a', 'b', 'c', 'd'], 0, 0) // ['a', 'b', 'c', 'd']  同位置返回原数组副本
moveItem(['a', 'b', 'c'], -1, 1) // ['a', 'b', 'c']  越界返回原数组副本
```

## 签名

```ts
function moveItem<TData>(data: TData[], oldIndex: number, newIndex: number): TData[]
```

## 参数

| 参数       | 类型      | 说明       |
| ---------- | --------- | ---------- |
| `data`     | `TData[]` | 原数组     |
| `oldIndex` | `number`  | 起始索引   |
| `newIndex` | `number`  | 目标索引   |
| `TData`    | 泛型      | 数据项类型 |

## 返回值

`TData[]`。新数组，不修改原数组。

## 说明

- `oldIndex === newIndex` 或任一索引越界时，返回原数组的浅拷贝（不报错）
- 始终返回新数组，便于配合 Vue 响应式系统（不可变更新）
