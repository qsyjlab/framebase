# ProStatus 状态

统一业务状态的点、标签与文本展示，支持语义色、自定义颜色、值映射和作用域插槽。`ProField` 的 `status` 类型会复用该组件。

## 基础用法

```vue
<template>
  <ProStatus tone="success" text="运行中" />
  <ProStatus tone="processing" text="发布中" />
  <ProStatus tone="warning" text="待确认" variant="tag" />
  <ProStatus text="品牌状态" color="#722ed1" />
</template>
```

完整自定义颜色：

```vue
<ProStatus
  text="高风险"
  variant="tag"
  :color="{
    foreground: '#d4380d',
    background: '#fff2e8',
    border: '#ffbb96',
    dot: '#fa541c'
  }"
/>
```

## Props

| 属性      | 说明               | 类型                               | 默认值      |
| --------- | ------------------ | ---------------------------------- | ----------- |
| value     | 业务状态值         | `PropertyKey`                      | —           |
| valueEnum | 状态值映射         | `ProStatusValueEnum`               | —           |
| text      | 显示文本           | `string`                           | —           |
| tone      | 状态语义           | `ProStatusTone`                    | `'default'` |
| variant   | 展示形式           | `'dot' \| 'tag' \| 'text'`         | `'dot'`     |
| effect    | 标签效果           | `'light' \| 'plain' \| 'dark'`     | `'light'`   |
| color     | 单色或完整颜色配置 | `string \| ProStatusColors`        | —           |
| icon      | 自定义图标         | `Component`                        | —           |
| pulse     | 是否启用呼吸动画   | `boolean`                          | `false`     |
| live      | 无障碍动态播报模式 | `'off' \| 'polite' \| 'assertive'` | `'off'`     |

`default` 与 `icon` 插槽均接收 `value`、`text`、`tone`、`variant`、`colors` 和 `meta`。
