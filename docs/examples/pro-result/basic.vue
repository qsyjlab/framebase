<script setup lang="ts">
import { ProResult } from '@framebase/element-plus-pro-components'

function handleSubmit() {
  // 跳转或刷新
}
</script>

<template>
  <ProResult
    status="success"
    title="提交成功"
    sub-title="订单已创建,请等待审核"
    primary-text="查看订单"
    secondary-text="返回列表"
    @primary="handleSubmit"
  />
</template>
