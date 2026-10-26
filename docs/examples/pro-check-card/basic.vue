<script setup lang="ts">
import { ref } from 'vue'
import { ProCheckCardGroup } from '@framebase/element-plus-pro-components'

const value = ref('monthly')
const options = [
  { value: 'monthly', title: '按月订阅', description: '每月 ¥30,可随时取消' },
  { value: 'yearly', title: '按年订阅', description: '每年 ¥300,节省 17%' },
  { value: 'lifetime', title: '终身会员', description: '一次性 ¥999', disabled: true }
]
</script>

<template>
  <ProCheckCardGroup v-model="value" :options="options" :columns="3" />
</template>
