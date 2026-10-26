<script setup lang="ts">
import { ProStatus } from '@framebase/element-plus-pro-components'

const tones = ['success', 'processing', 'warning', 'danger', 'default'] as const
</script>

<template>
  <div class="status-block">
    <div class="status-row">
      <ProStatus v-for="tone in tones" :key="tone" :tone="tone" :text="tone" />
    </div>

    <div class="status-row">
      <ProStatus tone="success" text="运行中" variant="tag" />
      <ProStatus tone="processing" text="发布中" variant="tag" />
      <ProStatus tone="warning" text="待确认" variant="tag" />
      <ProStatus tone="danger" text="已失败" variant="tag" />
    </div>

    <div class="status-row">
      <ProStatus text="品牌状态" color="#722ed1" />
      <ProStatus
        text="高风险"
        variant="tag"
        :color="{
          foreground: '#d4380d',
          background: '#fff2e8',
          border: '#ffbb96',
          dot: '#fa541c'
        }"
      />
      <ProStatus tone="success" text="实时同步中" pulse />
    </div>
  </div>
</template>

<style scoped>
.status-block {
  display: grid;
  gap: 16px;
}
.status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
</style>
