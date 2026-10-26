<script setup lang="ts">
import { ref } from 'vue'
import { ProSelect } from '@framebase/element-plus-pro-components'

const value = ref('')
const options = [
  { label: '张三', value: '1' },
  { label: '李四', value: '2' }
]
</script>

<template>
  <ProSelect v-model="value" :options="options" clearable placeholder="请选择人员" />
</template>
