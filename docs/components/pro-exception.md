# ProException 异常页

用于 403 / 404 / 500 等 HTTP 状态页的统一占位。内置三套 SVG 插画与默认文案，支持自定义插画、操作按钮与扩展内容；状态可扩展，便于业务注册自定义状态码。

## 基础用法

:::demo 切换 403 / 404 / 500 查看内置插画与默认文案，操作按钮会抛出事件
pro-exception/basic
:::

## 自定义操作与扩展内容

通过 `actions` 替换默认的「返回上一页 / 返回首页」，用默认插槽补充额外信息（如错误码、追踪 ID）：

```vue
<ProException status="500" :actions="[{ key: 'retry', text: '重试', type: 'primary' }]">
  <p>错误码：TRACE-20261026-001</p>
</ProException>
```

`illustration` 插槽可以整体替换插画，`title` / `subTitle` 插槽用于富文本标题。

## Props

| 属性             | 说明                               | 类型                                | 默认值  |
| ---------------- | ---------------------------------- | ----------------------------------- | ------- |
| status           | 状态码                             | `'403' \| '404' \| '500'`（可扩展） | `'404'` |
| title            | 标题，覆盖内置文案                 | `string`                            | —       |
| subTitle         | 副标题，覆盖内置文案               | `string`                            | —       |
| illustration     | 自定义插画图片地址                 | `string`                            | —       |
| illustrationSize | 插画最大宽度                       | `number \| string`                  | `360`   |
| fullPage         | 是否撑满父容器高度并垂直居中       | `boolean`                           | `true`  |
| homePath         | 首页路径（供默认「返回首页」使用） | `string`                            | —       |
| backText         | 「返回上一页」文案                 | `string`                            | —       |
| homeText         | 「返回首页」文案                   | `string`                            | —       |
| reloadText       | 「重新加载」文案                   | `string`                            | —       |
| showBack         | 是否显示「返回上一页」             | `boolean`                           | `true`  |
| showHome         | 是否显示「返回首页」               | `boolean`                           | `true`  |
| showReload       | 是否显示「重新加载」               | `boolean`                           | `false` |
| actions          | 自定义操作列表，传入后替换默认操作 | `ProExceptionAction[]`              | —       |
| bodyStyle        | 根节点样式                         | `CSSProperties`                     | —       |

### ProExceptionAction

| 字段 | 说明     | 类型                     |
| ---- | -------- | ------------------------ |
| key  | 唯一标识 | `string`                 |
| text | 按钮文案 | `string`                 |
| type | 按钮风格 | `'primary' \| 'default'` |
| icon | 图标     | `VNodeChild`             |

## Events

| 事件名 | 说明                         | 回调参数      |
| ------ | ---------------------------- | ------------- |
| back   | 点击「返回上一页」           | —             |
| home   | 点击「返回首页」             | —             |
| reload | 点击「重新加载」             | —             |
| action | 任意操作被点击（含以上三种） | `key: string` |

## Slots

| 插槽名       | 说明                           | 参数 |
| ------------ | ------------------------------ | ---- |
| illustration | 替换内置插画                   | —    |
| title        | 替换标题                       | —    |
| subTitle     | 替换副标题                     | —    |
| default      | 副标题与操作按钮之间的扩展内容 | —    |
| actions      | 替换默认操作按钮区             | —    |
