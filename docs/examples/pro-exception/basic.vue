<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ProException } from '@framebase/element-plus-pro-components'

const status = ref<'403' | '404' | '500'>('404')
const lastAction = ref('—')

function onAction(key: string) {
  lastAction.value = key
  ElMessage.info(`触发 action：${key}`)
}
</script>

<template>
  <div class="exception-demo">
    <el-radio-group v-model="status" size="small">
      <el-radio-button value="403">403</el-radio-button>
      <el-radio-button value="404">404</el-radio-button>
      <el-radio-button value="500">500</el-radio-button>
    </el-radio-group>

    <ProException
      :status="status"
      :full-page="false"
      show-reload
      @back="onAction('back')"
      @home="onAction('home')"
      @reload="onAction('reload')"
      @action="onAction"
    />

    <p class="exception-demo__hint">最近触发：{{ lastAction }}</p>
  </div>
</template>

<style scoped>
.exception-demo {
  display: grid;
  justify-items: center;
  gap: 8px;
}
.exception-demo__hint {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
