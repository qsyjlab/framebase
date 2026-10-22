# ProPageContainer 页面容器

ProPageContainer 用于统一管理页面的面包屑、标题、副标题、描述、操作区、正文和底部工具栏，适合作为列表页、详情页及表单页的最外层容器。

## 基础用法

通过 `breadcrumb`、`title` 和 `description` 构建页面头部，使用 `extra` 和 `footer` 插槽放置页面级操作。

:::demo 页面容器的完整结构
pro-page-container/basic
:::

## Props

| 参数           | 说明                                           | 类型                                     | 默认值                          |
| -------------- | ---------------------------------------------- | ---------------------------------------- | ------------------------------- |
| title          | 页面标题                                       | `string`                                 | —                               |
| subtitle       | 副标题                                         | `string`                                 | —                               |
| description    | 描述文案                                       | `string`                                 | —                               |
| extra          | 标题行右侧简单文案                             | `string`                                 | —                               |
| breadcrumb     | 面包屑配置                                     | `Array<string \| ProPageBreadcrumbItem>` | —                               |
| back           | 是否显示返回按钮；未传时根据 `back` 监听器判断 | `boolean`                                | —                               |
| ghost          | 透明模式                                       | `boolean`                                | `false`                         |
| bordered       | 是否显示外边框                                 | `boolean`                                | `false`                         |
| headerBordered | 是否显示头部分隔线                             | `boolean`                                | `true`                          |
| loading        | 是否显示内容骨架屏                             | `boolean`                                | `false`                         |
| contentPadding | 内容区内边距，`false` 表示无内边距             | `number \| string \| boolean`            | 普通模式 `24px`，ghost 模式 `0` |
| headerStyle    | 页头自定义样式                                 | `CSSProperties`                          | —                               |
| contentStyle   | 内容区自定义样式                               | `CSSProperties`                          | —                               |
| footerStyle    | 底部工具栏自定义样式                           | `CSSProperties`                          | —                               |
| footerAlign    | 底部工具栏对齐方式                             | `'left' \| 'center' \| 'right'`          | `'right'`                       |

## Slots

| 插槽        | 说明           |
| ----------- | -------------- |
| default     | 页面正文       |
| breadcrumb  | 自定义面包屑   |
| title       | 自定义标题     |
| subtitle    | 自定义副标题   |
| description | 自定义描述     |
| extra       | 页头右侧操作区 |
| loading     | 自定义加载态   |
| footer      | 底部工具栏     |

## Events

| 事件名 | 说明               | 回调参数 |
| ------ | ------------------ | -------- |
| back   | 点击返回按钮时触发 | —        |
