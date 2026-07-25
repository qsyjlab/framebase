# ProPreviewFile 文件预览

统一的文件预览组件,内置图片(ElImageViewer)、PDF、xlsx、docx 与不支持类型的统一展示。通过 `show(file)` 方法打开预览,自动根据文件名/类型识别预览方式。常与 ProUpload、ProUploadList 配合使用。

## 基础用法

```vue
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
```

通过 `file` 属性直接绑定并使用 `v-model:visible` 受控:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProPreviewFile } from '@framebase/element-plus-pro-components'

const visible = ref(false)
const file = ref<{ name: string; url?: string }>({ name: 'report.xlsx', url: '/files/report.xlsx' })
</script>

<template>
  <el-button @click="visible = true">预览 Excel</el-button>
  <ProPreviewFile v-model:visible="visible" :file="file" />
</template>
```

不支持在线预览的文件类型会自动回退为下载提示页:

```vue
<template>
  <ProPreviewFile ref="previewRef" :download="true" />
</template>
```

## Props

| 属性     | 说明                    | 类型            | 默认值                  |
| -------- | ----------------------- | --------------- | ----------------------- |
| file     | 受控文件对象            | `TFile \| null` | `null`                  |
| title    | 弹窗标题,默认使用文件名 | `string`        | —                       |
| height   | 预览区域高度            | `string`        | `'calc(100vh - 150px)'` |
| download | 是否显示下载按钮        | `boolean`       | `true`                  |

## 事件

| 事件名         | 说明     | 回调参数  |
| -------------- | -------- | --------- |
| update:visible | 显隐变化 | `boolean` |

## 方法

通过 ref 可获取实例方法:`show(file)`、`close()`、`download()`。同时暴露 `visible`、`file`、`kind`(当前文件类型识别结果:`'image' \| 'pdf' \| 'xlsx' \| 'docx' \| 'unsupported'`)。
