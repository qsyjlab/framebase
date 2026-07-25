# ProCheckboxGroup 复选组

基于 ElCheckboxGroup 封装的复选组组件,通过 `options` 配置选项,通过 `fields` 自定义字段映射,支持 `default`(普通复选)与 `button`(按钮样式)两种风格,并可设置 `min` / `max` 限制可选数量。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProCheckboxGroup } from '@framebase/element-plus-pro-components'

const value = ref(['apple'])
const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange', disabled: true }
]
</script>

<template>
  <ProCheckboxGroup v-model="value" :options="options" />
</template>
```

按钮样式 + 字段映射 + 数量限制:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProCheckboxGroup } from '@framebase/element-plus-pro-components'

const value = ref<number[]>([])
const options = [
  { name: '读写', code: 1 },
  { name: '只读', code: 2 },
  { name: '隐藏', code: 3 }
]
</script>

<template>
  <ProCheckboxGroup
    v-model="value"
    :options="options"
    :fields="{ label: 'name', value: 'code' }"
    option-type="button"
    :min="1"
    :max="2"
  />
</template>
```

## Props

| 属性       | 说明                                  | 类型                              | 默认值      |
| ---------- | ------------------------------------- | --------------------------------- | ----------- |
| modelValue | 选中值数组                            | `TValue[]`                        | —           |
| options    | 选项数据                              | `TOption[]`                       | `[]`        |
| fields     | 字段映射 `{ label, value, disabled }` | `Partial<ProOptionFields>`        | —           |
| optionType | 选项风格                              | `'default' \| 'button'`           | `'default'` |
| size       | 尺寸                                  | `'large' \| 'default' \| 'small'` | —           |
| disabled   | 是否整体禁用                          | `boolean`                         | —           |
| min        | 最少可选数量                          | `number`                          | —           |
| max        | 最多可选数量                          | `number`                          | —           |

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
