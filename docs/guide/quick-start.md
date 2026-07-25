# 快速上手

本页演示如何在 Vue 3 项目中接入 Framebase，从安装到跑通第一个 ProTable 示例。

## 1. 安装

参考 [安装](/guide/install)，按需安装对应包。最常用的组合是组件库 + 主题包：

```bash
pnpm add @framebase/element-plus-pro-components @framebase/element-plus-theme
pnpm add element-plus @element-plus/icons-vue dayjs lodash-es sortablejs
```

## 2. 全局注册

在应用入口（如 `main.ts`）中注册 Element Plus 与全部 Pro 组件：

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as FramebasePro from '@framebase/element-plus-pro-components'
import '@framebase/element-plus-pro-components/style.css'
import '@framebase/element-plus-theme/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
Object.values(FramebasePro).forEach(component => {
  if (typeof component === 'object' && 'install' in component) {
    app.use(component as any)
  }
})
app.mount('#app')
```

## 3. 按需引入

如果只使用部分组件，可以具名导入，配合打包工具的 tree-shaking 减小体积：

```ts
import { ProTable, ProForm } from '@framebase/element-plus-pro-components'
```

> 按需引入时仍需引入一次样式：`import '@framebase/element-plus-pro-components/style.css'`。

## 4. 第一个 ProTable

`ProTable` 以 `request` 函数驱动：你只需要声明列、提供数据获取函数，分页、加载态、刷新等都由组件接管。

```vue
<template>
  <ProTable :columns="columns" :request="requestRows" row-key="id" :pagination="{ pageSize: 10 }" />
</template>

<script setup lang="ts">
import {
  ProTable,
  type ProTableColumns,
  type ProTableRequestParams,
  type ProTableRequestResult
} from '@framebase/element-plus-pro-components'

interface Row {
  id: number
  name: string
  status: 'pending' | 'processing' | 'completed'
}

const columns: ProTableColumns<Row> = [
  { key: 'name', dataIndex: 'name', title: '名称' },
  { key: 'status', dataIndex: 'status', title: '状态' }
]

async function requestRows(
  params: ProTableRequestParams<Record<string, never>>
): Promise<ProTableRequestResult<Row>> {
  // 在这里调用后端接口,根据 params.current / params.pageSize 分页
  return { data: [], total: 0, success: true }
}
</script>
```

### 关键参数

| 参数         | 说明                                                     |
| ------------ | -------------------------------------------------------- |
| `columns`    | 列定义，支持 `valueType` / `valueEnum` 自动渲染          |
| `request`    | 数据请求函数，接收分页与筛选参数，返回 `{ data, total }` |
| `row-key`    | 行唯一标识                                               |
| `pagination` | 分页配置，传 `{ pageSize: 10 }` 即可启用                 |

## 下一步

- [ProTable](/components/pro-table) —— 完整的列配置、选择、列设置等能力。
- [ProForm](/components/pro-form) —— Schema 驱动的表单。
- [组件总览](/components/guide) —— 浏览全部组件。
