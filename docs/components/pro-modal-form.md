# ProModalForm 弹窗表单

弹窗与表单一体化组件,基于 ProForm + ElDialog 封装。内置打开/关闭、加载、提交、重置等流程,并通过 `useProFormContainer` 复用与 ProDrawerForm 一致的生命周期。适用于"新增/编辑"等弹窗表单场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProModalForm } from '@framebase/element-plus-pro-components'
import type { FormSchema } from '@framebase/element-plus-pro-components'

interface Model {
  name: string
  age: number
  email: string
}

const formRef = ref()
const fields: FormSchema<Model>[] = [
  {
    field: 'name',
    label: '姓名',
    component: 'input',
    rules: [{ required: true, message: '请输入姓名' }]
  },
  { field: 'age', label: '年龄', component: 'number' },
  { field: 'email', label: '邮箱', component: 'input' }
]

function openCreate() {
  formRef.value?.open()
}

async function onFinish(values: Model) {
  await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(values)
  })
  return true
}
</script>

<template>
  <el-button type="primary" @click="openCreate">新增</el-button>

  <ProModalForm
    ref="formRef"
    :fields="fields"
    title="新增用户"
    width="640px"
    :on-finish="onFinish"
    @success="() => console.log('提交成功')"
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
      await fetch(`/api/users/${record.id}`, { method: 'PUT', body: JSON.stringify(values) })
      return true
    }
  })
}
</script>
```

## Props

| 属性                        | 说明                                                       | 类型                                           | 默认值    |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------- | --------- |
| fields                      | 表单字段 schema,必填                                       | `FormSchema<TModel>[]`                         | `[]`      |
| initialValues               | 初始值,打开时回显                                          | `TModel`                                       | `{}`      |
| title                       | 弹窗标题                                                   | `string`                                       | `'表单'`  |
| width                       | 弹窗宽度                                                   | `string \| number`                             | `'640px'` |
| cancelText                  | 取消按钮文案                                               | `string`                                       | `'取消'`  |
| confirmText                 | 提交按钮文案                                               | `string`                                       | `'提交'`  |
| onFinish                    | 提交回调,返回 false 阻止关闭,返回值会作为 success 事件参数 | `(values) => TResult \| false \| Promise<...>` | —         |
| beforeClose                 | 关闭前拦截,返回 false 阻止关闭                             | `() => boolean \| Promise<boolean>`            | —         |
| closeOnSuccess              | 提交成功后是否自动关闭                                     | `boolean`                                      | `true`    |
| resetOnClose                | 关闭后是否重置表单                                         | `boolean`                                      | `true`    |
| preventCloseWhileSubmitting | 提交中是否阻止关闭                                         | `boolean`                                      | `true`    |
| warnWhenDirty               | 有未保存改动时是否提示                                     | `boolean`                                      | `true`    |
| dialogProps                 | 透传给 ElDialog 的属性(不含 modelValue/beforeClose)        | `Partial<DialogProps>`                         | `{}`      |

> 此外还支持 ProForm 的全部属性,如 `inline`、`layout`、`disabled`、`collapsible`、`enableEffect`、`submitter` 等。

## 事件

| 事件名  | 说明     | 回调参数         |
| ------- | -------- | ---------------- |
| open    | 弹窗打开 | `options`        |
| success | 提交成功 | `result, values` |
| error   | 提交失败 | `error`          |
| close   | 弹窗关闭 | —                |

## 插槽

| 插槽名      | 说明                                             |
| ----------- | ------------------------------------------------ |
| before-form | 表单上方内容                                     |
| after-form  | 表单下方内容                                     |
| footer      | 自定义底部按钮,接收 `{ submit, close, loading }` |
| (其他)      | 透传给 ProForm 的所有插槽                        |

## 方法

通过 ref 可获取实例方法:`open(options?)`、`close()`、`submit()`、`reset()`、`getVisible()`、`getLoading()`、`getSubmitting()`、`getForm()`、`getResult()`。
