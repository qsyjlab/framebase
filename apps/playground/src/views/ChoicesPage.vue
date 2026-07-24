<template>
  <div class="demo-stack">
    <div class="demo-grid">
      <DemoBlock title="ProSelect" description="单选、多选、字段映射和远程请求。">
        <ProSelect v-model="city" :options="cityOptions" placeholder="选择部署城市" clearable />
        <ProSelect v-model="cities" :options="cityOptions" multiple collapse-tags placeholder="选择多个城市" class="choice-control" />
        <div class="demo-value">{{ city }} / {{ cities }}</div>
      </DemoBlock>

      <DemoBlock title="ProRadioGroup / ProCheckboxGroup" description="统一选项结构与按钮模式。">
        <ProRadioGroup v-model="environment" :options="environmentOptions" option-type="button" />
        <ProCheckboxGroup v-model="modules" :options="moduleOptions" :max="3" class="choice-control" />
        <div class="demo-value">{{ environment }} / {{ modules }}</div>
      </DemoBlock>
    </div>

    <DemoBlock title="ProCheckCard / ProCheckCardGroup" description="单卡片、单选组、多选组和键盘导航。">
      <div class="check-grid">
        <ProCheckCard v-model="featured" value="featured" title="独立能力卡片" description="ProCheckCard 也可以脱离 Group 单独使用。" />
        <ProCheckCardGroup v-model="plan" :options="planOptions" :columns="3" />
      </div>
      <div class="demo-value">featured: {{ featured }} · plan: {{ plan }}</div>
    </DemoBlock>

    <div class="demo-grid">
      <DemoBlock title="ProTree" description="搜索、勾选、当前节点与展开控制。">
        <ProTree v-model="checkedNodes" :data="treeData" node-key="id" checkable searchable default-expand-all />
        <div class="demo-value">checked: {{ checkedNodes }}</div>
      </DemoBlock>
      <DemoBlock title="ProTreeSelect" description="树形数据选择与多选。">
        <ProTreeSelect v-model="treeValue" :data="treeData" node-key="id" multiple check-strictly placeholder="选择组织节点" />
        <div class="demo-value">selected: {{ treeValue }}</div>
      </DemoBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ProCheckCard,
  ProCheckCardGroup,
  ProCheckboxGroup,
  ProRadioGroup,
  ProSelect,
  ProTree,
  ProTreeSelect,
  type ProCheckCardOption
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

type Plan = 'starter' | 'growth' | 'enterprise'
const city = ref<string>()
const cities = ref<string[]>([])
const environment = ref('production')
const modules = ref<Array<string | number>>(['analytics'])
const featured = ref<string>()
const plan = ref<Plan>('growth')
const checkedNodes = ref<Array<string | number>>([])
const treeValue = ref<Array<string | number>>([])

const cityOptions = [
  { label: '上海', value: 'shanghai' },
  { label: '北京', value: 'beijing' },
  { label: '新加坡', value: 'singapore' }
]
const environmentOptions = [
  { label: '开发', value: 'development' },
  { label: '预发', value: 'staging' },
  { label: '生产', value: 'production' }
]
const moduleOptions = [
  { label: '数据分析', value: 'analytics' },
  { label: '自动化', value: 'automation' },
  { label: '审计', value: 'audit' },
  { label: 'AI 助手', value: 'assistant', disabled: true }
]
const planOptions: ProCheckCardOption<Plan>[] = [
  { value: 'starter', title: '基础版', description: '核心流程与 5 个成员席位。' },
  { value: 'growth', title: '成长版', description: '自动化、报表与 30 个席位。' },
  { value: 'enterprise', title: '企业版', description: '审计、组织权限和专属支持。' }
]
const treeData = [
  { id: 'product', label: '产品中心', children: [{ id: 'design', label: '设计系统' }, { id: 'growth', label: '增长产品' }] },
  { id: 'engineering', label: '技术中心', children: [{ id: 'frontend', label: '前端平台' }, { id: 'backend', label: '服务端平台' }] }
]
</script>

<style scoped>
.choice-control { width: 100%; margin-top: 14px; }
.check-grid { display: grid; gap: 14px; }
</style>
