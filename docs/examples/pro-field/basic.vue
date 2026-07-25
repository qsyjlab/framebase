<template>
  <div class="field-grid">
    <div class="field-item">
      <span class="field-label">编辑态文本</span>
      <ProField v-model="text" mode="edit" value-type="text" />
    </div>
    <div class="field-item">
      <span class="field-label">只读态文本</span>
      <ProField :model-value="text" mode="read" value-type="text" />
    </div>

    <div class="field-item">
      <span class="field-label">编辑态金额</span>
      <ProField v-model="amount" mode="edit" :value-type="{ type: 'money', currency: 'CNY' }" />
    </div>
    <div class="field-item">
      <span class="field-label">只读金额</span>
      <ProField
        :model-value="amount"
        mode="read"
        :value-type="{ type: 'money', currency: 'CNY' }"
      />
    </div>

    <div class="field-item">
      <span class="field-label">编辑态状态</span>
      <ProField v-model="status" mode="edit" value-type="select" :value-enum="statusEnum" />
    </div>
    <div class="field-item">
      <span class="field-label">只读状态</span>
      <ProField :model-value="status" mode="read" value-type="status" :value-enum="statusEnum" />
    </div>

    <div class="field-item">
      <span class="field-label">编辑态开关</span>
      <ProField v-model="enabled" mode="edit" value-type="switch" />
    </div>
    <div class="field-item">
      <span class="field-label">只读开关</span>
      <ProField :model-value="enabled" mode="read" value-type="switch" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ProField, type ProFieldValueEnum } from '@framebase/element-plus-pro-components'

const text = ref('Northstar 工作区')
const amount = ref(128600)
const status = ref('processing')
const enabled = ref(true)

const statusEnum: ProFieldValueEnum = {
  pending: { text: '待处理', type: 'warning' },
  processing: { text: '进行中', type: 'primary' },
  completed: { text: '已完成', type: 'success' }
}
</script>

<style scoped>
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.field-item {
  display: grid;
  gap: 8px;
}
.field-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
@media (max-width: 720px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
