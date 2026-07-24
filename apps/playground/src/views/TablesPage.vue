<template>
  <div class="demo-stack">
    <DemoBlock title="ProTable" description="请求分页、状态渲染、选择、密度和列设置。">
      <ProTable
        v-model:selected-keys="selectedKeys"
        :columns="columns"
        :request="requestRows"
        row-key="id"
        checkable
        header-title="订单列表"
        :options="{ reload: true, density: true, setting: true }"
        :pagination="{ pageSize: 5 }"
      />
    </DemoBlock>

    <DemoBlock title="ProEditableTable" description="行编辑、新增、校验、保存和删除。">
      <ProEditableTable
        v-model="editableRows"
        :columns="editableColumns"
        row-key="id"
        mode="multiple"
        :auto-fit-height="false"
        :create-row="createRow"
        :on-save="saveRow"
        :on-delete="deleteRow"
      />
    </DemoBlock>

    <DemoBlock title="ProDragSortTable" description="拖动手柄调整任务优先级。">
      <ProDragSortTable
        v-model="sortableRows"
        :columns="dragColumns"
        row-key="id"
        header-title="任务优先级"
        :auto-fit-height="false"
        @drag-sort-end="onDragEnd"
      />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import {
  ProDragSortTable,
  ProEditableTable,
  ProTable,
  type ProDragSortTableEnd,
  type ProTableColumns,
  type ProTableRequestParams,
  type ProTableRequestResult
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

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
const selectedKeys = ref<Array<string | number>>([])
const editableRows = ref<Row[]>(rows.slice(0, 3).map(row => ({ ...row })))
const sortableRows = ref<Row[]>(rows.slice(3, 8).map(row => ({ ...row })))
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
const editableColumns: ProTableColumns<Row> = columns.map(column => ({
  ...column,
  editable: column.key !== 'status' ? true : true
}))
const dragColumns: ProTableColumns<Row> = columns.filter(column => column.key !== 'amount')

async function requestRows(
  params: ProTableRequestParams<Record<string, never>>
): Promise<ProTableRequestResult<Row>> {
  await new Promise(resolve => setTimeout(resolve, 180))
  const start = (params.current - 1) * params.pageSize
  return { data: rows.slice(start, start + params.pageSize), total: rows.length, success: true }
}
function createRow(): Row {
  return { id: Date.now(), name: '', owner: '', amount: 0, status: 'pending' }
}
async function saveRow(row: Row) {
  ElMessage.success(`${row.name || '新订单'} 已保存`)
}
async function deleteRow(row: Row) {
  ElMessage.success(`${row.name || '新订单'} 已删除`)
}
function onDragEnd(event: ProDragSortTableEnd<Row>) {
  ElMessage.success(`${event.row.name} 已移动到第 ${event.newIndex + 1} 位`)
}
</script>
