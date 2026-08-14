<template>
  <div class="demo-stack">
    <DemoBlock
      title="getPathValue"
      description="读取嵌套值，支持点号、方括号、字符串键与数组路径。"
      eyebrow="路径工具"
    >
      <el-input
        v-model="getPathInput"
        placeholder="输入路径，例如 user.profile.name"
        style="margin-bottom: 12px"
      />
      <el-descriptions :column="1" border>
        <el-descriptions-item label="源对象">
          <code>{{ JSON.stringify(pathSource) }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="路径">
          <code>{{ getPathInput }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="getPathResult === undefined ? 'info' : 'success'">
            {{ getPathResult === undefined ? 'undefined' : JSON.stringify(getPathResult) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock
      title="setPathValue / unsetPathValue"
      description="写入会自动创建中间容器；删除缺失路径为 no-op。"
      eyebrow="路径工具"
    >
      <template #actions>
        <el-button size="small" @click="resetPathTarget">重置</el-button>
      </template>
      <el-descriptions :column="1" border style="margin-bottom: 12px">
        <el-descriptions-item label="当前对象">
          <code>{{ JSON.stringify(pathTarget) }}</code>
        </el-descriptions-item>
      </el-descriptions>
      <el-space wrap>
        <el-button @click="runSet('user.profile.name', 'Ada')"
          >set user.profile.name = 'Ada'</el-button
        >
        <el-button @click="runSet('items[0].id', 7)">set items[0].id = 7</el-button>
        <el-button @click="runSet('user[\'first name\']', 'Grace')"
          >set user['first name'] = 'Grace'</el-button
        >
        <el-button type="danger" @click="runUnset('user.profile.name')"
          >unset user.profile.name</el-button
        >
        <el-button type="danger" @click="runUnset('items[0].id')">unset items[0].id</el-button>
      </el-space>
    </DemoBlock>

    <DemoBlock
      title="normalizePath"
      description="将任意路径标准化为 PathSegment[]，数字段转回 number。"
      eyebrow="路径工具"
    >
      <el-input
        v-model="normalizeInput"
        placeholder="输入路径，例如 a[0].b 或 ['x', 1, 'y']"
        style="margin-bottom: 12px"
      />
      <el-alert :title="normalizeResult" type="info" :closable="false" />
    </DemoBlock>

    <DemoBlock
      title="normalizePagedResponse"
      description="规范化服务端分页响应：data 非数组回退 []，total 非有限数回退 0。"
      eyebrow="分页工具"
    >
      <el-space wrap style="margin-bottom: 12px">
        <el-button @click="pagedResponse = { data: [{ id: 1 }], total: 100 }">正常响应</el-button>
        <el-button @click="pagedResponse = { total: 100 }">data 缺失</el-button>
        <el-button @click="pagedResponse = { data: null, total: 'abc' }"
          >data=null, total='abc'</el-button
        >
        <el-button @click="pagedResponse = { data: [], total: 0, success: true }"
          >带 success</el-button
        >
      </el-space>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="输入">
          <code>{{ JSON.stringify(pagedResponse) }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="输出">
          <code>{{ JSON.stringify(normalizedResponse) }}</code>
        </el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock title="paginateData" description="对扁平数组做客户端分页切片。" eyebrow="分页工具">
      <el-space wrap style="margin-bottom: 12px">
        <el-input-number v-model="paginateCurrent" :min="1" :max="5" controls-position="right" />
        <el-input-number v-model="paginateSize" :min="1" :max="5" controls-position="right" />
      </el-space>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="完整数据">
          <code>{{ JSON.stringify(paginateSource) }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="当前页">
          <el-tag>{{ paginateResult.join(', ') }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock title="getRowKey" description="路径字符串或函数，统一返回行键。" eyebrow="分页工具">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="记录">
          <code>{{ JSON.stringify(rowKeyRecord) }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="rowKey='user.id'">
          <el-tag>{{ getRowKey(rowKeyRecord, 'user.id') }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="rowKey='items[0].id'">
          <el-tag>{{ getRowKey(rowKeyRecord, 'items[0].id') }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="rowKey=fn">
          <el-tag>{{ getRowKey(rowKeyRecord, r => r.user.id) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </DemoBlock>

    <DemoBlock
      title="moveItem"
      description="不可变地移动数组元素，越界返回原数组副本。"
      eyebrow="分页工具"
    >
      <el-space wrap style="margin-bottom: 12px">
        <span>from:</span>
        <el-input-number v-model="moveFrom" :min="0" :max="3" controls-position="right" />
        <span>to:</span>
        <el-input-number v-model="moveTo" :min="0" :max="3" controls-position="right" />
      </el-space>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="原数组">
          <code>{{ JSON.stringify(moveSource) }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="结果">
          <code>{{ JSON.stringify(moveResult) }}</code>
        </el-descriptions-item>
      </el-descriptions>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  getPathValue,
  setPathValue,
  unsetPathValue,
  normalizePath,
  normalizePagedResponse,
  paginateData,
  getRowKey,
  moveItem,
  type PagedResponse
} from '@framebase/core'
import DemoBlock from '../components/DemoBlock.vue'

// --- getPathValue ---
const pathSource = {
  user: { profile: { name: 'Ada' } },
  items: [{ id: 7 }, { id: 8 }],
  'first name': 'Grace'
}
const getPathInput = ref('user.profile.name')
const getPathResult = computed(() => getPathValue(pathSource, getPathInput.value))

// --- setPathValue / unsetPathValue ---
const pathTarget = ref<Record<string, unknown>>({})
function resetPathTarget() {
  pathTarget.value = {}
}
function runSet(path: string, value: unknown) {
  setPathValue(pathTarget.value, path, value)
}
function runUnset(path: string) {
  unsetPathValue(pathTarget.value, path)
}

// --- normalizePath ---
const normalizeInput = ref('a[0].b')
const normalizeResult = computed(() => {
  try {
    return JSON.stringify(normalizePath(normalizeInput.value))
  } catch {
    return '无法解析'
  }
})

// --- normalizePagedResponse ---
const pagedResponse = ref<{ data?: unknown; total?: unknown; success?: boolean }>({
  data: [{ id: 1 }],
  total: 100
})
const normalizedResponse = computed(() =>
  normalizePagedResponse(pagedResponse.value as PagedResponse<unknown>)
)

// --- paginateData ---
const paginateSource = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const paginateCurrent = ref(1)
const paginateSize = ref(3)
const paginateResult = computed(() =>
  paginateData(paginateSource, { current: paginateCurrent.value, pageSize: paginateSize.value })
)

// --- getRowKey ---
const rowKeyRecord = { user: { id: 42 }, items: [{ id: 99 }] }

// --- moveItem ---
const moveSource = ['a', 'b', 'c', 'd']
const moveFrom = ref(1)
const moveTo = ref(3)
const moveResult = computed(() => moveItem(moveSource, moveFrom.value, moveTo.value))
</script>
