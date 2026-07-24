<template>
  <div class="demo-stack">
    <DemoBlock title="ProConfigProvider" description="局部尺寸、暗黑模式、卡片默认值和主题变量。">
      <template #actions>
        <el-radio-group v-model="size" size="small">
          <el-radio-button value="small">紧凑</el-radio-button>
          <el-radio-button value="default">默认</el-radio-button>
          <el-radio-button value="large">宽松</el-radio-button>
        </el-radio-group>
        <el-switch v-model="dark" inline-prompt active-text="暗" inactive-text="亮" />
      </template>
      <ProConfigProvider
        :size="size"
        :dark="dark"
        :field="{ emptyText: '暂无数据' }"
        :card="{ shadow: 'never' }"
        :theme="{ variables: themeVariables }"
      >
        <div class="provider-preview">
          <ProCard title="局部配置预览" subtitle="组件继承 Provider 尺寸与主题">
            <div class="button-row">
              <el-button type="primary">主要操作</el-button>
              <ProSelect v-model="member" :options="members" placeholder="选择成员" style="width: 220px" />
            </div>
          </ProCard>
          <ProDescriptions :data="details" :columns="columns" title="配置详情" />
        </div>
      </ProConfigProvider>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ProCard, ProConfigProvider, ProDescriptions, ProSelect, type ProDescriptionColumns } from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

interface Details { theme: string; primary: string; size: string }
const dark = ref(false)
const size = ref<'small' | 'default' | 'large'>('default')
const member = ref<number>()
const members = [{ label: '陈晨', value: 1 }, { label: '林涛', value: 2 }, { label: '周宁', value: 3 }]
const themeVariables = {
  '--el-color-primary': '#165bbc',
  '--el-color-primary-rgb': '22, 91, 188',
  '--el-color-primary-dark-2': '#124996',
  '--el-color-primary-light-1': '#2d6bc3',
  '--el-color-primary-light-2': '#457cc9',
  '--el-color-primary-light-3': '#5c8cd0',
  '--el-color-primary-light-4': '#739dd7',
  '--el-color-primary-light-5': '#8badde',
  '--el-color-primary-light-6': '#a2bde4',
  '--el-color-primary-light-7': '#b9ceeb',
  '--el-color-primary-light-8': '#d0def2',
  '--el-color-primary-light-9': '#e8eff8'
}
const details: Details = { theme: 'Framebase', primary: '#165BBC', size: '继承 Provider' }
const columns: ProDescriptionColumns<Details> = [
  { key: 'theme', dataIndex: 'theme', label: '主题' },
  { key: 'primary', dataIndex: 'primary', label: '主色' },
  { key: 'size', dataIndex: 'size', label: '尺寸' }
]
</script>

<style scoped>
.provider-preview { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding: 16px; border-radius: 7px; background: var(--el-bg-color-page); color: var(--el-text-color-primary); }
@media (max-width: 760px) { .provider-preview { grid-template-columns: 1fr; } }
</style>
