<script setup lang="ts">
import { ref } from 'vue'
import { ProUploadList } from '@framebase/element-plus-pro-components'

const files = ref([])

async function request(rawFile, { signal, onProgress }) {
  const formData = new FormData()
  formData.append('file', rawFile)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText))
      else reject(new Error(xhr.statusText))
    }
    xhr.onerror = () => reject(new Error('上传失败'))
    signal.addEventListener('abort', () => xhr.abort())
    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}

function mapResponse(response: { url: string }, file: File) {
  return { url: response.url, name: file.name }
}
</script>

<template>
  <ProUploadList
    v-model="files"
    :request="request"
    :map-response="mapResponse"
    :max-size="10 * 1024 * 1024"
    :limit="20"
    multiple
    title="附件管理"
  />
</template>
