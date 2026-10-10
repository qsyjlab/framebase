<template>
  <ProPageContainer
    title="用户详情"
    subtitle="ID: 10001"
    description="查看用户基础信息及最近操作记录。"
    :breadcrumb="['首页', { text: '用户管理', to: '/users' }, '用户详情']"
    bordered
    @back="handleBack"
  >
    <template #extra>
      <ElButton>编辑</ElButton>
      <ElButton type="primary">保存</ElButton>
    </template>

    <ProDescriptions :columns="columns" :data="user" bordered />

    <template #footer>
      <ElButton>取消</ElButton>
      <ElButton type="primary">确认</ElButton>
    </template>
  </ProPageContainer>
</template>

<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import {
  ProDescriptions,
  ProPageContainer,
  type ProDescriptionColumns
} from '@framebase/element-plus-pro-components'

const user = {
  name: '青衫依旧',
  status: '正常',
  email: 'user@example.com'
}

const columns: ProDescriptionColumns<typeof user> = [
  { key: 'name', dataIndex: 'name', label: '用户名' },
  { key: 'status', dataIndex: 'status', label: '状态' },
  { key: 'email', dataIndex: 'email', label: '邮箱' }
]

function handleBack() {
  ElMessage.info('返回上一页')
}
</script>
