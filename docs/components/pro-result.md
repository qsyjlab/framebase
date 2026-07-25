# ProResult 结果页

用于在流程结束后反馈处理结果,内置 success / error / warning / info / 403 / 404 / 500 七种状态,提供默认图标、标题与文案,并支持自定义操作按钮与附加内容。

## 基础用法

```vue
<script setup lang="ts">
import { ProResult } from '@framebase/element-plus-pro-components'

function handleSubmit() {
  // 跳转或刷新
}
</script>

<template>
  <ProResult
    status="success"
    title="提交成功"
    sub-title="订单已创建,请等待审核"
    primary-text="查看订单"
    secondary-text="返回列表"
    @primary="handleSubmit"
  />
</template>
```

错误页与 404 页面:

```vue
<template>
  <ProResult status="404" primary-text="返回首页" @primary="() => console.log('go home')" />
</template>
```

通过默认插槽展示附加内容(如步骤、详情):

```vue
<template>
  <ProResult status="warning" title="请确认以下信息">
    <div>订单编号:FB20240101001</div>
    <div>支付金额:¥199.00</div>
  </ProResult>
</template>
```

## Props

| 属性          | 说明                              | 类型                                                                     | 默认值   |
| ------------- | --------------------------------- | ------------------------------------------------------------------------ | -------- |
| status        | 状态类型,决定默认图标、颜色与文案 | `'success' \| 'error' \| 'warning' \| 'info' \| '403' \| '404' \| '500'` | `'info'` |
| title         | 标题,不传时使用内置默认文案       | `string`                                                                 | —        |
| subTitle      | 副标题,不传时使用内置默认文案     | `string`                                                                 | —        |
| primaryText   | 主操作按钮文案,设置后显示按钮     | `string`                                                                 | —        |
| secondaryText | 次要操作按钮文案                  | `string`                                                                 | —        |
| bodyStyle     | 自定义根节点样式                  | `CSSProperties`                                                          | —        |

## 事件

| 事件名    | 说明                   | 回调参数 |
| --------- | ---------------------- | -------- |
| primary   | 点击主操作按钮时触发   | —        |
| secondary | 点击次要操作按钮时触发 | —        |

## 插槽

| 插槽名   | 说明                      |
| -------- | ------------------------- |
| icon     | 自定义图标                |
| title    | 自定义标题                |
| subTitle | 自定义副标题              |
| default  | 内容区,展示附加信息       |
| extra    | 自定义操作区,覆盖默认按钮 |
