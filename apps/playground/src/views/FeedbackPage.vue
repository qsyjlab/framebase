<template>
  <div class="demo-stack">
    <DemoBlock
      title="ProException"
      description="HTTP 异常状态页：403/404/500 内置插画，支持自定义操作与整页布局。"
    >
      <template #actions>
        <el-radio-group v-model="status" size="small">
          <el-radio-button value="403">403</el-radio-button>
          <el-radio-button value="404">404</el-radio-button>
          <el-radio-button value="500">500</el-radio-button>
        </el-radio-group>
        <el-switch v-model="fullPage" inline-prompt active-text="整页" inactive-text="内嵌" />
      </template>

      <div class="exception-frame" :class="{ 'is-inline': !fullPage }">
        <ProException
          :status="status"
          :full-page="fullPage"
          :show-reload="true"
          back-text="返回上一页"
          home-text="返回首页"
          reload-text="重新加载"
          @back="notify('返回上一页')"
          @home="notify('返回首页')"
          @reload="notify('重新加载')"
        />
      </div>
    </DemoBlock>

    <DemoBlock
      title="ProException · 自定义操作"
      description="通过 actions 传入完全自定义的操作按钮，替代默认 back/home/reload。"
    >
      <div class="exception-frame is-inline">
        <ProException
          status="404"
          title="页面走丢了"
          sub-title="你可以尝试回到首页，或联系管理员。"
          :actions="customActions"
          full-page
          @action="onCustomAction"
        />
      </div>
    </DemoBlock>

    <DemoBlock
      title="ProErrorBoundary"
      description="捕获子组件运行时错误，渲染默认 500 异常页或自定义回退；支持 resetKeys 与命令式 reset。"
    >
      <template #actions>
        <el-switch v-model="boom" inline-prompt active-text="抛错" inactive-text="正常" />
        <el-button size="small" @click="resetKey++">触发 resetKeys 重置</el-button>
      </template>

      <ProErrorBoundary
        :reset-keys="[resetKey]"
        @error="handleBoundaryError"
        @reset="log('boundary 已重置')"
      >
        <div class="boundary-preview">
          <el-alert
            :type="boom ? 'error' : 'success'"
            :title="boom ? '子组件即将抛错' : '子组件正常渲染'"
            :closable="false"
            show-icon
          />
          <component :is="boom ? ThrowingChild : 'div'" />
          <div v-if="!boom" class="boundary-content">
            当前是正常态。把开关切到「抛错」会触发子组件抛出运行时错误，ProErrorBoundary
            将捕获并渲染默认 500 异常页。
          </div>
        </div>

        <template #fallback="{ error, reset }">
          <div class="boundary-fallback">
            <el-alert type="error" :closable="false" show-icon>
              <template #title>已捕获错误：{{ (error as Error)?.message }}</template>
            </el-alert>
            <div class="boundary-actions">
              <el-button type="primary" @click="reset">重试</el-button>
              <el-button @click="resetKey++">通过 resetKeys 重置</el-button>
            </div>
          </div>
        </template>
      </ProErrorBoundary>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { defineComponent, h, ref } from 'vue'
import {
  ProErrorBoundary,
  ProException,
  type ProExceptionAction,
  type ProExceptionStatus
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

const status = ref<ProExceptionStatus>('404')
const fullPage = ref(true)

const customActions: ProExceptionAction[] = [
  { key: 'home', text: '回到首页', type: 'primary' },
  { key: 'ticket', text: '提交工单', type: 'default' }
]

const boom = ref(false)
const resetKey = ref(0)

// 故意抛错的子组件，用于演示 ProErrorBoundary 捕获能力。
const ThrowingChild = defineComponent({
  name: 'ThrowingChild',
  setup() {
    throw new Error('子组件渲染时发生运行时错误')
  },
  render() {
    return h('div')
  }
})

function notify(message: string) {
  ElMessage.success(message)
}

function onCustomAction(key: string) {
  ElMessage.info(`自定义操作：${key}`)
}

function log(message: string) {
  console.log(`[feedback] ${message}`)
}

function handleBoundaryError(err: unknown, info: string) {
  console.error('[feedback] boundary 捕获错误', err, info)
}
</script>

<style scoped>
.exception-frame {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  background: var(--el-bg-color);
  overflow: hidden;
}

.exception-frame.is-inline {
  height: 360px;
}

.boundary-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.boundary-content {
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.boundary-fallback {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.boundary-actions {
  display: flex;
  gap: 10px;
}
</style>
