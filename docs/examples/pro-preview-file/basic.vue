<script setup lang="ts">
import { ref } from 'vue'
import { ProPreviewFile } from '@framebase/element-plus-pro-components'

const previewRef = ref()

function preview(file: { name: string; url?: string; raw?: File }) {
  previewRef.value?.show(file)
}
</script>

<template>
  <el-button @click="preview({ name: 'demo.png', url: '/files/demo.png' })">预览图片</el-button>
  <el-button @click="preview({ name: 'doc.pdf', url: '/files/doc.pdf' })">预览 PDF</el-button>

  <ProPreviewFile ref="previewRef" />
</template>
