<template>
  <div class="demo-stack">
    <DemoBlock title="ProCard / ProStatisticCard" description="切换加载状态可直接检查 ElSkeleton 样式是否进入发布产物。">
      <template #actions>
        <el-switch v-model="loading" inline-prompt active-text="加载" inactive-text="就绪" />
      </template>
      <div class="stat-grid">
        <ProStatisticCard title="本月收入" :value="286.4" :precision="1" prefix="¥" suffix="万" trend="up" trend-value="14.2%" :loading="loading" />
        <ProStatisticCard title="活跃客户" :value="1286" suffix="家" trend="up" trend-value="8.6%" :loading="loading" />
        <ProStatisticCard title="逾期任务" :value="18" suffix="项" trend="down" trend-value="5" :loading="loading" />
      </div>
      <ProCard title="交付阶段" subtitle="响应式网格与折叠" collapsible header-bordered :columns="3" :loading="loading" class="delivery-card">
        <div v-for="item in stages" :key="item.name" class="stage-item">
          <span>{{ item.name }}</span><strong>{{ item.value }}</strong><el-progress :percentage="item.progress" :show-text="false" />
        </div>
      </ProCard>
    </DemoBlock>

    <DemoBlock title="ProDescriptions" description="字段类型、状态映射、复制与分组展示。">
      <ProDescriptions title="项目详情" :data="project" :columns="descriptionColumns" border :column="3" />
    </DemoBlock>

    <div class="demo-grid">
      <DemoBlock title="ProEmpty" description="统一空、搜索、错误和无权限状态。">
        <ProEmpty status="search" title="没有符合条件的记录" action-text="清空筛选" compact @action="notify('已清空筛选')" />
      </DemoBlock>
      <DemoBlock title="ProResult" description="统一成功、权限和异常结果页。">
        <ProResult status="success" title="发布成功" sub-title="内容已进入发布队列。" primary-text="查看内容" secondary-text="继续创建" @primary="notify('查看内容')" />
      </DemoBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import {
  ProCard,
  ProDescriptions,
  ProEmpty,
  ProResult,
  ProStatisticCard,
  type ProDescriptionColumns
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

interface Project { name: string; owner: string; status: string; budget: number; createdAt: string; description: string }

const loading = ref(false)
const stages = [
  { name: '需求确认', value: 24, progress: 92 },
  { name: '开发中', value: 38, progress: 68 },
  { name: '待发布', value: 9, progress: 25 }
]
const project: Project = { name: 'Framebase', owner: '平台团队', status: 'active', budget: 286400, createdAt: '2026-07-24 10:30:00', description: '共享基础框架与组件能力。' }
const descriptionColumns: ProDescriptionColumns<Project> = [
  { key: 'name', dataIndex: 'name', label: '项目名称', copyable: true },
  { key: 'owner', dataIndex: 'owner', label: '负责人' },
  { key: 'status', dataIndex: 'status', label: '状态', valueType: 'status', valueEnum: { active: { text: '进行中', type: 'success' } } },
  { key: 'budget', dataIndex: 'budget', label: '预算', valueType: { type: 'money', currency: 'CNY' } },
  { key: 'createdAt', dataIndex: 'createdAt', label: '创建时间', valueType: 'datetime' },
  { key: 'description', dataIndex: 'description', label: '说明' }
]

function notify(message: string) { ElMessage.success(message) }
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.delivery-card { margin-top: 14px; }
.stage-item { display: grid; gap: 8px; }
.stage-item span { color: var(--el-text-color-secondary); }
.stage-item strong { font-size: 24px; }
@media (max-width: 800px) { .stat-grid { grid-template-columns: 1fr; } }
</style>
