# useColumnVisibility

列显隐状态：`Record<columnKey, boolean>` + 可选 localStorage 持久化。缺失的 key 默认可见（开放世界假设）。

## 用法

```ts
import { useColumnVisibility } from '@framebase/vue'

const { isVisible, toggle, show, hide, hiddenKeys } = useColumnVisibility()

// 列配置
const columns = [
  { key: 'name', label: '名称' },
  { key: 'age', label: '年龄' },
  { key: 'email', label: '邮箱' }
].filter(c => isVisible(c.key))
```

```vue
<el-dropdown>
  <span>列设置</span>
  <template #dropdown>
    <el-dropdown-menu>
      <el-dropdown-item v-for="c in allColumns" :key="c.key">
        <el-checkbox :model-value="isVisible(c.key)" @change="toggle(c.key)">
          {{ c.label }}
        </el-checkbox>
      </el-dropdown-item>
    </el-dropdown-menu>
  </template>
</el-dropdown>
```

## 持久化

```ts
const { isVisible } = useColumnVisibility({
  storageKey: 'user-table-columns' // 自动读写 localStorage
})
```

## 签名

```ts
function useColumnVisibility(options?: UseColumnVisibilityOptions): UseColumnVisibilityReturn
```

## 参数

### UseColumnVisibilityOptions

| 属性         | 类型                      | 默认值                | 说明                            |
| ------------ | ------------------------- | --------------------- | ------------------------------- |
| `initial`    | `Record<string, boolean>` | `{}`                  | 初始显隐 map，缺失 key 视为可见 |
| `storageKey` | `string`                  | —                     | 设置后持久化到 localStorage     |
| `storage`    | `Storage`                 | `window.localStorage` | 自定义存储实例                  |

## 返回值

| 属性         | 类型                           | 说明                       |
| ------------ | ------------------------------ | -------------------------- |
| `visibility` | `Ref<Record<string, boolean>>` | 显隐 map，`false` 为隐藏   |
| `isVisible`  | `(key) => boolean`             | 查询，缺失 key 返回 `true` |
| `toggle`     | `(key) => void`                | 切换                       |
| `show`       | `(key) => void`                | 显示                       |
| `hide`       | `(key) => void`                | 隐藏                       |
| `showAll`    | `() => void`                   | 全部显示（清空 map）       |
| `reset`      | `() => void`                   | 恢复到初始                 |
| `hiddenKeys` | `ComputedRef<string[]>`        | 当前隐藏的 key 列表        |

## 说明

### 持久化优先级

`storageKey` 启用时：已持久化的值 > `initial`。首次无持久化时用 `initial`。

### 不重写 useStorage

持久化直接用原生 `Storage` API，不依赖 vueuse 的 `useStorage`。存储失败（如隐私模式）静默忽略。
