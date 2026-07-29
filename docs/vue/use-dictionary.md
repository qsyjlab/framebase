# useDictionary

从组件树读取命名字典，返回 `useValueEnum` 的响应式结果。配合 `provideDictionaries` 或 `ProConfigProvider.dictionaries` 使用。

## 用法

### 配合 ProConfigProvider

```vue
<template>
  <ProConfigProvider :dictionaries="dicts">
    <UserTable />
  </ProConfigProvider>
</template>

<script setup>
const dicts = {
  status: { active: { text: '启用', type: 'success' }, disabled: { text: '禁用', type: 'danger' } },
  gender: { m: '男', f: '女' }
}
</script>
```

```ts
// UserTable.vue
import { useDictionary } from '@framebase/vue'

const { options, getText, exists } = useDictionary('status')
// options: [{ label: '启用', value: 'active' }, { label: '禁用', value: 'disabled' }]
// getText('active') → '启用'
```

### 独立使用 provideDictionaries

```ts
import { provideDictionaries, useDictionary } from '@framebase/vue'

// 父组件
provideDictionaries({ status: { active: '启用' } })

// 子组件
const { getText } = useDictionary('status')
```

## 签名

```ts
function useDictionary(
  name: MaybeRefOrGetter<string>,
  options?: UseDictionaryOptions
): UseDictionaryReturn
function provideDictionaries(
  dictionaries: MaybeRefOrGetter<DictionaryRegistry | undefined>
): Readonly<Ref<DictionaryRegistry>>
```

## 返回值

继承 `useValueEnum` 全部字段，额外：

| 属性        | 类型                                  | 说明          |
| ----------- | ------------------------------------- | ------------- |
| `exists`    | `ComputedRef<boolean>`                | 字典是否命中  |
| `enumValue` | `ComputedRef<ValueEnum \| undefined>` | 解析后的 enum |

## 说明

### 解析顺序

1. 最近一层 `provideDictionaries`（或 `ProConfigProvider.dictionaries`）的注册表
2. `fallback` 选项
3. 未命中时 `exists=false`、`options=[]`

### 嵌套合并

`provideDictionaries` 会与父层注册表合并，当前层同名字典覆盖父层。`ProConfigProvider` 嵌套时同理。

### 响应式 name

`name` 支持 `ref` / getter，切换字典名时 `options` / `getText` 自动重算。

### 与 registerProDictionary 的关系

- `ProConfigProvider.dictionaries` / `provideDictionaries`：树作用域，优先级高
- `registerProDictionary`（pro-components）：全局注册表，app 启动时一次性配置，优先级低

`ProField` 组件会先查树作用域，再回退全局注册表。`useDictionary` 只查树作用域（vue 包不依赖全局注册表）。
