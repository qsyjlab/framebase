<script setup lang="ts">
import { ref } from 'vue'
import { ProModalForm } from '@framebase/element-plus-pro-components'
import type { FormSchema } from '@framebase/element-plus-pro-components'

interface Model {
  name: string
  age: number
  email: string
}

const formRef = ref()
const fields: FormSchema<Model>[] = [
  {
    field: 'name',
    label: '姓名',
    component: 'input',
    rules: [{ required: true, message: '请输入姓名' }]
  },
  { field: 'age', label: '年龄', component: 'number' },
  { field: 'email', label: '邮箱', component: 'input' }
]

function openCreate() {
  formRef.value?.open()
}

async function onFinish(values: Model) {
  await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(values)
  })
  return true
}
</script>

<template>
  <el-button type="primary" @click="openCreate">新增</el-button>

  <ProModalForm
    ref="formRef"
    :fields="fields"
    title="新增用户"
    width="640px"
    :on-finish="onFinish"
    @success="() => console.log('提交成功')"
  />
</template>
