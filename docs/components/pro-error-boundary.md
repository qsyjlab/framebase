# ProErrorBoundary 错误边界

捕获子树内渲染、生命周期与事件处理中的异常，用兜底 UI 替换出错区域，避免整页白屏。支持 `resetKeys` 自动重置与命令式 `reset()`。

## 基础用法

:::demo 点击「触发异常」让子树抛错，兜底 UI 接管该区域，重置后恢复
pro-error-boundary/basic
:::

## 自定义兜底

`fallback` 插槽拿到 `error` 与 `reset`，可渲染任意兜底内容；也可以用 `fallback` 属性传静态 VNode：

```vue
<ProErrorBoundary :fallback="() => h('p', '区块加载失败')">
  <ExpensiveChart />
</ProErrorBoundary>
```

`resetKeys` 里的值发生变化时边界会自动复位，适合「数据重新拉取后清掉错误态」的场景。

## Props

| 属性            | 说明                       | 类型                                     | 默认值 |
| --------------- | -------------------------- | ---------------------------------------- | ------ |
| fallback        | 兜底内容                   | `VNodeChild \| (() => VNodeChild)`       | —      |
| onError         | 捕获异常时的回调           | `(error: unknown, info: string) => void` | —      |
| stopPropagation | 是否阻止异常继续向上冒泡   | `boolean`                                | `true` |
| resetKeys       | 值变化时自动重置边界       | `unknown[]`                              | —      |
| title           | 默认兜底 UI 的标题         | `string`                                 | —      |
| subTitle        | 默认兜底 UI 的副标题       | `string`                                 | —      |
| reloadText      | 默认兜底 UI 的重载按钮文案 | `string`                                 | —      |

## Events

| 事件名 | 说明       | 回调参数                       |
| ------ | ---------- | ------------------------------ |
| error  | 捕获到异常 | `error: unknown, info: string` |

## Slots

| 插槽名   | 说明           | 参数               |
| -------- | -------------- | ------------------ |
| default  | 受保护的子树   | —                  |
| fallback | 自定义兜底内容 | `{ error, reset }` |

## Expose

| 成员     | 说明           | 类型           |
| -------- | -------------- | -------------- |
| error    | 当前捕获的异常 | `Ref<unknown>` |
| hasError | 是否处于错误态 | `Ref<boolean>` |
| reset    | 手动重置边界   | `() => void`   |
