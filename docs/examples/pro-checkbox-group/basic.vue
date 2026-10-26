<script setup lang="ts">
import { ref } from 'vue'
import { ProCheckboxGroup } from '@framebase/element-plus-pro-components'

const value = ref(['apple'])
const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange', disabled: true }
]
</script>

<template>
  <ProCheckboxGroup v-model="value" :options="options" />
</template>
