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

    <DemoBlock
      title="usePagedList"
      description="分页列表请求：组合 usePagination + useRequest，分页/查询变化自动请求。"
      eyebrow="请求"
    >
      <template #actions>
        <el-button size="small" :loading="pagedList.loading.value" @click="pagedList.reload()">
          reload
        </el-button>
        <el-button size="small" :loading="pagedList.loading.value" @click="pagedList.refresh()">
          refresh
        </el-button>
        <el-button size="small" :disabled="pagedList.loading.value" @click="pagedList.cancel()">
          cancel
        </el-button>
      </template>
      <el-space wrap style="margin-bottom: 12px">
        <el-input
          v-model="pagedKeyword"
          placeholder="keyword（params 变化回第一页）"
          style="width: 220px"
        />
        <el-select
          v-model="pagedList.pageSize.value"
          style="width: 110px"
          @change="pagedList.setPageSize(Number($event))"
        >
          <el-option :value="5" label="5 条/页" />
          <el-option :value="10" label="10 条/页" />
        </el-select>
      </el-space>
      <el-table
        v-loading="pagedList.loading.value"
        :data="pagedList.list.value"
        style="margin-bottom: 12px"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
      </el-table>
      <el-pagination
        :current-page="pagedList.current.value"
        :page-size="pagedList.pageSize.value"
        :total="pagedList.total.value"
        layout="prev, pager, next, total"
        @current-change="(v: number) => pagedList.setCurrent(v)"
      />
      <el-descriptions :column="2" border style="margin-top: 12px">
        <el-descriptions-item label="phase">
          <el-tag :type="phaseTagType(pagedList.phase.value)">{{ pagedList.phase.value }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="list.length">{{
          pagedList.list.value.length
        }}</el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock
      title="useInfiniteList"
      description="无限滚动：loadMore 累积下一页，reload 清空重载，hasMore 自动判断。"
      eyebrow="请求"
    >
      <template #actions>
        <el-button
          size="small"
          :loading="infiniteList.loading.value"
          :disabled="!infiniteList.hasMore.value"
          @click="infiniteList.loadMore()"
        >
          loadMore
        </el-button>
        <el-button
          size="small"
          :loading="infiniteList.loading.value"
          @click="infiniteList.reload()"
        >
          reload
        </el-button>
      </template>
      <el-space wrap style="margin-bottom: 12px">
        <el-tag :type="infiniteList.hasMore.value ? 'success' : 'info'">
          hasMore: {{ infiniteList.hasMore.value }}
        </el-tag>
        <el-tag>current: {{ infiniteList.current.value }}</el-tag>
        <el-tag>accumulated: {{ infiniteList.list.value.length }}</el-tag>
        <el-tag>total: {{ infiniteList.total.value }}</el-tag>
      </el-space>
      <el-table
        v-loading="infiniteList.loading.value"
        :data="infiniteList.list.value"
        style="margin-bottom: 12px"
        max-height="280"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
      </el-table>
    </DemoBlock>

    <DemoBlock
      title="useCrud"
      description="增删改查聚合：create/update/remove 成功后自动 reload 列表，独立 loading。"
      eyebrow="请求"
    >
      <template #actions>
        <el-button size="small" type="primary" :loading="crud.creating.value" @click="onCrudCreate">
          新增
        </el-button>
      </template>
      <el-table v-loading="crud.loading.value" :data="crud.list.value" style="margin-bottom: 12px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" link :loading="crud.updating.value" @click="onCrudUpdate(row)">
              改名
            </el-button>
            <el-button
              size="small"
              link
              type="danger"
              :loading="crud.removing.value"
              @click="onCrudRemove(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="submitting">{{ crud.submitting.value }}</el-descriptions-item>
        <el-descriptions-item label="list.length">{{
          crud.list.value.length
        }}</el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock
      title="useAsyncLock"
      description="并发锁：同 key 进行中再次调用被忽略，防重复提交。"
      eyebrow="状态"
    >
      <template #actions>
        <el-button size="small" :loading="lock.isLocked()" @click="runLocked">
          提交（500ms）
        </el-button>
        <el-button size="small" @click="lock.cancel()">cancel</el-button>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="locks">
          <code>{{ JSON.stringify([...lock.locks.value]) }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="执行次数">{{ lockRunCount }}</el-descriptions-item>
        <el-descriptions-item label="忽略次数">{{ lockSkipCount }}</el-descriptions-item>
      </el-descriptions>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  useRequest,
  usePagination,
  useSelection,
  useUrlState,
  usePagedList,
  useInfiniteList,
  useCrud,
  useAsyncLock
} from '@framebase/vue'
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

// --- usePagedList ---
interface PagedUser {
  id: number
  name: string
}
const pagedKeyword = ref('')
const pagedList = usePagedList<PagedUser, { keyword: string }>({
  request: async params => {
    // 模拟网络延迟
    await new Promise(r => setTimeout(r, 600))
    const all: PagedUser[] = Array.from({ length: 23 }, (_, i) => ({
      id: i + 1,
      name: `用户 ${i + 1}${params.keyword ? ` · ${params.keyword}` : ''}`
    }))
    const matched = params.keyword ? all.filter(u => u.name.includes(params.keyword)) : all
    const start = (params.current - 1) * params.pageSize
    return { data: matched.slice(start, start + params.pageSize), total: matched.length }
  },
  pageSize: 5,
  params: () => ({ keyword: pagedKeyword.value })
})

// --- useInfiniteList ---
interface InfiniteItem {
  id: number
  name: string
}
const infiniteList = useInfiniteList<InfiniteItem>({
  request: async params => {
    await new Promise(r => setTimeout(r, 500))
    const start = (params.current - 1) * params.pageSize
    const data = Array.from({ length: params.pageSize }, (_, i) => ({
      id: start + i + 1,
      name: `条目 ${start + i + 1}`
    }))
    return { data, total: 40 }
  },
  pageSize: 8
})

// --- useCrud ---
interface CrudUser {
  id: number
  name: string
}
// 内存数据源，写操作直接变更
let crudStore: CrudUser[] = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`
}))
let crudSeq = crudStore.length

const crud = useCrud<CrudUser, Record<string, any>, { name: string }, { name: string }>({
  list: {
    request: async params => {
      await new Promise(r => setTimeout(r, 500))
      const start = (params.current - 1) * params.pageSize
      return {
        data: crudStore.slice(start, start + params.pageSize),
        total: crudStore.length
      }
    },
    pageSize: 5
  },
  create: async payload => {
    await new Promise(r => setTimeout(r, 400))
    crudSeq += 1
    crudStore = [...crudStore, { id: crudSeq, name: payload.name }]
  },
  update: async (record, payload) => {
    await new Promise(r => setTimeout(r, 400))
    crudStore = crudStore.map(u => (u.id === record.id ? { ...u, ...payload } : u))
  },
  remove: async record => {
    await new Promise(r => setTimeout(r, 400))
    crudStore = crudStore.filter(u => u.id !== record.id)
  }
})

async function onCrudCreate() {
  try {
    await crud.create({ name: `新用户 ${Date.now() % 1000}` })
    ElMessage.success('创建成功')
  } catch (e) {
    ElMessage.error(`创建失败: ${e}`)
  }
}

async function onCrudUpdate(row: CrudUser) {
  try {
    await crud.update(row, { name: `${row.name}✏️` })
    ElMessage.success('更新成功')
  } catch (e) {
    ElMessage.error(`更新失败: ${e}`)
  }
}

async function onCrudRemove(row: CrudUser) {
  try {
    await crud.remove(row)
    ElMessage.success('删除成功')
  } catch (e) {
    ElMessage.error(`删除失败: ${e}`)
  }
}

// --- useAsyncLock ---
const lock = useAsyncLock()
const lockRunCount = ref(0)
const lockSkipCount = ref(0)

async function runLocked() {
  const result = await lock.run(async () => {
    lockRunCount.value += 1
    await new Promise(r => setTimeout(r, 500))
    return 'done'
  })
  if (result === undefined) {
    lockSkipCount.value += 1
    ElMessage.warning('已忽略重复提交')
  } else {
    ElMessage.success('提交完成')
  }
}
</script>
