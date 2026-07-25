# ProDrawerForm 抽屉表单

抽屉与表单一体化组件,基于 ProForm + ElDrawer 封装。能力与 ProModalForm 一致,差别仅在容器是抽屉。适用于右侧滑出的复杂表单、详情编辑等场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProDrawerForm } from '@framebase/element-plus-pro-components'
import type { FormSchema } from '@framebase/element-plus-pro-components'

interface Model {
  name: string
  desc: string
  enabled: boolean
}

const formRef = ref()
const fields: FormSchema<Model>[] = [
  {
    field: 'name',
    label: '名称',
    component: 'input',
    rules: [{ required: true, message: '请输入名称' }]
  },
  { field: 'desc', label: '描述', component: 'textarea' },
  { field: 'enabled', label: '启用', component: 'switch' }
]

async function onFinish(values: Model) {
  await fetch('/api/items', { method: 'POST', body: JSON.stringify(values) })
  return true
}
</script>

<template>
  <el-button type="primary" @click="formRef?.open()">新增</el-button>

  <ProDrawerForm
    ref="formRef"
    :fields="fields"
    title="新增项目"
    drawer-size="560px"
    :on-finish="onFinish"
  />
</template>
```

编辑场景(回显数据 + 自定义标题):

```vue
<script setup lang="ts">
function openEdit(record: Model) {
  formRef.value?.open({
    title: `编辑:${record.name}`,
    initialValues: record,
    onFinish: async values => {
      await fetch(`/api/items/${record.id}`, { method: 'PUT', body: JSON.stringify(values) })
      return true
    }
  })
}
</script>
```

## Props

| 属性                        | 说明                                                | 类型                                           | 默认值    |
| --------------------------- | --------------------------------------------------- | ---------------------------------------------- | --------- |
| fields                      | 表单字段 schema,必填                                | `FormSchema<TModel>[]`                         | `[]`      |
| initialValues               | 初始值,打开时回显                                   | `TModel`                                       | `{}`      |
| title                       | 抽屉标题                                            | `string`                                       | `'表单'`  |
| drawerSize                  | 抽屉宽度                                            | `string \| number`                             | `'560px'` |
| cancelText                  | 取消按钮文案                                        | `string`                                       | `'取消'`  |
| confirmText                 | 提交按钮文案                                        | `string`                                       | `'提交'`  |
| onFinish                    | 提交回调,返回 false 阻止关闭                        | `(values) => TResult \| false \| Promise<...>` | —         |
| beforeClose                 | 关闭前拦截,返回 false 阻止关闭                      | `() => boolean \| Promise<boolean>`            | —         |
| closeOnSuccess              | 提交成功后是否自动关闭                              | `boolean`                                      | `true`    |
| resetOnClose                | 关闭后是否重置表单                                  | `boolean`                                      | `true`    |
| preventCloseWhileSubmitting | 提交中是否阻止关闭                                  | `boolean`                                      | `true`    |
| warnWhenDirty               | 有未保存改动时是否提示                              | `boolean`                                      | `true`    |
| drawerProps                 | 透传给 ElDrawer 的属性(不含 modelValue/beforeClose) | `Partial<DrawerProps>`                         | `{}`      |

> 此外还支持 ProForm 的全部属性,如 `inline`、`layout`、`disabled`、`collapsible`、`enableEffect`、`submitter` 等。

## 事件

| 事件名  | 说明     | 回调参数         |
| ------- | -------- | ---------------- |
| open    | 抽屉打开 | `options`        |
| success | 提交成功 | `result, values` |
| error   | 提交失败 | `error`          |
| close   | 抽屉关闭 | —                |

## 插槽

| 插槽名      | 说明                                             |
| ----------- | ------------------------------------------------ |
| before-form | 表单上方内容                                     |
| after-form  | 表单下方内容                                     |
| footer      | 自定义底部按钮,接收 `{ submit, close, loading }` |
| (其他)      | 透传给 ProForm 的所有插槽                        |

## 方法

通过 ref 可获取实例方法:`open(options?)`、`close()`、`submit()`、`reset()`、`getVisible()`、`getLoading()`、`getSubmitting()`、`getForm()`、`getResult()`。
