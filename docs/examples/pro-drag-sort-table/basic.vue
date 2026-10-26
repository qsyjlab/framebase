<script setup lang="ts">
import { ref } from 'vue'
import { ProDragSortTable } from '@framebase/element-plus-pro-components'
import type { ProTableColumns } from '@framebase/element-plus-pro-components'

interface Step {
  id: number
  name: string
  desc: string
}

const data = ref<Step[]>([
  { id: 1, name: '提交申请', desc: '填写表单' },
  { id: 2, name: '主管审批', desc: '主管审核' },
  { id: 3, name: '财务打款', desc: '出纳处理' }
])

const columns: ProTableColumns<Step> = [
  { key: 'name', title: '步骤名称' },
  { key: 'desc', title: '描述' }
]

function onSortEnd(payload: { data: Step[] }) {
  console.log('排序结果:', payload.data)
}
</script>

<template>
  <ProDragSortTable
    v-model="data"
    :columns="columns"
    row-key="id"
    :animation="200"
    @drag-sort-end="onSortEnd"
  />
</template>
