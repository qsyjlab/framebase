<template>
  <main class="playground-shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand__mark">F</span>
        <span>Framebase</span>
        <el-tag effect="plain" size="small">Playground</el-tag>
      </div>
      <div class="topbar__actions">
        <el-tag type="success" effect="light" size="small">Vue 3 + Element Plus</el-tag>
        <el-tooltip :content="isDark ? '切换为亮色模式' : '切换为深色模式'" placement="bottom">
          <el-button
            circle
            :aria-label="isDark ? '切换为亮色模式' : '切换为深色模式'"
            :icon="isDark ? Sunny : Moon"
            @click="toggleTheme"
          />
        </el-tooltip>
      </div>
    </header>

    <section class="workspace-heading">
      <div>
        <p class="eyebrow">@framebase/element-plus-pro-components</p>
        <h1>组件预览</h1>
      </div>
      <el-button type="primary" :icon="Refresh" @click="reloadTable">刷新订单</el-button>
    </section>

    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="数据表格" name="table">
        <section class="demo-grid">
          <article class="panel panel--table">
            <div class="panel__heading">
              <div>
                <h2>订单管理</h2>
                <p>服务端分页、选择与状态渲染。</p>
              </div>
              <el-tag effect="plain">{{ selectedKeys.length }} 条已选</el-tag>
            </div>
            <ProTable
              ref="tableRef"
              v-model:selected-keys="selectedKeys"
              :columns="columns"
              :request="requestOrders"
              :pagination="{ pageSize: 5, pageSizes: [5, 10] }"
              row-key="id"
              header-title="销售订单"
              checkable
              :options="{ reload: true, density: true, setting: true }"
            >
              <template #toolbar>
                <el-button :icon="Refresh" @click="reloadTable">刷新</el-button>
              </template>
              <template #operation="{ row }">
                <el-button link type="primary" @click="showOrder(row.orderNo)">查看</el-button>
              </template>
            </ProTable>
          </article>

          <aside class="panel panel--summary">
            <div class="panel__heading">
              <div>
                <h2>本周概览</h2>
                <p>ProCard 组合普通 Element Plus 内容。</p>
              </div>
            </div>
            <div class="stat-grid">
              <ProCard v-for="item in stats" :key="item.label" :body-padding="16" bordered>
                <span class="stat__label">{{ item.label }}</span>
                <strong class="stat__value">{{ item.value }}</strong>
                <span class="stat__delta" :class="item.tone">{{ item.delta }}</span>
              </ProCard>
            </div>
          </aside>
        </section>
      </el-tab-pane>

      <el-tab-pane label="配置表单" name="form">
        <section class="demo-grid demo-grid--form">
          <article class="panel">
            <div class="panel__heading">
              <div>
                <h2>工作区配置</h2>
                <p>Schema 驱动的字段、校验和提交状态。</p>
              </div>
            </div>
            <ProForm
              ref="formRef"
              :model="formModel"
              :fields="formFields"
              :label-width="96"
              :submitter="{ submitText: '保存配置', resetText: '恢复默认' }"
              :on-finish="saveWorkspace"
            />
          </article>
          <aside class="panel form-preview">
            <div class="panel__heading">
              <div>
                <h2>当前值</h2>
                <p>表单状态实时绑定。</p>
              </div>
            </div>
            <pre>{{ JSON.stringify(formModel, null, 2) }}</pre>
          </aside>
        </section>
      </el-tab-pane>

      <el-tab-pane label="套餐选择" name="selection">
        <section class="demo-grid demo-grid--selection">
          <article class="panel">
            <div class="panel__heading">
              <div>
                <h2>服务套餐</h2>
                <p>支持单选、多选、禁用和键盘导航。</p>
              </div>
              <el-tag type="success" effect="light">{{ selectedPlanLabel }}</el-tag>
            </div>
            <ProCheckCardGroup v-model="plan" :options="planOptions" :columns="3" />
          </article>
          <article class="panel">
            <div class="panel__heading">
              <div>
                <h2>启用模块</h2>
                <p>选择后可直接用于业务表单提交。</p>
              </div>
              <el-tag effect="plain">{{ enabledModules.length }} 个模块</el-tag>
            </div>
            <ProCheckCardGroup
              v-model="enabledModules"
              :options="moduleOptions"
              :columns="2"
              multiple
            />
          </article>
        </section>
      </el-tab-pane>
    </el-tabs>
  </main>
</template>

<script setup lang="ts">
import { Moon, Refresh, Sunny } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, reactive, ref, useTemplateRef } from 'vue'
import {
  ProCard,
  ProCheckCardGroup,
  ProForm,
  ProTable,
  useProTable,
  type FormSchema,
  type ProCheckCardOption,
  type ProTableColumns,
  type ProTableInstance,
  type ProTableRequestParams,
  type ProTableRequestResult
} from '@framebase/element-plus-pro-components'

interface OrderRecord {
  id: number
  orderNo: string
  customer: string
  owner: string
  amount: number
  status: 'pending' | 'processing' | 'completed'
}

type OrderQuery = Record<string, never>

interface WorkspaceForm {
  name: string
  region: string
  notifications: boolean
  capacity: number
}

type Plan = 'starter' | 'growth' | 'enterprise'
type Module = 'analytics' | 'automation' | 'audit' | 'assistant'

const activeTab = ref('table')
const isDark = ref(false)
const selectedKeys = ref<Array<string | number>>([])
const tableRef = useTemplateRef<ProTableInstance<OrderRecord>>('tableRef')
const table = useProTable<OrderRecord>(tableRef)
const plan = ref<Plan>('growth')
const enabledModules = ref<Module[]>(['analytics', 'automation'])
const formModel = reactive<WorkspaceForm>({
  name: 'Northstar workspace',
  region: 'shanghai',
  notifications: true,
  capacity: 24
})

