<template>
  <div class="demo-stack">
    <DemoBlock
      title="基本使用"
      description="点击标签弹出筛选面板，选中后标签高亮显示当前值。字段类型复用 ProField valueType。"
    >
      <ProLightFilter v-model="filterValues" :fields="basicFields" />
      <pre class="form-json">{{ JSON.stringify(filterValues, null, 2) }}</pre>
    </DemoBlock>

    <DemoBlock title="边框风格" description="标签支持四种视觉风格：线框、无边框、填充、下划线。">
      <div class="variant-demo">
        <span class="variant-label">线框 (outlined)</span>
        <ProLightFilter v-model="borderValues1" :fields="borderFields" border-style="outlined" />
      </div>
      <div class="variant-demo">
        <span class="variant-label">无边框 (borderless)</span>
        <ProLightFilter v-model="borderValues2" :fields="borderFields" border-style="borderless" />
      </div>
      <div class="variant-demo">
        <span class="variant-label">填充 (filled)</span>
        <ProLightFilter v-model="borderValues3" :fields="borderFields" border-style="filled" />
      </div>
      <div class="variant-demo">
        <span class="variant-label">下划线 (underlined)</span>
        <ProLightFilter v-model="borderValues4" :fields="borderFields" border-style="underlined" />
      </div>
    </DemoBlock>

    <DemoBlock title="尺寸" description="支持 large、default、small 三种尺寸。">
      <div class="variant-demo">
        <span class="variant-label">Large</span>
        <ProLightFilter v-model="sizeValues1" :fields="sizeFields" size="large" />
      </div>
      <div class="variant-demo">
        <span class="variant-label">Default</span>
        <ProLightFilter v-model="sizeValues2" :fields="sizeFields" size="default" />
      </div>
      <div class="variant-demo">
        <span class="variant-label">Small</span>
        <ProLightFilter v-model="sizeValues3" :fields="sizeFields" size="small" />
      </div>
    </DemoBlock>

    <DemoBlock title="与 ProTable 集成" description="嵌入表格工具栏，筛选值联动表格数据查询。">
      <ProTable
        :columns="tableColumns"
        :request="requestRows"
        row-key="id"
        :pagination="{ pageSize: 5 }"
      >
        <template #toolbar>
          <ProLightFilter
            v-model="tableFilterValues"
            :fields="tableFilterFields"
            :collapsed-count="2"
          />
        </template>
      </ProTable>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ProLightFilter,
  ProTable,
  type ProLightFilterField,
  type ProTableColumns
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

const basicFields: ProLightFilterField[] = [
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
    placeholder: '请输入关键词搜索'
  },
  {
    key: 'date',
    label: '日期',
    valueType: 'date'
  },
  {
    key: 'status',
    label: '仅看已激活',
    valueType: 'switch'
  }
]

const filterValues = ref<Record<string, unknown>>({
  gender: 'male'
})

const borderFields: ProLightFilterField[] = [
  {
    key: 'category',
    label: '分类',
    valueType: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '电子', value: 'electronics' },
      { label: '服装', value: 'clothing' }
    ]
  },
  {
    key: 'price',
    label: '价格',
    valueType: 'number',
    placeholder: '请输入价格'
  },
  {
    key: 'inStock',
    label: '现货',
    valueType: 'switch'
  }
]

const borderValues1 = ref<Record<string, unknown>>({})
const borderValues2 = ref<Record<string, unknown>>({})
const borderValues3 = ref<Record<string, unknown>>({})
const borderValues4 = ref<Record<string, unknown>>({})

const sizeFields: ProLightFilterField[] = [
  {
    key: 'name',
    label: '名称',
    valueType: 'text',
    placeholder: '请输入名称'
  },
  {
    key: 'type',
    label: '类型',
    valueType: 'select',
    options: [
      { label: '类型A', value: 'a' },
      { label: '类型B', value: 'b' }
    ]
  },
  {
    key: 'created',
    label: '创建时间',
    valueType: 'date'
  }
]

const sizeValues1 = ref<Record<string, unknown>>({})
const sizeValues2 = ref<Record<string, unknown>>({})
const sizeValues3 = ref<Record<string, unknown>>({})

const tableFilterFields: ProLightFilterField[] = [
  {
    key: 'name',
    label: '名称',
    valueType: 'text',
    placeholder: '搜索名称'
  },
  {
    key: 'status',
    label: '状态',
    valueType: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '进行中', value: 'processing' },
      { label: '已完成', value: 'completed' }
    ]
  },
  {
    key: 'date',
    label: '日期',
    valueType: 'date'
  }
]

const tableFilterValues = ref<Record<string, unknown>>({})

interface MockRow {
  id: number
  name: string
  status: string
  createdAt: string
}

const tableColumns: ProTableColumns<MockRow> = [
  { key: 'id', title: 'ID', dataIndex: 'id' },
  { key: 'name', title: '名称', dataIndex: 'name' },
  { key: 'status', title: '状态', dataIndex: 'status', valueType: 'tag' },
  { key: 'createdAt', title: '创建时间', dataIndex: 'createdAt', valueType: 'date' }
]

const mockData: MockRow[] = [
  { id: 1, name: '订单 A', status: 'processing', createdAt: '2024-01-15' },
  { id: 2, name: '订单 B', status: 'completed', createdAt: '2024-01-20' },
  { id: 3, name: '订单 C', status: 'processing', createdAt: '2024-02-01' },
  { id: 4, name: '订单 D', status: 'completed', createdAt: '2024-02-10' },
  { id: 5, name: '订单 E', status: 'processing', createdAt: '2024-02-15' }
]

async function requestRows(params: { name?: string; status?: string }) {
  let data = mockData
  const keyword = params.name
  if (keyword) {
    data = data.filter(item => item.name.includes(keyword))
  }
  if (params.status) {
    data = data.filter(item => item.status === params.status)
  }
  return { data, total: data.length, success: true }
}
</script>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-json {
  overflow: auto;
  margin: 12px 0 0;
  padding: 14px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font:
    12px/1.55 ui-monospace,
    monospace;
}

.variant-demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.variant-demo:last-child {
  border-bottom: none;
}

.variant-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
