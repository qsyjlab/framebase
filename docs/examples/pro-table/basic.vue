<template>
  <ProTable
    :columns="columns"
    :request="requestRows"
    row-key="id"
    header-title="订单列表"
    :pagination="{ pageSize: 5 }"
    :border="false"
  />
</template>

<script setup lang="ts">
import {
  ProTable,
  type ProTableColumns,
  type ProTableRequestParams,
  type ProTableRequestResult
} from '@framebase/element-plus-pro-components'

interface Row {
  id: number
  name: string
  owner: string
  amount: number
  status: 'pending' | 'processing' | 'completed'
}

const rows: Row[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: `项目订单 ${index + 1}`,
  owner: ['张伟', '李娜', '王强'][index % 3]!,
  amount: 12800 + index * 1350,
  status: ['pending', 'processing', 'completed'][index % 3] as Row['status']
}))

const statusEnum = {
  pending: { text: '待处理', type: 'warning' },
  processing: { text: '进行中', type: 'primary' },
  completed: { text: '已完成', type: 'success' }
} as const

const columns: ProTableColumns<Row> = [
  { key: 'name', dataIndex: 'name', title: '订单名称', minWidth: 180 },
  { key: 'owner', dataIndex: 'owner', title: '负责人', width: 110 },
  {
    key: 'amount',
    dataIndex: 'amount',
    title: '金额',
    width: 130,
    align: 'right',
    valueType: { type: 'money', currency: 'CNY' }
  },
  {
    key: 'status',
    dataIndex: 'status',
    title: '状态',
    width: 110,
    valueType: 'status',
    valueEnum: statusEnum
  }
]

async function requestRows(
  params: ProTableRequestParams<Record<string, never>>
): Promise<ProTableRequestResult<Row>> {
  await new Promise(resolve => setTimeout(resolve, 180))
  const start = (params.current - 1) * params.pageSize
  return { data: rows.slice(start, start + params.pageSize), total: rows.length, success: true }
}
</script>
