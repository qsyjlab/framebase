# ProRadioGroup 单选组

基于 ElRadioGroup 封装的单选组组件,通过 `options` 配置选项,通过 `fields` 自定义字段映射,支持 `default`(普通单选)与 `button`(按钮样式)两种风格。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProRadioGroup } from '@framebase/element-plus-pro-components'

const value = ref('apple')
const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange', disabled: true }
]
</script>

<template>
  <ProRadioGroup v-model="value" :options="options" />
</template>
```

按钮样式 + 字段映射:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProRadioGroup } from '@framebase/element-plus-pro-components'

const value = ref(1)
const options = [
  { name: '启用', code: 1 },
  { name: '禁用', code: 0 }
]
</script>

<template>
  <ProRadioGroup
    v-model="value"
    :options="options"
    :fields="{ label: 'name', value: 'code' }"
    option-type="button"
  />
</template>
```

通过插槽自定义渲染:

```vue
<template>
  <ProRadioGroup v-model="value" :options="options">
    <template #option="{ option, selected }">
      <span>{{ option.label }}</span>
      <el-tag v-if="selected" type="success" size="small">已选</el-tag>
    </template>
  </ProRadioGroup>
</template>
```

## Props

| 属性       | 说明                                  | 类型                              | 默认值      |
| ---------- | ------------------------------------- | --------------------------------- | ----------- |
| modelValue | 选中值                                | `TValue`                          | —           |
| options    | 选项数据                              | `TOption[]`                       | `[]`        |
| fields     | 字段映射 `{ label, value, disabled }` | `Partial<ProOptionFields>`        | —           |
| optionType | 选项风格                              | `'default' \| 'button'`           | `'default'` |
| size       | 尺寸                                  | `'large' \| 'default' \| 'small'` | —           |
| disabled   | 是否整体禁用                          | `boolean`                         | —           |

## 事件

| 事件名             | 说明       | 回调参数 |
| ------------------ | ---------- | -------- |
| update:model-value | 选中值变化 | `value`  |
| change             | 选中值变化 | `value`  |

## 插槽

| 插槽名  | 说明                                          |
| ------- | --------------------------------------------- |
| default | 默认插槽,接收 option 对象,等价于 option       |
| option  | 自定义选项,接收 `{ option, index, selected }` |

## 方法

通过 ref 可获取实例方法:`focus()`、`blur()`。
