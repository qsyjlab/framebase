# ProAsyncButton 异步按钮

:::demo 自动管理异步操作的加载状态，默认阻止重复执行，并提供成功、失败、结束事件和可选消息反馈。
pro-async-button/basic
:::

除下列属性外，组件透传 Element Plus Button 属性。

| 属性           | 说明                         | 类型                               | 默认值 |
| -------------- | ---------------------------- | ---------------------------------- | ------ |
| action         | 异步操作                     | `ProAsyncAction<TResult>`          | —      |
| loading        | 外部控制加载状态             | `boolean`                          | —      |
| autoLoading    | 是否自动显示加载状态         | `boolean`                          | `true` |
| preventRepeat  | 执行中是否复用同一个 Promise | `boolean`                          | `true` |
| successMessage | 成功反馈                     | `ProAsyncFeedbackMessage<TResult>` | —      |
| errorMessage   | 失败反馈                     | `ProAsyncFeedbackMessage<unknown>` | —      |

## 事件

| 事件名         | 说明                 | 回调参数            |
| -------------- | -------------------- | ------------------- |
| click          | 点击按钮             | `event: MouseEvent` |
| before         | 异步操作开始前       | —                   |
| success        | 异步操作成功         | `result: TResult`   |
| error          | 异步操作失败         | `error: unknown`    |
| settled        | 成功或失败后都会触发 | —                   |
| loading-change | 加载状态变化         | `loading: boolean`  |

## Expose

| 成员           | 说明                 | 类型                         |
| -------------- | -------------------- | ---------------------------- |
| `execute()`    | 手动触发一次异步操作 | `() => Promise<TResult>`     |
| `cancel()`     | 取消进行中的操作     | `(reason?: unknown) => void` |
| `getLoading()` | 当前加载状态         | `() => boolean`              |
| `getError()`   | 最近一次错误         | `() => unknown`              |
