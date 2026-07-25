# ProSelect 选择器

基于 ElSelect 封装的增强选择器,在原有能力之上增加了:远程请求驱动、options 缓存、字段映射(fields)、分组(group)、空状态/错误重试统一展示。可通过 `request` 接管选项加载,通过 `cache` 开启结果缓存。

## 基础用法

静态选项 + 字段映射:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProSelect } from '@framebase/element-plus-pro-components'

const value = ref('')
const options = [
  { label: '张三', value: '1' },
  { label: '李四', value: '2' }
]
</script>

<template>
  <ProSelect v-model="value" :options="options" clearable placeholder="请选择人员" />
</template>
```

远程搜索 + 缓存:

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ProSelect } from '@framebase/element-plus-pro-components'

const value = ref('')
const params = reactive<{ type: string }>({ type: 'user' })

async function request(query: { keyword?: string; type: string }) {
  const res = await fetch(`/api/users?type=${query.type}&keyword=${query.keyword ?? ''}`)
  return await res.json()
}
</script>

<template>
  <ProSelect
    v-model="value"
    :request="request"
    :params="params"
    :fields="{ label: 'name', value: 'id' }"
    filterable
    remote
    cache
    :cache-time="60000"
    placeholder="搜索用户"
  />
</template>
```

分组选项:

```vue
<template>
  <ProSelect :options="groupOptions" group :fields="{ label: 'groupName', options: 'children' }" />
</template>
```

## Props

| 属性            | 说明                                              | 类型                                       | 默认值         |
| --------------- | ------------------------------------------------- | ------------------------------------------ | -------------- |
| modelValue      | 选中值,多选时为数组                               | `TValue \| TValue[]`                       | —              |
| options         | 静态选项数据                                      | `TOption[]`                                | `[]`           |
| multiple        | 是否多选                                          | `boolean`                                  | `false`        |
| clearable       | 是否可清空                                        | `boolean`                                  | `true`         |
| filterable      | 是否可搜索                                        | `boolean`                                  | `false`        |
| remote          | 是否启用远程搜索                                  | `boolean`                                  | —              |
| remoteMethod    | 自定义远程搜索方法,与 `request` 二选一            | `(query: string) => void \| Promise<void>` | —              |
| request         | 异步加载选项函数                                  | `(params, context) => Promise<TOption[]>`  | —              |
| params          | 请求参数,变化会自动重载                           | `object`                                   | —              |
| fields          | 字段映射,如 `{ label, value, disabled, options }` | `Partial<ProSelectFields<TOption>>`        | —              |
| group           | 是否分组,分组时使用 `fields.options` 取子项       | `boolean`                                  | `false`        |
| size            | 尺寸                                              | `'large' \| 'default' \| 'small'`          | —              |
| loading         | 外部加载状态                                      | `boolean`                                  | —              |
| cache           | 是否启用请求缓存                                  | `boolean`                                  | `false`        |
| cacheKey        | 缓存 key 前缀                                     | `string`                                   | `'pro-select'` |
| cacheTime       | 缓存有效毫秒数                                    | `number`                                   | `300000`       |
| requestDebounce | 请求防抖毫秒数                                    | `number`                                   | —              |
| requestRetry    | 请求失败重试次数                                  | `number`                                   | —              |
| keywordKey      | 关键字在请求参数中的字段名                        | `string`                                   | `'keyword'`    |
| popperClass     | 下拉浮层自定义类名                                | `string`                                   | —              |
| teleported      | 下拉浮层是否 teleport                             | `boolean`                                  | `true`         |

## 事件

| 事件名               | 说明             | 回调参数             |
| -------------------- | ---------------- | -------------------- |
| update:model-value   | 选中值变化       | `value`              |
| change               | 选中值变化       | `value`              |
| request-success      | 请求成功         | `options: TOption[]` |
| request-state-change | 请求生命周期变化 | `lifecycle`          |
| request-error        | 请求失败         | `error`              |

## 插槽

| 插槽名  | 说明                                      |
| ------- | ----------------------------------------- |
| default | 自定义选项内容,接收 option 对象           |
| option  | 自定义选项内容,接收 `{ option, index }`   |
| loading | 自定义加载中                              |
| empty   | 自定义空数据/错误,接收 `{ error, retry }` |
| prefix  | 选择器前缀                                |
| tag     | 多选 tag 自定义                           |

## 方法

通过 ref 可获取实例方法:`reload(params?, force?)`、`clearCache()`、`clearOptions()`、`focus()`、`blur()`。
