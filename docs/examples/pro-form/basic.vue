<template>
  <ProForm
    :model="formModel"
    :fields="formFields"
    :label-width="96"
    :submitter="{ submitText: '保存配置', resetText: '恢复默认' }"
    :on-finish="saveForm"
  />
  <pre class="form-json">{{ JSON.stringify(formModel, null, 2) }}</pre>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'
import { ProForm, type ProFormSchema } from '@framebase/element-plus-pro-components'

interface WorkspaceForm {
  name: string
  region: string
  capacity: number
  notifications: boolean
  description: string
}

const formModel = reactive<WorkspaceForm>({
  name: 'Northstar workspace',
  region: 'shanghai',
  capacity: 24,
  notifications: true,
  description: ''
})

const formFields: ProFormSchema<WorkspaceForm> = [
  {
    key: 'name',
    label: '工作区名称',
    valueType: 'text',
    required: true,
    col: { span: 12 },
    fieldProps: { placeholder: '输入名称' }
  },
  {
    key: 'region',
    label: '部署区域',
    valueType: 'select',
    required: true,
    col: { span: 12 },
    options: [
      { label: '上海', value: 'shanghai' },
      { label: '北京', value: 'beijing' },
      { label: '新加坡', value: 'singapore' }
    ]
  },
  {
    key: 'capacity',
    label: '成员容量',
    valueType: 'number',
    col: { span: 12 },
    fieldProps: { min: 1, max: 500 }
  },
  { key: 'notifications', label: '邮件通知', valueType: 'switch', col: { span: 12 } },
  {
    key: 'description',
    label: '工作区说明',
    valueType: 'textarea',
    col: { span: 24 },
    fieldProps: { rows: 3 }
  }
]

function saveForm(values: WorkspaceForm) {
  Object.assign(formModel, values)
  ElMessage.success('表单已保存')
}
</script>

<style scoped>
.form-json {
  overflow: auto;
  margin: 8px 0 0;
  padding: 14px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font:
    12px/1.55 ui-monospace,
    monospace;
}
</style>
