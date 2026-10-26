<script setup lang="ts">
import { ref } from 'vue'
import { ProTree } from '@framebase/element-plus-pro-components'

const checkedKeys = ref<number[]>([])
const data = [
  {
    id: 1,
    label: '部门 A',
    children: [
      { id: 11, label: '小组 A1' },
      { id: 12, label: '小组 A2' }
    ]
  },
  { id: 2, label: '部门 B' }
]
</script>

<template>
  <ProTree
    v-model="checkedKeys"
    :data="data"
    node-key="id"
    checkable
    searchable
    default-expand-all
  />
</template>
