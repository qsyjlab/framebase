# ProBadge 徽标

用于图标、头像和按钮上的通知红点、数量或短文本徽标，兼容 Element Plus Badge 的核心能力并补充语义色、呼吸动画和四方向定位。

:::demo 图标、数字与文本徽标，支持语义色、呼吸动画和四方向定位
pro-badge/basic
:::

## Props

| 属性      | 说明             | 类型                                                           | 默认值        |
| --------- | ---------------- | -------------------------------------------------------------- | ------------- |
| value     | 数量或短文本     | `string \| number`                                             | `''`          |
| max       | 数字最大显示值   | `number`                                                       | `99`          |
| dot       | 是否显示为圆点   | `boolean`                                                      | `false`       |
| hidden    | 是否隐藏         | `boolean`                                                      | `false`       |
| showZero  | 是否显示数字零   | `boolean`                                                      | `true`        |
| pulse     | 是否启用呼吸动画 | `boolean`                                                      | `false`       |
| tone      | 语义颜色         | `ProStatusTone`                                                | `'danger'`    |
| color     | 自定义颜色       | `string`                                                       | —             |
| placement | 徽标方向         | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` |
| offset    | 位置偏移         | `[number, number]`                                             | `[0, 0]`      |

默认插槽为被徽标包裹的内容，`content` 插槽用于自定义徽标内容。
