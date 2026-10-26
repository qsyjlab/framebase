<template>
  <ProModalForm
    ref="formRef"
    :fields="fields"
    :initial-values="initialValues"
    :on-finish="handleFinish"
    @success="emit('success')"
  />
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  ProModalForm,
  type ProFormSchema,
  type ProModalFormInstance
} from '@framebase/element-plus-pro-components'
import type { UserFormModel } from './api'
import { departmentEnum, statusEnum } from './columns'

const props = defineProps<{
  /** 由 useCrudTable 的 submitForm 提供：内部区分新增 / 更新 */
  submit: (values: UserFormModel) => Promise<void>
}>()

const emit = defineEmits<{ success: [] }>()

const formRef = shallowRef<ProModalFormInstance<UserFormModel> | null>(null)

const initialValues: UserFormModel = {
  name: '',
  email: '',
  department: '',
  status: 'active'
}

const fields: ProFormSchema<UserFormModel> = [
  {
    key: 'name',
    name: 'name',
    label: '姓名',
    required: true,
    requiredMessage: '请输入姓名',
    col: { span: 12 }
  },
  {
    key: 'status',
    name: 'status',
    label: '状态',
    valueType: 'radio',
    valueEnum: statusEnum,
    col: { span: 12 }
  },
  {
    key: 'email',
    name: 'email',
    label: '邮箱',
    required: true,
    requiredMessage: '请输入邮箱'
  },
  {
    key: 'department',
    name: 'department',
    label: '部门',
    valueType: 'select',
    valueEnum: departmentEnum
  }
]

async function handleFinish(values: UserFormModel) {
  await props.submit(values)
}

function open(options?: { id?: number; values?: Partial<UserFormModel>; title?: string }) {
  return formRef.value?.open(options)
}

defineExpose({ open })
</script>
