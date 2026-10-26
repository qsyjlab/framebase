# ProUploadList 批量上传

批量文件上传与列表管理组件,以表格形式展示文件名、大小、进度、状态,支持选择/上传/重试/取消/移除/预览/下载等操作。通过 `request` 自定义上传逻辑(支持 AbortSignal 与进度回调),内置 ProUpload 选择器与 ProPreviewFile 预览。

## 基础用法

:::demo 基础用法
pro-upload-list/basic
:::

仅预览模式(只读):

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProUploadList } from '@framebase/element-plus-pro-components'

const files = ref([
  { name: 'report.pdf', url: '/files/report.pdf', size: 102400, status: 'success', percentage: 100 }
])
</script>

<template>
  <ProUploadList v-model="files" readonly />
</template>
```

自定义触发器:

```vue
<template>
  <ProUploadList v-model="files" :request="request">
    <template #trigger="{ open, openPreview, count }">
      <el-button @click="open">管理附件</el-button>
      <el-tag v-if="count">{{ count }} 个</el-tag>
    </template>
  </ProUploadList>
</template>
```

## Props

| 属性        | 说明                                              | 类型                                   | 默认值       |
| ----------- | ------------------------------------------------- | -------------------------------------- | ------------ |
| modelValue  | 文件列表,支持 v-model                             | `TFile[]`                              | `[]`         |
| request     | 上传请求函数,接收原始文件、AbortSignal 与进度回调 | `(rawFile, ctx) => Promise<TResponse>` | —            |
| mapResponse | 上传成功后将响应映射到文件上                      | `(response, file) => Partial<TFile>`   | —            |
| multiple    | 是否多选                                          | `boolean`                              | `true`       |
| autoUpload  | 选择文件后是否自动上传                            | `boolean`                              | `false`      |
| accept      | 接受的文件类型                                    | `string`                               | —            |
| maxSize     | 单文件大小上限(字节)                              | `number`                               | `20971520`   |
| limit       | 文件数量上限                                      | `number`                               | —            |
| disabled    | 是否禁用                                          | `boolean`                              | `false`      |
| readonly    | 是否只读(只预览,不上传)                           | `boolean`                              | `false`      |
| title       | 弹窗标题                                          | `string`                               | `'上传文件'` |

## 事件

| 事件名             | 说明             | 回调参数         |
| ------------------ | ---------------- | ---------------- |
| update:model-value | 文件列表变化     | `files`          |
| change             | 文件列表变化     | `files`          |
| success            | 单个文件上传成功 | `response, file` |
| error              | 单个文件上传失败 | `error, file`    |
| remove             | 文件移除         | `file`           |
| validationError    | 校验失败         | `reason, file`   |

## 插槽

| 插槽名  | 说明                                             |
| ------- | ------------------------------------------------ |
| trigger | 自定义触发器,接收 `{ open, openPreview, count }` |

## 方法

通过 ref 可获取实例方法:`open()`、`openPreview()`、`close()`、`upload(file)`、`uploadAll()`、`abort(file?)`、`retry(file)`、`remove(file)`、`clear()`。
