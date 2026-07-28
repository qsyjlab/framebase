<template>
  <div class="demo-stack">
    <DemoBlock title="异步按钮" description="自动 loading、防重复执行、成功/失败反馈和命令式调用。">
      <div class="button-row">
        <ProAsyncButton
          type="primary"
          :action="saveAction"
          success-message="保存成功"
          @success="result => (lastResult = result)"
        >
          保存配置
        </ProAsyncButton>
        <ProAsyncButton
          type="danger"
          plain
          :action="failedAction"
          :error-message="error => `执行失败：${String(error)}`"
        >
          模拟失败
        </ProAsyncButton>
        <ProAsyncButton :action="slowAction" :prevent-repeat="true">
          连续点击只执行一次
        </ProAsyncButton>
      </div>
      <div class="demo-value">执行次数：{{ executionCount }}；最后结果：{{ lastResult }}</div>
    </DemoBlock>

    <DemoBlock
      title="确认按钮"
      description="行内操作使用 Popconfirm，复杂危险操作使用 MessageBox，并支持显式权限控制。"
    >
      <template #actions>
        <el-switch v-model="canDelete" active-text="允许删除" />
      </template>
      <div class="button-row">
        <ProConfirmButton
          type="danger"
          link
          confirm="确定删除当前记录？"
          :action="deleteAction"
          success-message="记录已删除"
        >
          行内删除
        </ProConfirmButton>
        <ProConfirmButton
          type="danger"
          :confirm="{
            title: '批量删除',
            description: '将删除当前筛选结果中的全部记录，此操作无法撤销。',
            mode: 'message-box',
            type: 'danger',
            confirmText: '确认删除'
          }"
          :action="deleteAction"
        >
          批量删除
        </ProConfirmButton>
        <ProConfirmButton
          type="danger"
          plain
          confirm="确定删除？"
          :access="canDelete"
          denied-behavior="disable"
          denied-reason="当前账号没有删除权限"
          :action="deleteAction"
        >
          权限控制
        </ProConfirmButton>
      </div>
    </DemoBlock>

    <div class="demo-grid">
      <DemoBlock title="状态语义" description="支持点、标签、文本、自定义颜色和作用域插槽。">
        <div class="status-list">
          <ProStatus tone="success" text="运行中" />
          <ProStatus tone="processing" text="发布中" />
          <ProStatus tone="warning" text="等待确认" variant="tag" />
          <ProStatus tone="danger" text="执行失败" variant="tag" effect="dark" />
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
          <ProStatus value="running" :value-enum="statusMap">
            <template #default="{ text, colors }">
              <strong :style="{ color: colors.foreground }">● {{ text }}（自定义）</strong>
            </template>
          </ProStatus>
        </div>
      </DemoBlock>

      <DemoBlock title="徽标" description="覆盖通知红点、数量、品牌色和四方向定位。">
        <div class="badge-list">
          <ProBadge dot pulse>
            <el-button circle :icon="Bell" aria-label="通知" />
          </ProBadge>
          <ProBadge :value="12" :max="9">
            <el-button>未读消息</el-button>
          </ProBadge>
          <ProBadge value="NEW" color="#722ed1">
            <el-button>版本更新</el-button>
          </ProBadge>
          <ProBadge dot tone="success" placement="bottom-right">
            <el-avatar :icon="UserFilled" />
          </ProBadge>
        </div>
      </DemoBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bell, UserFilled } from '@element-plus/icons-vue'
import { ref } from 'vue'
import {
  ProAsyncButton,
  ProBadge,
  ProConfirmButton,
  ProStatus,
  type ProAsyncActionContext,
  type ProStatusValueEnum
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

const executionCount = ref(0)
const lastResult = ref('-')
const canDelete = ref(false)
const statusMap: ProStatusValueEnum<'running'> = {
  running: { text: '插槽运行态', tone: 'success' }
}

async function saveAction(context: ProAsyncActionContext) {
  executionCount.value += 1
  await wait(700, context.signal)
  return `saved-${executionCount.value}`
}

async function failedAction(context: ProAsyncActionContext) {
  await wait(500, context.signal)
  throw new Error('服务暂时不可用')
}

async function slowAction(context: ProAsyncActionContext) {
  executionCount.value += 1
  await wait(1200, context.signal)
  return executionCount.value
}

async function deleteAction(context: ProAsyncActionContext) {
  executionCount.value += 1
  await wait(600, context.signal)
  return true
}

function wait(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, delay)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true }
    )
  })
}
</script>

<style scoped>
.status-list,
.badge-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
}
</style>
