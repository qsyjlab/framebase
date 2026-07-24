<template>
  <div class="demo-stack">
    <DemoBlock
      title="ProModalForm / ProDrawerForm"
      description="统一加载、提交、脏数据拦截和关闭流程。"
    >
      <div class="button-row">
        <el-button type="primary" @click="modalVisible = true">打开 Modal 表单</el-button>
        <el-button @click="drawerVisible = true">打开 Drawer 表单</el-button>
      </div>
      <ProModalForm
        v-model="modalVisible"
        title="新建项目"
        :fields="containerFields"
        :initial-values="initialValues"
        :on-finish="finishContainer"
      />
      <ProDrawerForm
        v-model="drawerVisible"
        title="编辑项目"
        :fields="containerFields"
        :initial-values="initialValues"
        :on-finish="finishContainer"
      />
    </DemoBlock>

    <DemoBlock title="ProStepsForm" description="分步校验、值合并、上一步和最终提交。">
      <ProStepsForm :steps="steps" :initial-values="initialValues" :on-finish="finishSteps" />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import {
  ProDrawerForm,
  ProModalForm,
  ProStepsForm,
  type ProFormSchema,
  type ProStepsFormStep
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

interface ProjectForm {
  name: string
  owner: string
  region: string
  notifications: boolean
}
const modalVisible = ref(false)
const drawerVisible = ref(false)
const initialValues: ProjectForm = {
  name: 'Framebase',
  owner: '平台团队',
  region: 'shanghai',
  notifications: true
}
const containerFields: ProFormSchema<ProjectForm> = [
  { key: 'name', label: '项目名称', valueType: 'text', required: true },
  { key: 'owner', label: '负责人', valueType: 'text', required: true },
  {
    key: 'region',
    label: '部署区域',
    valueType: 'select',
    options: [
      { label: '上海', value: 'shanghai' },
      { label: '北京', value: 'beijing' }
    ]
  },
  { key: 'notifications', label: '通知', valueType: 'switch' }
]
const steps: ProStepsFormStep<ProjectForm>[] = [
  {
    key: 'base',
    title: '基础信息',
    description: '填写项目名称和负责人',
    fields: containerFields.slice(0, 2)
  },
  {
    key: 'deploy',
    title: '部署设置',
    description: '选择区域与通知方式',
    fields: containerFields.slice(2)
  }
]

async function finishContainer(values: ProjectForm) {
  await new Promise(resolve => setTimeout(resolve, 250))
  ElMessage.success(`已保存 ${values.name}`)
  return values
}

async function finishSteps(values: ProjectForm) {
  ElMessage.success(`分步表单已提交：${values.name}`)
  return values
}
</script>
