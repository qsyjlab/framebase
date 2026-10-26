<script setup lang="ts">
import { ProBadge } from '@framebase/element-plus-pro-components'
</script>

<template>
  <div class="badge-row">
    <ProBadge dot pulse>
      <el-button circle>通知</el-button>
    </ProBadge>

    <ProBadge :value="12" :max="9">
      <el-button>未读消息</el-button>
    </ProBadge>

    <ProBadge value="NEW" color="#722ed1">
      <el-button>版本更新</el-button>
    </ProBadge>

    <ProBadge :value="5" tone="success" placement="bottom-right">
      <el-button>已完成</el-button>
    </ProBadge>
  </div>
</template>

<style scoped>
.badge-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 32px;
}
</style>
