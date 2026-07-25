<template>
  <div class="provider-demo">
    <div class="provider-actions">
      <ElRadioGroup v-model="size" size="small">
        <ElRadioButton value="small">紧凑</ElRadioButton>
        <ElRadioButton value="default">默认</ElRadioButton>
        <ElRadioButton value="large">宽松</ElRadioButton>
      </ElRadioGroup>
      <ElSwitch v-model="dark" inline-prompt active-text="暗" inactive-text="亮" />
    </div>

    <ProConfigProvider
      :size="size"
      :dark="dark"
      :field="{ emptyText: '暂无数据' }"
      :card="{ shadow: 'never' }"
    >
      <div class="provider-preview">
        <ProCard title="局部配置预览" subtitle="组件继承 Provider 尺寸与主题">
          <div class="button-row">
            <ElButton type="primary">主要操作</ElButton>
            <ElButton>次要操作</ElButton>
          </div>
        </ProCard>
        <ProDescriptions :data="details" :columns="columns" title="配置详情" />
      </div>
    </ProConfigProvider>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElRadioButton, ElRadioGroup, ElSwitch } from 'element-plus'
import {
  ProCard,
  ProConfigProvider,
  ProDescriptions,
  type ProDescriptionColumns
} from '@framebase/element-plus-pro-components'

interface Details {
  theme: string
  size: string
  scope: string
}

const dark = ref(false)
const size = ref<'small' | 'default' | 'large'>('default')

const details: Details = {
  theme: 'Framebase',
  size: '继承 Provider',
  scope: '局部生效'
}

const columns: ProDescriptionColumns<Details> = [
  { key: 'theme', dataIndex: 'theme', label: '主题' },
  { key: 'size', dataIndex: 'size', label: '尺寸' },
  { key: 'scope', dataIndex: 'scope', label: '作用域' }
]
</script>

<style scoped>
.provider-demo {
  display: grid;
  gap: 16px;
}
.provider-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.provider-preview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 16px;
  border-radius: 8px;
  background: var(--el-bg-color-page);
}
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
@media (max-width: 760px) {
  .provider-preview {
    grid-template-columns: 1fr;
  }
}
</style>
