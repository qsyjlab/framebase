# ProBadge 徽标

用于图标、头像和按钮上的通知红点、数量或短文本徽标，兼容 Element Plus Badge 的核心能力并补充语义色、呼吸动画和四方向定位。

```vue
<template>
  <ProBadge dot pulse>
    <el-button circle>通知</el-button>
  </ProBadge>

  <ProBadge :value="12" :max="9">
    <el-button>未读消息</el-button>
  </ProBadge>

  <ProBadge value="NEW" color="#722ed1">
    <el-button>版本更新</el-button>
  </ProBadge>
</template>
```

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
