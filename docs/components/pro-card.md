# ProCard 卡片

ProCard 是内容容器组件，提供标题、副标题、操作区、阴影、可折叠、栅格分栏等能力。配合 `ProStatisticCard` 可快速搭建统计卡片，常用于仪表盘与详情页布局。

## 基础用法

通过 `title`/`subtitle` 设置标题，`shadow` 控制阴影，`extra` 插槽放置操作区。`ProStatisticCard` 在卡片基础上叠加数值、趋势与描述。

:::demo 展示基础卡片、带操作卡片和统计卡片的多种样式
pro-card/basic
:::

## Props

### ProCard

| 参数             | 说明                       | 类型                                            | 默认值       |
| ---------------- | -------------------------- | ----------------------------------------------- | ------------ |
| title            | 标题                       | `string`                                        | —            |
| subtitle         | 副标题                     | `string`                                        | —            |
| bordered         | 是否显示边框               | `boolean`                                       | `true`       |
| shadow           | 阴影模式                   | `'always' \| 'hover' \| 'never'`                | `'never'`    |
| loading          | 加载态                     | `boolean`                                       | `false`      |
| collapsible      | 是否可折叠                 | `boolean`                                       | `false`      |
| collapsed        | 是否折叠（v-model）        | `boolean`                                       | —            |
| defaultCollapsed | 默认是否折叠               | `boolean`                                       | `false`      |
| headerBordered   | 是否显示头部下边框         | `boolean`                                       | `false`      |
| split            | 是否分栏分割               | `boolean`                                       | `false`      |
| direction        | 布局方向                   | `'horizontal' \| 'vertical'`                    | `'vertical'` |
| columns          | 内容栅格列数（支持响应式） | `number \| Partial<Record<Breakpoint, number>>` | `1`          |
| gap              | 栅格间距                   | `number \| string`                              | `16`         |
| bodyPadding      | 内容区内边距               | `number \| string \| boolean`                   | `true`       |
| bodyStyle        | 内容区自定义样式           | `CSSProperties`                                 | —            |

### ProStatisticCard

继承 ProCard 全部 Props（除 `title` 语义不同），额外支持：

| 参数        | 说明         | 类型                       | 默认值   |
| ----------- | ------------ | -------------------------- | -------- |
| title       | 标题         | `string`                   | —        |
| value       | 数值         | `string \| number`         | —        |
| precision   | 小数位数     | `number`                   | —        |
| prefix      | 前缀         | `string`                   | —        |
| suffix      | 后缀         | `string`                   | —        |
| description | 描述文案     | `string`                   | —        |
| trend       | 趋势方向     | `'up' \| 'down' \| 'flat'` | `'flat'` |
| trendValue  | 趋势数值     | `string \| number`         | —        |
| formatter   | 自定义格式化 | `(value) => string`        | —        |

## Slots

| 插槽     | 说明               |
| -------- | ------------------ |
| default  | 卡片内容           |
| title    | 自定义标题         |
| subtitle | 自定义副标题       |
| extra    | 操作区（头部右侧） |
| loading  | 自定义加载态       |

## Events

| 事件名           | 说明                    | 回调参数             |
| ---------------- | ----------------------- | -------------------- |
| update:collapsed | 折叠状态变化（v-model） | `collapsed: boolean` |
| collapse         | 折叠状态变化            | `collapsed: boolean` |
