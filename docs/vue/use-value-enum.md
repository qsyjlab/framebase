# useValueEnum

值枚举工具：把 `ValueEnum`（Record/Map）响应式转换为 `options` 列表 + 按值查文本/项。用于 `el-select` 选项、表格单元格渲染等。

## 用法

```ts
import { useValueEnum } from '@framebase/vue'

const statusEnum = {
  active: { text: '启用', type: 'success' },
  disabled: { text: '禁用', type: 'danger' },
  pending: '待审核'
}

const { options, getText, getItem } = useValueEnum(statusEnum)

// options: [{ label: '启用', value: 'active', disabled: undefined }, ...]
// <el-select v-for="opt in options" ...>

getText('active') // '启用'
getItem('disabled') // { text: '禁用', status: 'danger' }
```

## 签名

```ts
function useValueEnum(valueEnum: MaybeRefOrGetter<ValueEnum | undefined>): UseValueEnumReturn
```

## ValueEnum 类型

```ts
interface ValueEnumItem {
  text: string
  type?: 'success' | 'info' | 'warning' | 'danger' | 'primary'
  color?: string
  disabled?: boolean
}

type ValueEnumValue = string | number | ValueEnumItem

// Record 或 Map 均可
type ValueEnum = Record<string, ValueEnumValue> | Map<unknown, ValueEnumValue>
```

简写形式（`string` / `number`）等价于 `{ text: String(value) }`。

## 返回值

| 属性      | 类型                                    | 说明                           |
| --------- | --------------------------------------- | ------------------------------ |
| `options` | `ComputedRef<ValueEnumOption[]>`        | `{ label, value, disabled }[]` |
| `getText` | `(value) => string`                     | 按值查显示文本，未知返回 `''`  |
| `getItem` | `(value) => ValueEnumItem \| undefined` | 按值查完整项                   |

## 说明

### 响应式输入

`valueEnum` 支持 `ref` / `computed` / getter，enum 变化时 `options` 自动重算。

### Map 支持

`Map` 形式支持非 string key（如数字 id），`getText` / `getItem` 按原始 key 查找。

### 与 ProFieldValueEnum 的关系

`@framebase/vue` 的 `ValueEnum` 与 `@framebase/element-plus-pro-components` 的 `ProFieldValueEnum` 结构一致。Pro 组件内部使用自己的类型（含 Element Plus tag 状态），本 hook 是其框架无关子集。
