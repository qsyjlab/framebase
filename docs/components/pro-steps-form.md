# ProStepsForm 分步表单

将表单拆分为多个步骤,每步独立校验,统一在最后一步提交。基于 ProForm + ElSteps 实现,适用于注册引导、多步提单、向导等场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProStepsForm } from '@framebase/element-plus-pro-components'
import type { FormSchema } from '@framebase/element-plus-pro-components'

interface Model {
  name: string
  email: string
  plan: string
  remark: string
}

const formRef = ref()

const steps = [
  {
    key: 'basic',
    title: '基本信息',
    description: '填写账户信息',
    fields: [
      {
        field: 'name',
        label: '姓名',
        component: 'input',
        rules: [{ required: true, message: '请输入姓名' }]
      },
      { field: 'email', label: '邮箱', component: 'input' }
    ] as FormSchema<Model>[]
  },
  {
    key: 'plan',
    title: '套餐选择',
    fields: [
      {
        field: 'plan',
        label: '套餐',
        component: 'select',
        options: [
          { label: '免费版', value: 'free' },
          { label: '专业版', value: 'pro' }
        ]
      }
    ] as FormSchema<Model>[]
  },
  {
    key: 'confirm',
    title: '确认信息',
    fields: [{ field: 'remark', label: '备注', component: 'textarea' }] as FormSchema<Model>[],
    beforeNext: values => {
      if (!values.plan) {
        alert('请先选择套餐')
        return false
      }
      return true
    }
  }
]

async function onFinish(values: Model) {
  await fetch('/api/orders', { method: 'POST', body: JSON.stringify(values) })
  return true
}
</script>

<template>
  <ProStepsForm
    ref="formRef"
    :steps="steps"
    :on-finish="onFinish"
    @success="() => console.log('提交成功')"
  />
</template>
```

通过 `actions` 插槽自定义底部按钮:

```vue
<template>
  <ProStepsForm ref="formRef" :steps="steps" :on-finish="onFinish">
    <template #actions="{ current, next, previous, submit, loading }">
      <el-button v-if="current > 0" @click="previous">上一步</el-button>
      <el-button v-if="current < steps.length - 1" type="primary" @click="next">下一步</el-button>
      <el-button v-else type="primary" :loading="loading" @click="submit">提交订单</el-button>
    </template>
  </ProStepsForm>
</template>
```

## Props

| 属性          | 说明                                 | 类型                                           | 默认值     |
| ------------- | ------------------------------------ | ---------------------------------------------- | ---------- |
| steps         | 步骤配置数组,必填                    | `ProStepsFormStep<TModel>[]`                   | `[]`       |
| initialValues | 表单初始值                           | `TModel`                                       | `{}`       |
| onFinish      | 最后一步提交回调,返回 false 阻止关闭 | `(values) => TResult \| false \| Promise<...>` | —          |
| previousText  | 上一步按钮文案                       | `string`                                       | `'上一步'` |
| nextText      | 下一步按钮文案                       | `string`                                       | `'下一步'` |
| submitText    | 提交按钮文案                         | `string`                                       | `'提交'`   |

### ProStepsFormStep

| 属性        | 说明                                   | 类型                                      |
| ----------- | -------------------------------------- | ----------------------------------------- |
| key         | 步骤唯一标识                           | `string \| number`                        |
| title       | 步骤标题                               | `string`                                  |
| description | 步骤描述                               | `string`                                  |
| fields      | 该步骤的表单字段 schema                | `FormSchema<TModel>[]`                    |
| formProps   | 该步骤透传给 ProForm 的额外属性        | `Partial<ProFormProps>`                   |
| beforeNext  | 进入下一步前的拦截,返回 false 阻止跳转 | `(values) => boolean \| Promise<boolean>` |

## 事件

| 事件名             | 说明       | 回调参数          |
| ------------------ | ---------- | ----------------- |
| update:model-value | 表单值变化 | `values`          |
| change             | 步骤切换   | `current, values` |
| success            | 提交成功   | `result, values`  |
| error              | 提交失败   | `error`           |

## 插槽

| 插槽名      | 说明                                                           |
| ----------- | -------------------------------------------------------------- |
| before-step | 当前步骤上方内容,接收 `{ step, current }`                      |
| after-step  | 当前步骤下方内容,接收 `{ step, current }`                      |
| actions     | 底部按钮区,接收 `{ current, next, previous, submit, loading }` |
| (其他)      | 透传给 ProForm 的所有插槽                                      |

## 方法

通过 ref 可获取实例方法:`next()`、`previous()`、`goTo(index)`、`submit()`、`reset()`、`getCurrent()`、`getValues()`、`getForm()`、`getResult()`、`getLoading()`。
