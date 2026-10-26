<script setup lang="ts">
import { ref } from 'vue'
import { ProUpload } from '@framebase/element-plus-pro-components'

const files = ref([])
const uploadRef = ref()

function submit() {
  uploadRef.value?.submit()
}
</script>

<template>
  <ProUpload
    ref="uploadRef"
    v-model="files"
    action="/api/upload"
    accept=".png,.jpg,.pdf"
    :max-size="5 * 1024 * 1024"
    :limit="3"
    multiple
  />

  <el-button type="primary" @click="submit">开始上传</el-button>
</template>
