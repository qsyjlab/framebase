<template>
  <div class="demo-stack">
    <DemoBlock
      title="useRequest"
      description="可中止的异步状态容器：防抖、重试、最新请求胜出。"
      eyebrow="请求"
    >
      <template #actions>
        <el-button size="small" :loading="request.loading.value" @click="runRequest">
          {{
            request.initialLoading.value
              ? '首次加载...'
              : request.refreshing.value
                ? '刷新中...'
                : '执行请求'
          }}
        </el-button>
        <el-button size="small" @click="request.cancel()">cancel</el-button>
        <el-button size="small" @click="request.retry()">retry</el-button>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="phase">
          <el-tag :type="phaseTagType(request.phase.value)">{{ request.phase.value }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="action">{{
          request.action.value ?? '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="loading">{{ request.loading.value }}</el-descriptions-item>
        <el-descriptions-item label="initialLoading">{{
          request.initialLoading.value
        }}</el-descriptions-item>
        <el-descriptions-item label="data" :span="2">
          <code>{{ JSON.stringify(request.data.value) }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="error" :span="2">
          <code>{{ request.error.value ? String(request.error.value) : 'undefined' }}</code>
        </el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock
      title="useRequest · 防抖 + 重试"
      description="debounce=500ms，retry=2，连续快速点击只有最后一次生效。"
      eyebrow="请求"
    >
      <template #actions>
        <el-button size="small" :loading="debounced.loading.value" @click="runDebounced">
          快速连点我
        </el-button>
      </template>
      <el-alert
        :title="`已触发 ${debounceClickCount} 次，实际发起 ${debounceAttempts} 次请求`"
        type="info"
        :closable="false"
      />
      <el-descriptions :column="1" border style="margin-top: 12px">
        <el-descriptions-item label="data">
          <code>{{ JSON.stringify(debounced.data.value) }}</code>
        </el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock
      title="usePagination"
      description="响应式分页状态：setPageSize 自动重置 current，onChange 提供变更原因。"
      eyebrow="状态"
    >
      <template #actions>
        <el-button size="small" @click="pagination.reset()">reset</el-button>
      </template>
      <el-space wrap style="margin-bottom: 12px">
        <el-input-number
          v-model="currentModel"
          :min="1"
          controls-position="right"
          @change="v => pagination.setCurrent(Number(v))"
        />
        <el-select
          v-model="pageSizeModel"
          style="width: 120px"
          @change="v => pagination.setPageSize(Number(v))"
        >
          <el-option :value="10" label="10 条/页" />
          <el-option :value="20" label="20 条/页" />
          <el-option :value="50" label="50 条/页" />
        </el-select>
        <el-input-number
          v-model="totalModel"
          :min="0"
          :step="100"
          controls-position="right"
          @change="v => pagination.setTotal(Number(v))"
        />
      </el-space>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="current">{{ pagination.current.value }}</el-descriptions-item>
        <el-descriptions-item label="pageSize">{{
          pagination.pageSize.value
        }}</el-descriptions-item>
        <el-descriptions-item label="total">{{ pagination.total.value }}</el-descriptions-item>
        <el-descriptions-item label="isLastPage">{{
          pagination.isLastPage.value
        }}</el-descriptions-item>
        <el-descriptions-item label="最近变更" :span="2">
          <el-tag :type="reasonTagType(lastChangeReason)">{{ lastChangeReason ?? '无' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock
      title="useSelection"
      description="行选择状态，支持跨页保留与 key → record 缓存。"
      eyebrow="状态"
    >
      <template #actions>
        <el-button size="small" @click="selection.clearSelection()">清空</el-button>
        <el-button size="small" @click="selection.cacheVisibleRecords()">缓存当前页已选</el-button>
      </template>
      <el-table
        :data="selectionData"
        style="margin-bottom: 12px"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
      </el-table>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="selectedKeyList">
          <code>{{ JSON.stringify(selection.selectedKeyList.value) }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="getSelectedRows()">
          <code>{{ JSON.stringify(selection.getSelectedRows()) }}</code>
        </el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock
      title="useUrlState"
      description="URL query 与响应式状态双向同步，优先走 vue-router。"
      eyebrow="状态"
    >
      <template #actions>
        <el-button size="small" @click="urlState.sync()">sync → URL</el-button>
        <el-button size="small" @click="urlState.read()">read ← URL</el-button>
      </template>
      <el-space wrap style="margin-bottom: 12px">
        <el-input
          v-model="urlState.state.value.keyword"
          placeholder="keyword"
          style="width: 160px"
        />
        <el-select v-model="urlState.state.value.status" style="width: 120px">
          <el-option value="all" label="all" />
          <el-option value="active" label="active" />
          <el-option value="archived" label="archived" />
        </el-select>
      </el-space>
      <el-alert :title="`当前 URL query: ${currentUrlQuery}`" type="info" :closable="false" />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRequest, usePagination, useSelection, useUrlState } from '@framebase/vue'
import { ElMessage } from 'element-plus'
import DemoBlock from '../components/DemoBlock.vue'

// --- useRequest 基础 ---
interface User {
  id: number
  name: string
}

const request = useRequest<User[]>({ retry: 1 })

async function fetchUsers() {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  // 模拟偶发失败
  if (Math.random() < 0.3) throw new Error('网络错误')
  return [
    { id: 1, name: 'Ada Lovelace' },
    { id: 2, name: 'Alan Turing' }
  ]
}

async function runRequest() {
  try {
    await request.execute(fetchUsers, undefined, { action: 'initial' })
  } catch (e) {
    ElMessage.error(`请求失败: ${e}`)
  }
}

function phaseTagType(phase: string) {
  if (phase === 'success') return 'success'
  if (phase === 'error') return 'danger'
  if (phase === 'pending') return 'warning'
  return 'info'
}

// --- useRequest 防抖 + 重试 ---
const debounced = useRequest<string>({ debounce: 500, retry: 2, retryDelay: 300 })
const debounceClickCount = ref(0)
const debounceAttempts = ref(0)

async function runDebounced() {
  debounceClickCount.value += 1
  try {
    debounceAttempts.value += 1
    await debounced.execute(
      async () => {
        await new Promise(r => setTimeout(r, 600))
        return `结果 #${Date.now()}`
      },
      undefined,
      { action: 'refresh' }
    )
  } catch {
    // 防抖期间被取消不算错误
  }
}

// --- usePagination ---
const pagination = usePagination({ current: 1, pageSize: 10, total: 0 })
const currentModel = ref(pagination.current.value)
const pageSizeModel = ref(pagination.pageSize.value)
const totalModel = ref(pagination.total.value)
const lastChangeReason = ref<string>()

pagination.onChange(({ reason }) => {
  lastChangeReason.value = reason
  currentModel.value = pagination.current.value
  pageSizeModel.value = pagination.pageSize.value
  totalModel.value = pagination.total.value
})

function reasonTagType(reason?: string) {
  if (reason === 'size') return 'warning'
  if (reason === 'reset') return 'info'
  return 'success'
}

// --- useSelection ---
interface Row {
  id: number
  name: string
}
const selectionData = ref<Row[]>([
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Cara' }
])

const selection = useSelection<Row>({
  data: selectionData,
  rowKey: () => 'id',
  reserveSelection: () => true,
  selectedKeys: () => [],
  onChange: () => {}
})

function onSelectionChange(rows: Row[]) {
  const keys = rows.map(r => selection.resolveRowKey(r))
  selection.syncSelectedKeys(keys)
}

// --- useUrlState ---
const urlState = useUrlState({ keyword: '', status: 'all' }, { key: 'demo', history: 'replace' })

const currentUrlQuery = computed(() => {
  const url = new URL(window.location.href)
  return url.searchParams.get('demo') ?? '(空)'
})

watch(
  urlState.state,
  () => {
    // state 变化时 useUrlState 内部已自动同步 URL
  },
  { deep: true }
)
</script>
