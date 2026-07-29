# useFormState

表单值容器：初始快照 + 字段级脏检测 + reset/commit。基于 `reactive`，可直接用 `v-model` 绑定表单控件。

## 用法

```ts
import { useFormState } from '@framebase/vue'

interface Form {
  name: string
  age: number
}

const { values, isDirty, dirtyFields, reset, commit } = useFormState<Form>({
  name: '',
  age: 0
})

// values 可直接 v-model
// <el-input v-model="values.name" />
// <el-input-number v-model="values.age" />

// 修改后
values.name = 'Ada'
isDirty.value // true
dirtyFields.value // { name: true, age: false }

reset() // 恢复到初始快照
commit() // 把当前值固化为新初始值（清除脏状态）
```

## 签名

```ts
function useFormState<T extends object>(
  initial: T,
  options?: UseFormStateOptions
): UseFormStateReturn<T>
```

## 参数

### UseFormStateOptions

| 属性    | 类型      | 默认值 | 说明                             |
| ------- | --------- | ------ | -------------------------------- |
| `watch` | `boolean` | `true` | 是否深监听 values 触发脏检测重算 |

## 返回值

### UseFormStateReturn

| 属性            | 类型                                   | 说明                                     |
| --------------- | -------------------------------------- | ---------------------------------------- |
| `values`        | `T`                                    | 可变表单值，`v-model` 绑定               |
| `initialValues` | `DeepReadonly<T>`                      | 初始快照（只读）                         |
| `isDirty`       | `ComputedRef<boolean>`                 | 任一字段与初始值不同时为 `true`          |
| `dirtyFields`   | `ComputedRef<Record<string, boolean>>` | 顶层字段级脏标记                         |
| `setValues`     | `(next: Partial<T>) => void`           | 批量赋值                                 |
| `reset`         | `() => void`                           | 恢复到 `initialValues` 快照              |
| `commit`        | `() => void`                           | 把当前 `values` 固化为新 `initialValues` |

## 说明

### 深拷贝隔离

`values` 与 `initialValues` 都是对入参 `initial` 的深拷贝，外部修改原对象不会影响内部状态。

### dirtyFields 粒度

`dirtyFields` 只到顶层字段。嵌套对象的整体脏状态通过该字段的 `true` 表示，如 `values.profile.name` 改动后 `dirtyFields.value.profile === true`。

### 与 useUrlState 的关系

`useFormState` 做内存快照与脏检测；`useUrlState` 做 URL 持久化。如需表单跨路由保留，可在 `useFormState` 之上叠 `useUrlState`。
