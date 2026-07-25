# ProCheckCard 选择卡片

卡片式选择组件,以卡片形式展示可选项,支持单选与多选两种模式。组件包含 `ProCheckCard`(单张卡片)与 `ProCheckCardGroup`(卡片组,通过 `options` 批量配置)两个组件,后者内置键盘导航。

## 基础用法

使用 ProCheckCardGroup 实现单选:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProCheckCardGroup } from '@framebase/element-plus-pro-components'

const value = ref('monthly')
const options = [
  { value: 'monthly', title: '按月订阅', description: '每月 ¥30,可随时取消' },
  { value: 'yearly', title: '按年订阅', description: '每年 ¥300,节省 17%' },
  { value: 'lifetime', title: '终身会员', description: '一次性 ¥999', disabled: true }
]
</script>

<template>
  <ProCheckCardGroup v-model="value" :options="options" :columns="3" />
</template>
```

多选模式:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProCheckCardGroup } from '@framebase/element-plus-pro-components'

const value = ref<string[]>(['auth'])
const options = [
  { value: 'auth', title: '登录鉴权', description: '基础登录能力' },
  { value: 'audit', title: '操作审计', description: '记录关键操作日志' },
  { value: 'sso', title: 'SSO 单点登录', description: '需要企业版授权' }
]
</script>

<template>
  <ProCheckCardGroup v-model="value" :options="options" multiple :columns="2" />
</template>
```

使用 ProCheckCard 单独使用:

```vue
<template>
  <ProCheckCard
    v-model="checked"
    value="agree"
    title="我已阅读并同意"
    description="点击卡片表示同意用户协议"
  />
</template>
```

## ProCheckCard Props

| 属性        | 说明             | 类型                 | 默认值  |
| ----------- | ---------------- | -------------------- | ------- |
| modelValue  | 当前选中值       | `TValue \| TValue[]` | —       |
| value       | 当前卡片代表的值 | `TValue`             | —       |
| title       | 卡片标题         | `string`             | —       |
| description | 卡片描述         | `string`             | —       |
| avatar      | 头像地址         | `string`             | —       |
| disabled    | 是否禁用         | `boolean`            | —       |
| loading     | 是否加载中       | `boolean`            | —       |
| multiple    | 是否多选模式     | `boolean`            | `false` |
| bodyStyle   | 自定义卡片样式   | `CSSProperties`      | —       |

## ProCheckCardGroup Props

| 属性       | 说明                       | 类型                   | 默认值  |
| ---------- | -------------------------- | ---------------------- | ------- |
| modelValue | 选中值,单选为值,多选为数组 | `TValue \| TValue[]`   | —       |
| options    | 卡片选项配置               | `ProCheckCardOption[]` | `[]`    |
| multiple   | 是否多选                   | `boolean`              | `false` |
| columns    | 列数                       | `number`               | `3`     |
| gap        | 卡片间距,数字按 px 处理    | `number \| string`     | `12`    |

## 事件

| 事件名             | 说明       | 回调参数 |
| ------------------ | ---------- | -------- |
| update:model-value | 选中值变化 | `value`  |
| change             | 选中值变化 | `value`  |

## 插槽(ProCheckCard)

| 插槽名      | 说明           |
| ----------- | -------------- |
| avatar      | 自定义头像     |
| title       | 自定义标题     |
| description | 自定义描述     |
| default     | 自定义内容     |
| extra       | 自定义额外区域 |