const orders: OrderRecord[] = [
  {
    id: 1,
    orderNo: 'SO-2026-0018',
    customer: '青岚科技',
    owner: '王晨',
    amount: 12800,
    status: 'processing'
  },
  {
    id: 2,
    orderNo: 'SO-2026-0019',
    customer: '远航制造',
    owner: '林晓',
    amount: 28600,
    status: 'completed'
  },
  {
    id: 3,
    orderNo: 'SO-2026-0020',
    customer: '新域零售',
    owner: '周言',
    amount: 7600,
    status: 'pending'
  },
  {
    id: 4,
    orderNo: 'SO-2026-0021',
    customer: '栖云网络',
    owner: '郑扬',
    amount: 19200,
    status: 'processing'
  },
  {
    id: 5,
    orderNo: 'SO-2026-0022',
    customer: '海岬物流',
    owner: '陆然',
    amount: 15400,
    status: 'completed'
  },
  {
    id: 6,
    orderNo: 'SO-2026-0023',
    customer: '深蓝数据',
    owner: '苏璇',
    amount: 33400,
    status: 'pending'
  },
  {
    id: 7,
    orderNo: 'SO-2026-0024',
    customer: '源点医疗',
    owner: '沈哲',
    amount: 21800,
    status: 'processing'
  }
]

const columns: ProTableColumns<OrderRecord> = [
  { key: 'order-no', dataIndex: 'orderNo', title: '订单编号', width: 150 },
  { key: 'customer', dataIndex: 'customer', title: '客户', minWidth: 130 },
  { key: 'owner', dataIndex: 'owner', title: '负责人', width: 96 },
  {
    key: 'amount',
    dataIndex: 'amount',
    title: '金额',
    width: 120,
    align: 'right',
    valueType: { type: 'money', currency: 'CNY' },
    serverSort: 'amount'
  },
  {
    key: 'status',
    dataIndex: 'status',
    title: '状态',
    width: 110,
    valueType: 'status',
    valueEnum: {
      pending: { text: '待处理', type: 'warning' },
      processing: { text: '进行中', type: 'primary' },
      completed: { text: '已完成', type: 'success' }
    }
  },
  { key: 'operation', title: '操作', width: 72, fixed: 'right' }
]

const formFields: FormSchema<WorkspaceForm>[] = [
  {
    key: 'name',
    label: '工作区名称',
    valueType: 'text',
    required: true,
    requiredMessage: '请输入工作区名称',
    col: { span: 12 },
    attrs: { placeholder: '输入名称' }
  },
  {
    key: 'region',
    label: '部署区域',
    valueType: 'select',
    required: true,
    col: { span: 12 },
    attrs: { placeholder: '选择区域' },
    options: [
      { label: '上海', value: 'shanghai' },
      { label: '北京', value: 'beijing' },
      { label: '新加坡', value: 'singapore' }
    ]
  },
  {
    key: 'capacity',
    label: '成员容量',
    valueType: 'number',
    col: { span: 12 },
    attrs: { min: 1, max: 500, controlsPosition: 'right' }
  },
  {
    key: 'notifications',
    label: '邮件通知',
    valueType: 'switch',
    col: { span: 12 }
  }
]

const stats = [
  { label: '签约金额', value: '¥ 128,600', delta: '+12.8%', tone: 'is-up' },
  { label: '新增客户', value: '24', delta: '+4.2%', tone: 'is-up' },
  { label: '待处理项', value: '7', delta: '需关注', tone: 'is-alert' },
  { label: '完成率', value: '93.4%', delta: '+1.6%', tone: 'is-up' }
]

const planOptions: ProCheckCardOption<Plan>[] = [
  { value: 'starter', title: '基础版', description: '核心工作流与 5 个成员席位。' },
  { value: 'growth', title: '成长版', description: '自动化流程、报表与 30 个成员席位。' },
  { value: 'enterprise', title: '企业版', description: '审计、组织权限与专属支持。' }
]

const moduleOptions: ProCheckCardOption<Module>[] = [
  { value: 'analytics', title: '数据分析', description: '经营指标与自定义看板。' },
  { value: 'automation', title: '流程自动化', description: '审批、通知和任务编排。' },
  { value: 'audit', title: '安全审计', description: '企业版套餐可开通。', disabled: true },
  { value: 'assistant', title: 'AI 助手', description: '知识检索与操作建议。' }
]

const selectedPlanLabel = computed(
  () => planOptions.find(item => item.value === plan.value)?.title ?? '未选择'
)

async function requestOrders(
  params: ProTableRequestParams<OrderQuery>
): Promise<ProTableRequestResult<OrderRecord>> {
  await new Promise(resolve => window.setTimeout(resolve, 280))
  const sorted =
    params.sorter?.field === 'amount'
      ? [...orders].sort((left, right) => {
          const difference = left.amount - right.amount
          return params.sorter?.order === 'descending' ? -difference : difference
        })
      : orders
  const start = (params.current - 1) * params.pageSize
  return { data: sorted.slice(start, start + params.pageSize), total: sorted.length, success: true }
}

async function reloadTable() {
  activeTab.value = 'table'
  await table.reload(false)
  ElMessage.success('订单数据已刷新')
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

function showOrder(orderNo: string) {
  ElMessage.info(`打开订单 ${orderNo}`)
}

function saveWorkspace(values: WorkspaceForm) {
  Object.assign(formModel, values)
  ElMessage.success('工作区配置已保存')
}
</script>
