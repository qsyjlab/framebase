# ProEditableTable 可编辑表格

基于 ProTable 封装的行编辑表格组件,内置新增行、行编辑、保存、取消、删除、校验等能力,通过 `columns` 中的 `editable` 配置即可让单元格变为可编辑状态。默认会在表格右侧自动追加"操作"列。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProEditableTable } from '@framebase/element-plus-pro-components'
import type { ProTableColumns } from '@framebase/element-plus-pro-components'

interface Record {
  id: number
  name: string
  age: number
  email: string
}

const data = ref<Record[]>([{ id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' }])

const columns: ProTableColumns<Record> = [
  { key: 'name', title: '姓名', editable: { rules: [{ required: true, message: '请输入姓名' }] } },
  { key: 'age', title: '年龄', editable: { type: 'number', min: 0, max: 150 } },
  { key: 'email', title: '邮箱', editable: { rules: [{ type: 'email', message: '邮箱格式错误' }] } }
]

async function onSave(row: Record) {
  await fetch('/api/users', { method: 'PUT', body: JSON.stringify(row) })
}

async function onDelete(row: Record) {
  await fetch(`/api/users/${row.id}`, { method: 'DELETE' })
}
</script>

<template>
  <ProEditableTable
    v-model="data"
    :columns="columns"
    row-key="id"
    :on-save="onSave"
    :on-delete="onDelete"
    :create-row="() => ({ id: Date.now(), name: '', age: 0, email: '' })"
  />
</template>
```

单行编辑模式(同时只允许一行处于编辑态):

```vue
<template>
  <ProEditableTable v-model="data" :columns="columns" mode="single" append-position="top" />
</template>
```

通过 `operation` 插槽自定义操作列:

```vue
<template>
  <ProEditableTable v-model="data" :columns="columns">
    <template #operation="{ row, editableState }">
      <el-button v-if="editableState" type="primary" link>保存</el-button>
    </template>
  </ProEditableTable>
</template>
```

## Props

| 属性            | 说明                                     | 类型                                    | 默认值        |
| --------------- | ---------------------------------------- | --------------------------------------- | ------------- |
| modelValue      | 数据数组,支持 v-model                    | `TRecord[]`                             | —             |
| data            | 数据数组(非受控)                         | `TRecord[]`                             | `[]`          |
| columns         | 列配置,通过 `column.editable` 控制可编辑 | `ProTableColumns<TRecord>`              | `[]`          |
| rowKey          | 行唯一标识字段或函数                     | `string \| ((row) => string \| number)` | `'id'`        |
| autoFitHeight   | 是否自适应父容器高度                     | `boolean`                               | `true`        |
| appendPosition  | 新增行的插入位置                         | `'top' \| 'bottom'`                     | `'bottom'`    |
| mode            | 编辑模式,`single` 单行 / `multiple` 多行 | `'single' \| 'multiple'`                | `'multiple'`  |
| editable        | ProTable editable 配置,覆盖默认          | `ProTableEditable`                      | —             |
| onSave          | 行保存回调,返回 false 阻止保存           | `(row) => boolean \| Promise<boolean>`  | —             |
| onCancel        | 行取消回调                               | `(row) => boolean \| Promise<boolean>`  | —             |
| onDelete        | 行删除回调,返回 false 阻止删除           | `(row) => boolean \| Promise<boolean>`  | —             |
| onError         | 校验失败回调                             | `(error) => void`                       | —             |
| createRow       | 创建新行数据工厂函数                     | `() => TRecord`                         | —             |
| operationKey    | 操作列的 key                             | `string`                                | `'operation'` |
| showActions     | 是否显示操作列                           | `boolean`                               | `true`        |
| showAddButton   | 是否显示底部"添加一行"按钮               | `boolean`                               | `true`        |
| options         | ProTable 工具栏配置                      | `boolean \| ProTableOptions`            | `true`        |
| appendErrorText | 新增失败时的提示文案                     | `string`                                | —             |
| tableProps      | 透传给 ProTable 的额外属性               | `object`                                | —             |

## 事件

| 事件名            | 说明       | 回调参数          |
| ----------------- | ---------- | ----------------- |
| update:modelValue | 数据变化   | `data: TRecord[]` |
| update:data       | 数据变化   | `data: TRecord[]` |
| change            | 数据变化   | `data: TRecord[]` |
| appendError       | 新增行失败 | `{ message }`     |

## 方法

通过 ref 可获取实例方法:`addRow()`、`startEditable(rowKey)`、`cancelEditable(rowKey)`、`saveEditable(rowKey)`、`deleteEditable(rowKey)`、`validateEditable(rowKey?)`、`saveAllEditable()`、`cancelAllEditable()`、`getEditableKeys()`、`getData()`、`hasEditingRow()`。
