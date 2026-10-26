<script setup lang="ts">
import { ref } from 'vue'
import { ProAsyncButton, type ProAsyncActionContext } from '@framebase/element-plus-pro-components'

const lastResult = ref('—')

async function save({ signal }: ProAsyncActionContext) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 800)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('已取消'))
    })
  })
  lastResult.value = `保存成功于 ${new Date().toLocaleTimeString()}`
  return { ok: true }
}

async function fail() {
  await new Promise(resolve => setTimeout(resolve, 500))
  throw new Error('服务端返回 500')
}
</script>

<template>
  <div class="async-button-demo">
    <ProAsyncButton type="primary" :action="save" success-message="保存成功">
      保存（自动 loading）
    </ProAsyncButton>

    <ProAsyncButton type="danger" plain :action="fail">执行失败示例</ProAsyncButton>

    <p class="async-button-demo__result">{{ lastResult }}</p>
  </div>
</template>

<style scoped>
.async-button-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.async-button-demo__result {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
