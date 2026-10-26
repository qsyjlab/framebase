<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ProStepsForm,
  type FormSchema,
  type ProStepsFormInstance
} from '@framebase/element-plus-pro-components'

interface Model {
  name: string
  email: string
  plan: string
  remark: string
}

const formRef = ref<ProStepsFormInstance<Model> | null>(null)

const steps = [
  {
    key: 'basic',
    title: '基本信息',
    description: '填写账户信息',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: '姓名',
        required: true,
        requiredMessage: '请输入姓名'
      },
      { key: 'email', name: 'email', label: '邮箱' }
    ] as FormSchema<Model>[]
  },
  {
    key: 'plan',
    title: '套餐选择',
    fields: [
      {
        key: 'plan',
        name: 'plan',
        label: '套餐',
        valueType: 'select',
        options: [
          { label: '免费版', value: 'free' },
          { label: '专业版', value: 'pro' }
        ]
      }
    ] as FormSchema<Model>[]
  },
  {
    key: 'confirm',
    title: '确认信息',
    fields: [
      { key: 'remark', name: 'remark', label: '备注', valueType: 'textarea' }
    ] as FormSchema<Model>[],
    beforeNext: (values: Model) => {
      if (!values.plan) {
        ElMessage.warning('请先选择套餐')
        return false
      }
      return true
    }
  }
]

async function onFinish(values: Model) {
  await new Promise(resolve => setTimeout(resolve, 400))
  ElMessage.success(`提交成功：${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <ProStepsForm
    ref="formRef"
    :steps="steps"
    :initial-values="{ name: '', email: '', plan: '', remark: '' }"
    :on-finish="onFinish"
  />
</template>
