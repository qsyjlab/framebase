# ProEmpty 空状态

用于在列表、表格、搜索结果等没有数据可展示时显示的空状态占位组件,内置多种内置状态(空数据、搜索无结果、加载失败、无权限),并支持自定义图标、描述与操作按钮。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProEmpty } from '@framebase/element-plus-pro-components'

const status = ref<'empty' | 'search' | 'error' | 'forbidden'>('empty')
</script>

<template>
  <ProEmpty
    :status="status"
    action-text="刷新"
    secondary-action-text="返回"
    @action="() => console.log('刷新')"
    @secondary-action="() => console.log('返回')"
  />
</template>
```

使用自定义图片与描述:

```vue
<template>
  <ProEmpty
    image="/empty.svg"
    :image-size="160"
    title="还没有任何项目"
    description="点击下方按钮创建第一个项目"
    action-text="创建项目"
  />
</template>
```

紧凑模式适用于空间较小的容器内:

```vue
<template>
  <ProEmpty status="search" compact />
</template>
```

## Props

| 属性                | 说明                                     | 类型                                            | 默认值    |
| ------------------- | ---------------------------------------- | ----------------------------------------------- | --------- |
| status              | 内置状态类型,决定默认图标与文案          | `'empty' \| 'search' \| 'error' \| 'forbidden'` | `'empty'` |
| title               | 标题,不传时使用内置默认文案              | `string`                                        | —         |
| description         | 描述文字,不传时使用内置默认文案          | `string`                                        | —         |
| image               | 自定义图片地址,传入后将覆盖内置 SVG 图标 | `string`                                        | —         |
| imageSize           | 图标尺寸,数字按 px 处理                  | `number \| string`                              | `112`     |
| compact             | 是否启用紧凑模式,缩小内边距与图标        | `boolean`                                       | `false`   |
| actionText          | 主操作按钮文案,设置后显示按钮            | `string`                                        | —         |
| secondaryActionText | 次要操作按钮文案                         | `string`                                        | —         |
| bodyStyle           | 自定义根节点样式                         | `CSSProperties`                                 | —         |

## 事件

| 事件名           | 说明                   | 回调参数 |
| ---------------- | ---------------------- | -------- |
| action           | 点击主操作按钮时触发   | —        |
| secondary-action | 点击次要操作按钮时触发 | —        |

## 插槽

| 插槽名      | 说明                      |
| ----------- | ------------------------- |
| image       | 自定义图标/图片内容       |
| title       | 自定义标题                |
| description | 自定义描述                |
| extra       | 自定义操作区,覆盖默认按钮 |
