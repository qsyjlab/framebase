# ProAsyncButton 异步按钮

自动管理异步操作的加载状态，默认阻止重复执行，并提供成功、失败、结束事件和可选消息反馈。

```vue
<script setup lang="ts">
import type { ProAsyncActionContext } from '@framebase/element-plus-pro-components'

async function save({ signal }: ProAsyncActionContext) {
  return api.save({ signal })
}
</script>

<template>
  <ProAsyncButton type="primary" :action="save" success-message="保存成功"> 保存 </ProAsyncButton>
</template>
```

除下列属性外，组件透传 Element Plus Button 属性。

| 属性           | 说明                         | 类型                               | 默认值 |
| -------------- | ---------------------------- | ---------------------------------- | ------ |
| action         | 异步操作                     | `ProAsyncAction<TResult>`          | —      |
| loading        | 外部控制加载状态             | `boolean`                          | —      |
| autoLoading    | 是否自动显示加载状态         | `boolean`                          | `true` |
| preventRepeat  | 执行中是否复用同一个 Promise | `boolean`                          | `true` |
| successMessage | 成功反馈                     | `ProAsyncFeedbackMessage<TResult>` | —      |
| errorMessage   | 失败反馈                     | `ProAsyncFeedbackMessage<unknown>` | —      |

事件包括 `before`、`success`、`error`、`settled`、`loading-change` 和 `click`。Ref 暴露 `execute()`、`cancel()`、`getLoading()` 与 `getError()`。
