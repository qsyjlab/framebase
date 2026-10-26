<script setup lang="ts">
import { ref } from 'vue'
import { ProLightFilter, type ProLightFilterField } from '@framebase/element-plus-pro-components'

const values = ref<Record<string, unknown>>({})

const fields: ProLightFilterField[] = [
  {
    key: 'gender',
    label: '性别',
    valueType: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ]
  },
  {
    key: 'tag',
    label: '标签',
    valueType: 'select',
    options: [
      { label: '重要', value: 'important' },
      { label: '紧急', value: 'urgent' },
      { label: '常规', value: 'normal' }
    ]
  },
  {
    key: 'keyword',
    label: '关键词',
    valueType: 'text',
    placeholder: '请输入关键词'
  },
  {
    key: 'date',
    label: '日期',
    valueType: 'date'
  },
  {
    key: 'active',
    label: '仅看已激活',
    valueType: 'switch',
    collapsed: true
  }
]
</script>

<template>
  <div class="light-filter-demo">
    <ProLightFilter v-model="values" :fields="fields" />
    <pre class="light-filter-demo__value">{{ JSON.stringify(values, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.light-filter-demo {
  display: grid;
  gap: 12px;
}
.light-filter-demo__value {
  margin: 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font:
    12px/1.6 ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;
}
</style>
