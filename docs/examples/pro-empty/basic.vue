<script setup lang="ts">
import { ref } from 'vue'
import { ProEmpty } from '@framebase/element-plus-pro-components'

const status = ref<'empty' | 'search' | 'error' | 'forbidden'>('empty')
</script>

<template>
  <ProEmpty
    :status="status"
    action-text="刷新"
    secondary-action-text="返回"
    @action="() => console.log('刷新')"
    @secondary-action="() => console.log('返回')"
  />
</template>
