# ProConfirmButton 确认按钮

在异步操作前增加确认步骤，支持行内 Popconfirm、MessageBox、危险操作样式与显式权限控制。

:::demo 行内 Popconfirm 与 MessageBox 两种确认形态，含权限缺失时的禁用表现
pro-confirm-button/basic
:::

组件继承 `ProAsyncButton` 的异步操作与 Button 属性。

## Props

| 属性           | 说明                         | 类型                               | 默认值   |
| -------------- | ---------------------------- | ---------------------------------- | -------- |
| confirm        | 确认文案或详细配置           | `string \| ProConfirmConfig`       | —        |
| access         | 是否具有 UI 操作权限         | `boolean`                          | `true`   |
| deniedBehavior | 无权限时的表现               | `'hide' \| 'disable'`              | `'hide'` |
| deniedReason   | 禁用时的原生提示             | `string`                           | —        |
| action         | 确认后执行的异步操作         | `ProAsyncAction<TResult>`          | —        |
| loading        | 外部控制加载状态             | `boolean`                          | —        |
| autoLoading    | 是否自动显示加载状态         | `boolean`                          | `true`   |
| preventRepeat  | 执行中是否复用同一个 Promise | `boolean`                          | `true`   |
| successMessage | 成功反馈                     | `ProAsyncFeedbackMessage<TResult>` | —        |
| errorMessage   | 失败反馈                     | `ProAsyncFeedbackMessage<unknown>` | —        |

其余属性透传给 Element Plus Button（`type`、`size`、`plain`、`disabled` 等）。

### ProConfirmConfig

| 字段        | 说明         | 类型                                 |
| ----------- | ------------ | ------------------------------------ |
| title       | 确认标题     | `string`                             |
| description | 确认正文     | `string`                             |
| mode        | 确认形态     | `'popconfirm' \| 'message-box'`      |
| type        | 确认框语义   | `'default' \| 'warning' \| 'danger'` |
| confirmText | 确认按钮文案 | `string`                             |
| cancelText  | 取消按钮文案 | `string`                             |

## Events

| 事件名         | 说明                   | 回调参数           |
| -------------- | ---------------------- | ------------------ |
| confirm        | 用户确认后、执行操作前 | —                  |
| cancel         | 用户取消确认           | —                  |
| before         | 异步操作开始前         | —                  |
| success        | 异步操作成功           | `result: TResult`  |
| error          | 异步操作失败           | `error: unknown`   |
| settled        | 成功或失败后都会触发   | —                  |
| loading-change | 加载状态变化           | `loading: boolean` |

## Expose

继承 `ProAsyncButton`：`execute()`、`cancel()`、`getLoading()`、`getError()`。

权限属性仅控制界面表现，服务端仍需进行真实权限校验。
