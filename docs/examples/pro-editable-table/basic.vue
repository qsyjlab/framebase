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
