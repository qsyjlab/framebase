<template>
  <ProDescriptions :data="user" :columns="columns" title="用户信息" />
</template>

<script setup lang="ts">
import { ProDescriptions, type ProDescriptionColumns } from '@framebase/element-plus-pro-components'

interface User {
  name: string
  account: string
  role: string
  status: 'active' | 'disabled' | 'pending'
  balance: number
  createdAt: string
}

const user: User = {
  name: '陈晨',
  account: 'chenchen@framebase.dev',
  role: '管理员',
  status: 'active',
  balance: 8600,
  createdAt: '2025-03-18 10:24'
}

const statusEnum = {
  active: { text: '正常', type: 'success' },
  disabled: { text: '已禁用', type: 'danger' },
  pending: { text: '待激活', type: 'warning' }
} as const

const columns: ProDescriptionColumns<User> = [
  { key: 'name', dataIndex: 'name', label: '姓名' },
  { key: 'account', dataIndex: 'account', label: '账号' },
  { key: 'role', dataIndex: 'role', label: '角色' },
  {
    key: 'status',
    dataIndex: 'status',
    label: '状态',
    valueType: 'status',
    valueEnum: statusEnum
  },
  {
    key: 'balance',
    dataIndex: 'balance',
    label: '余额',
    valueType: { type: 'money', currency: 'CNY' }
  },
  { key: 'createdAt', dataIndex: 'createdAt', label: '创建时间', valueType: 'datetime' }
]
</script>
