<script setup lang="ts">
import { ref } from 'vue'
import { ProErrorBoundary } from '@framebase/element-plus-pro-components'

const shouldThrow = ref(false)

function renderStatus() {
  if (shouldThrow.value) throw new Error('演示用异常：数据解析失败')
  return '一切正常'
}
</script>

<template>
  <ProErrorBoundary :reset-keys="[shouldThrow]" title="示例区域出错了">
    <template #fallback="{ error, reset }">
      <div class="boundary-fallback">
        <p class="boundary-fallback__title">已捕获异常，其余页面不受影响</p>
        <p class="boundary-fallback__message">{{ (error as Error)?.message }}</p>
        <el-button
          size="small"
          @click="
            () => {
              shouldThrow = false
              reset()
            }
          "
        >
          重置区域
        </el-button>
      </div>
    </template>

    <div class="boundary-content">
      <p class="boundary-content__status">当前状态：{{ renderStatus() }}</p>
      <el-button size="small" type="danger" @click="shouldThrow = true">触发异常</el-button>
    </div>
  </ProErrorBoundary>
</template>

<style scoped>
.boundary-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}
.boundary-content__status {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.boundary-fallback {
  display: grid;
  gap: 8px;
  justify-items: start;
  padding: 16px;
  border: 1px solid var(--el-color-danger-light-5);
  border-radius: 8px;
  background: var(--el-color-danger-light-9);
}
.boundary-fallback__title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-color-danger);
}
.boundary-fallback__message {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
