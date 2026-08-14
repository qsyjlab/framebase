# useFieldArray

动态字段数组：每项带稳定 `key`，支持 append / insert / remove / move / replace。专为表单动态字段（如多个联系方式、多个标签）设计。

## 用法

```ts
import { useFieldArray } from '@framebase/vue'

interface Contact {
  type: string
  value: string
}

const { fields, append, remove, values } = useFieldArray<Contact>([{ type: 'email', value: '' }])
```

```vue
<el-form-item v-for="(item, index) in fields" :key="item.key" :label="`联系方式 ${index + 1}`">
  <el-select v-model="item.value.type">
    <el-option value="email" label="邮箱" />
    <el-option value="phone" label="电话" />
  </el-select>
  <el-input v-model="item.value.value" />
  <el-button @click="remove(index)">删除</el-button>
</el-form-item>
<el-button @click="append({ type: 'email', value: '' })">添加</el-button>
```

## 签名

```ts
function useFieldArray<T>(initial?: T[], options?: UseFieldArrayOptions): UseFieldArrayReturn<T>
```

## 参数

### UseFieldArrayOptions

| 属性          | 类型        | 默认值       | 说明                        |
| ------------- | ----------- | ------------ | --------------------------- |
| `defaultItem` | `() => any` | `() => ({})` | `append()` 无参时的工厂函数 |

## 返回值

| 属性      | 类型                        | 说明                                       |
| --------- | --------------------------- | ------------------------------------------ |
| `fields`  | `Ref<FieldArrayItem<T>[]>`  | 带 `key` 的项，`:key="item.key"` 绑定      |
| `values`  | `ComputedRef<T[]>`          | 纯值数组                                   |
| `length`  | `ComputedRef<number>`       | 项数                                       |
| `append`  | `(value?: T) => number`     | 末尾追加，无参用 `defaultItem`，返回新长度 |
| `insert`  | `(index, value) => number`  | 指定位置插入                               |
| `remove`  | `(index) => T \| undefined` | 移除并返回被移除的值                       |
| `move`    | `(from, to) => void`        | 移动元素（key 跟随，不重新生成）           |
| `replace` | `(index, value) => void`    | 替换某项（保留原 key）                     |
| `setAll`  | `(values: T[]) => void`     | 整体替换                                   |
| `clear`   | `() => void`                | 清空                                       |
| `reset`   | `() => void`                | 恢复到初始值                               |

## 说明

### 稳定 key

`key` 单调递增且不重用。`move` / `replace` 保留原有 key，避免 `v-for` 重新挂载组件导致状态丢失。`remove` 后再 `append` 会生成新 key，不复用被删 key。
