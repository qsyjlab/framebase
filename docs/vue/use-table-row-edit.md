# useTableRowEdit

表格行内编辑状态：跟踪当前编辑行的 key，单行编辑模式（开始编辑新行自动结束旧行）。配合 `useSubmit` 管理保存生命周期，本 hook 只负责编辑态开关。

## 用法

```ts
import { useTableRowEdit } from '@framebase/vue'

const { editingKey, isEditing, startEdit, stopEdit } = useTableRowEdit<number>()

// 点击「编辑」按钮
startEdit(row.id)
// isEditing(row.id) → true

// 点击「保存」或「取消」
stopEdit()
// editingKey.value → null
```

```vue
<el-table :data="data">
  <el-table-column prop="name" label="名称">
    <template #default="{ row }">
      <el-input v-if="isEditing(row.id)" v-model="row.name" />
      <span v-else>{{ row.name }}</span>
    </template>
  </el-table-column>
  <el-table-column label="操作" width="160">
    <template #default="{ row }">
      <template v-if="isEditing(row.id)">
        <el-button size="small" type="primary" @click="onSave(row)">保存</el-button>
        <el-button size="small" @click="stopEdit(row.id)">取消</el-button>
      </template>
      <el-button v-else size="small" @click="startEdit(row.id)">编辑</el-button>
    </template>
  </el-table-column>
</el-table>
```

## 签名

```ts
function useTableRowEdit<TKey = string | number>(
  options?: UseTableRowEditOptions<TKey>
): UseTableRowEditReturn<TKey>
```

## 参数

### UseTableRowEditOptions

| 属性      | 类型                  | 默认值 | 说明                 |
| --------- | --------------------- | ------ | -------------------- |
| `onStart` | `(key: TKey) => void` | —      | 行进入编辑模式时回调 |
| `onEnd`   | `(key: TKey) => void` | —      | 行退出编辑模式时回调 |

## 返回值

| 属性           | 类型                     | 说明                              |
| -------------- | ------------------------ | --------------------------------- |
| `editingKey`   | `Ref<TKey \| null>`      | 当前编辑行的 key，`null` 表示空闲 |
| `isEditingAny` | `ComputedRef<boolean>`   | 是否有行正在编辑                  |
| `isEditing`    | `(key: TKey) => boolean` | 查询某行是否在编辑                |
| `startEdit`    | `(key: TKey) => void`    | 开始编辑（自动结束上一行）        |
| `stopEdit`     | `(key?: TKey) => void`   | 结束编辑，无参结束当前行          |
| `toggleEdit`   | `(key: TKey) => void`    | 切换编辑态                        |

## 说明

### 单行编辑模型

同一时刻只有一行可编辑。`startEdit(newKey)` 会先触发旧行的 `onEnd`，再触发新行的 `onStart`。多行同时编辑场景较少见，如需要可创建多个实例。

### 配合 useSubmit

```ts
const edit = useTableRowEdit<number>()
const submit = useSubmit()

async function onSave(row) {
  await submit.run(async () => {
    await api.update(row)
  })
  if (submit.success.value) edit.stopEdit(row.id)
}
```

### 泛型 TKey

默认 `string | number`，可按需收窄：

```ts
const { editingKey } = useTableRowEdit<string>() // 行 key 为 string
```
