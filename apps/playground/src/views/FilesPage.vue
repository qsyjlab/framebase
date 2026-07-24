<template>
  <div class="demo-stack">
    <div class="demo-grid">
      <DemoBlock title="ProUpload" description="受控文件列表、类型大小校验和图片墙。">
        <ProUpload
          v-model="uploadFiles"
          accept="image/*,.pdf"
          :limit="3"
          :max-size="5 * 1024 * 1024"
        />
      </DemoBlock>

      <DemoBlock
        title="ProPreviewFile"
        description="图片、PDF、Office 文件和不支持类型的统一预览入口。"
      >
        <div class="button-row">
          <el-button type="primary" @click="showPreview">预览示例图片</el-button>
        </div>
        <ProPreviewFile ref="previewRef" />
      </DemoBlock>
    </div>

    <DemoBlock title="ProUploadList" description="选择、上传进度、取消、失败重试、预览和下载。">
      <template #actions>
        <el-button @click="uploadListRef?.open()">打开上传</el-button>
        <el-button @click="uploadListRef?.openPreview()">查看文件</el-button>
      </template>
      <ProUploadList
        ref="uploadListRef"
        v-model="listFiles"
        accept="image/*,.pdf"
        :request="simulateUpload"
        :map-response="response => response"
      />
      <div class="demo-value">
        files: {{ listFiles.map(file => `${file.name}:${file.status}`).join(', ') }}
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ProPreviewFile,
  ProUpload,
  ProUploadList,
  type ProPreviewFileInstance,
  type ProUploadFile,
  type ProUploadListFile,
  type ProUploadListInstance,
  type ProUploadRequestContext
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

interface UploadResponse {
  url: string
}
type DemoFile = ProUploadListFile<UploadResponse>
const imageUrl =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"%3E%3Crect width="640" height="360" fill="%231677ff"/%3E%3Ctext x="320" y="190" text-anchor="middle" font-family="Arial" font-size="48" fill="white"%3EFramebase%3C/text%3E%3C/svg%3E'
const uploadFiles = ref<ProUploadFile[]>([
  { name: 'framebase.svg', url: imageUrl, status: 'success', percentage: 100 }
])
const listFiles = ref<DemoFile[]>([
  { name: 'design-preview.svg', url: imageUrl, status: 'success', percentage: 100 }
])
const previewRef = ref<ProPreviewFileInstance>()
const uploadListRef = ref<ProUploadListInstance<UploadResponse, DemoFile>>()

function showPreview() {
  previewRef.value?.show({ name: 'framebase.svg', url: imageUrl, type: 'image/svg+xml' })
}
async function simulateUpload(
  rawFile: File,
  context: ProUploadRequestContext<DemoFile>
): Promise<UploadResponse> {
  for (const percentage of [25, 60, 100]) {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(resolve, 120)
      context.signal.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timer)
          reject(new DOMException('cancelled', 'AbortError'))
        },
        { once: true }
      )
    })
    context.onProgress(percentage)
  }
  return { url: URL.createObjectURL(rawFile) }
}
</script>
