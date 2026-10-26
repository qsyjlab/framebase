<script setup lang="ts">
import { ref } from 'vue'
import { ProDrawerForm } from '@framebase/element-plus-pro-components'
import type { FormSchema } from '@framebase/element-plus-pro-components'

interface Model {
  name: string
  desc: string
  enabled: boolean
}

const formRef = ref()
const fields: FormSchema<Model>[] = [
  {
    field: 'name',
    label: '名称',
    component: 'input',
    rules: [{ required: true, message: '请输入名称' }]
  },
  { field: 'desc', label: '描述', component: 'textarea' },
  { field: 'enabled', label: '启用', component: 'switch' }
]

async function onFinish(values: Model) {
  await fetch('/api/items', { method: 'POST', body: JSON.stringify(values) })
  return true
}
</script>

<template>
  <el-button type="primary" @click="formRef?.open()">新增</el-button>

  <ProDrawerForm
    ref="formRef"
    :fields="fields"
    title="新增项目"
    drawer-size="560px"
    :on-finish="onFinish"
  />
</template>
