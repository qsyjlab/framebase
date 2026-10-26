# ProStatus 状态

统一业务状态的点、标签与文本展示，支持语义色、自定义颜色、值映射和作用域插槽。`ProField` 的 `status` 类型会复用该组件。

## 基础用法

:::demo 语义色点状状态、标签形态、自定义单色与完整颜色配置
pro-status/basic
:::

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

## Slots

| 插槽名  | 说明                      | 参数                                           |
| ------- | ------------------------- | ---------------------------------------------- |
| default | 替换状态文本              | `{ value, text, tone, variant, colors, meta }` |
| icon    | 替换状态图标（圆点/图标） | `{ value, text, tone, variant, colors, meta }` |

ProStatus 不抛出事件，也没有实例方法；状态切换完全由 props 驱动。
