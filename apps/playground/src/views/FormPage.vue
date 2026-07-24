<template>
  <div class="demo-stack">
    <DemoBlock title="ProField" description="同一 valueType 在编辑态和只读态共享格式化规则。">
      <div class="field-grid">
        <label
          >编辑态金额
          <ProField v-model="amount" mode="edit" :value-type="{ type: 'money', currency: 'CNY' }"
        /></label>
        <label
          >只读金额
          <ProField
            :model-value="amount"
            mode="read"
            :value-type="{ type: 'money', currency: 'CNY' }"
        /></label>
        <label
          >编辑态状态
          <ProField v-model="status" mode="edit" value-type="select" :value-enum="statusEnum"
        /></label>
        <label
          >只读状态
          <ProField :model-value="status" mode="read" value-type="status" :value-enum="statusEnum"
        /></label>
      </div>
    </DemoBlock>

    <DemoBlock title="ProForm" description="Schema 驱动字段、栅格布局、校验、折叠和提交。">
      <ProForm
        :model="formModel"
        :fields="formFields"
        :label-width="96"
        :submitter="{ submitText: '保存配置', resetText: '恢复默认' }"
        :on-finish="saveForm"
      />
      <pre class="form-json">{{ JSON.stringify(formModel, null, 2) }}</pre>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import {
  ProField,
  ProForm,
  type ProFormSchema,
  type ProFieldValueEnum
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

interface WorkspaceForm {
  name: string
  region: string
  capacity: number
  notifications: boolean
  description: string
}

const amount = ref(128600)
const status = ref('processing')
const statusEnum: ProFieldValueEnum = {
  pending: { text: '待处理', type: 'warning' },
  processing: { text: '进行中', type: 'primary' },
  completed: { text: '已完成', type: 'success' }
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
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.field-grid label {
  display: grid;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
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
@media (max-width: 720px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
