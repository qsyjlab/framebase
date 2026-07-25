# ProUpload 上传

基于 ElUpload 封装的文件上传组件,内置文件大小/类型校验、上传提示、点击预览(集成 ProPreviewFile)等能力。所有 ElUpload 原生属性(如 `action`、`accept`、`drag`、`listType`、`limit` 等)均可透传。

## 基础用法

手动触发上传:

```vue
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
```

自定义上传请求(完全接管):

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProUpload } from '@framebase/element-plus-pro-components'

const files = ref([])

async function httpRequest({ file, onProgress }) {
  const formData = new FormData()
  formData.append('file', file)
  // 自定义进度调用 onProgress(percentage)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  return await res.json()
}
</script>

<template>
  <ProUpload
    v-model="files"
    :http-request="httpRequest"
    :auto-upload="true"
    accept="image/*"
    :max-size="2 * 1024 * 1024"
    show-tip
  />
</template>
```

拖拽上传 + 卡片样式:

```vue
<template>
  <ProUpload
    v-model="files"
    drag
    list-type="picture-card"
    action="/api/upload"
    :auto-upload="true"
    accept="image/*"
  />
</template>
```

## Props

| 属性            | 说明                                   | 类型                                           | 默认值     |
| --------------- | -------------------------------------- | ---------------------------------------------- | ---------- |
| modelValue      | 文件列表,支持 v-model                  | `TFile[]`                                      | `[]`       |
| action          | 上传地址,自动上传时必填                | `string`                                       | `''`       |
| accept          | 接受的文件类型                         | `string`                                       | —          |
| autoUpload      | 是否选择后自动上传                     | `boolean`                                      | `false`    |
| drag            | 是否启用拖拽上传                       | `boolean`                                      | —          |
| listType        | 文件列表样式                           | `'text' \| 'picture' \| 'picture-card'`        | `'text'`   |
| multiple        | 是否多选                               | `boolean`                                      | —          |
| limit           | 上传数量上限                           | `number`                                       | —          |
| maxSize         | 单文件大小上限(字节),默认 20MB         | `number`                                       | `20971520` |
| showTip         | 是否显示文件类型/大小提示              | `boolean`                                      | `true`     |
| showFileList    | 是否显示文件列表                       | `boolean`                                      | `true`     |
| disabled        | 是否禁用                               | `boolean`                                      | —          |
| headers         | 上传请求头                             | `object`                                       | —          |
| data            | 上传附加参数                           | `object`                                       | —          |
| name            | 上传字段名                             | `string`                                       | —          |
| method          | 上传方法                               | `string`                                       | —          |
| withCredentials | 是否携带凭证                           | `boolean`                                      | —          |
| httpRequest     | 自定义上传实现,与 `action` 二选一      | `UploadRequestHandler`                         | —          |
| beforeUpload    | 上传前拦截                             | `(file) => boolean \| Promise<boolean>`        | —          |
| beforeRemove    | 移除前拦截                             | `(file, files) => boolean \| Promise<boolean>` | —          |
| preview         | 自定义预览拦截,返回 false 阻止默认预览 | `(file) => boolean \| void`                    | —          |

## 事件

| 事件名             | 说明         | 回调参数                |
| ------------------ | ------------ | ----------------------- |
| update:model-value | 文件列表变化 | `files`                 |
| change             | 文件变化     | `file, files`           |
| remove             | 文件移除     | `file, files`           |
| success            | 上传成功     | `response, file, files` |
| error              | 上传失败     | `error, file?, files?`  |
| progress           | 上传进度     | `event, file, files`    |
| exceed             | 超出限制     | `files, uploadFiles`    |
| validationError    | 校验失败     | `reason, file`          |

## 插槽

| 插槽名  | 说明                    |
| ------- | ----------------------- |
| default | 自定义触发器,默认为按钮 |
| file    | 自定义文件项渲染        |
| tip     | 自定义提示内容          |

## 方法

通过 ref 可获取实例方法:`submit()`、`abort(file?)`、`clearFiles(states?)`、`handleStart(file)`、`handleRemove(file)`。
