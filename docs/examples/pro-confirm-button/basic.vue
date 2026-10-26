<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ProConfirmButton } from '@framebase/element-plus-pro-components'

const canDelete = ref(true)
const lastAction = ref('—')

async function deleteUser() {
  await new Promise(resolve => setTimeout(resolve, 600))
  lastAction.value = `已删除于 ${new Date().toLocaleTimeString()}`
  ElMessage.success('删除成功')
}

async function archive() {
  await new Promise(resolve => setTimeout(resolve, 400))
  lastAction.value = '已归档'
}
</script>

<template>
  <div class="confirm-block">
    <div class="confirm-row">
      <el-switch v-model="canDelete" active-text="有删除权限" />

      <ProConfirmButton
        type="danger"
        :access="canDelete"
        denied-behavior="disable"
        denied-reason="当前账号没有删除权限"
        :confirm="{
          title: '删除用户',
          description: '删除后无法恢复，请谨慎操作',
          mode: 'message-box',
          type: 'danger'
        }"
        :action="deleteUser"
      >
        删除
      </ProConfirmButton>

      <ProConfirmButton :confirm="{ title: '确认归档？', mode: 'popconfirm' }" :action="archive">
        归档
      </ProConfirmButton>
    </div>

    <p class="confirm-result">最近操作：{{ lastAction }}</p>
  </div>
</template>

<style scoped>
.confirm-block {
  display: grid;
  gap: 14px;
}
.confirm-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.confirm-result {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
