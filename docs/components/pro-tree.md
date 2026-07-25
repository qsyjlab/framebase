# ProTree 树

基于 ElTree 封装的树组件,内置搜索、远程加载、勾选、加载/错误/空状态。同时提供 `ProTreeSelect` 树选择器,基于 ElTreeSelect,适合在表单中选择层级数据。

## 基础用法

静态数据 + 搜索 + 勾选:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProTree } from '@framebase/element-plus-pro-components'

const checkedKeys = ref<number[]>([])
const data = [
  {
    id: 1,
    label: '部门 A',
    children: [
      { id: 11, label: '小组 A1' },
      { id: 12, label: '小组 A2' }
    ]
  },
  { id: 2, label: '部门 B' }
]
</script>

<template>
  <ProTree
    :data="data"
    node-key="id"
    checkable
    searchable
    default-expand-all
    v-model="checkedKeys"
  />
</template>
```

异步加载 + 字段映射:

```vue
<script setup lang="ts">
import { ProTree } from '@framebase/element-plus-pro-components'

interface Node {
  key: string
  name: string
  sub?: Node[]
}

async function request() {
  const res = await fetch('/api/departments')
  return await res.json()
}
</script>

<template>
  <ProTree
    :request="request"
    :fields="{ key: 'key', label: 'name', children: 'sub' }"
    node-key="key"
    searchable
    default-expand-all
  />
</template>
```

## ProTreeSelect 树选择器

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProTreeSelect } from '@framebase/element-plus-pro-components'

const value = ref<string>()
const data = [
  { id: '1', label: '分类 A', children: [{ id: '1-1', label: '子分类 A1' }] },
  { id: '2', label: '分类 B' }
]
</script>

<template>
  <ProTreeSelect
    v-model="value"
    :data="data"
    node-key="id"
    check-strictly
    placeholder="请选择分类"
  />
</template>
```

## ProTree Props

| 属性              | 说明                                          | 类型                            | 默认值                   |
| ----------------- | --------------------------------------------- | ------------------------------- | ------------------------ |
| data              | 静态树数据                                    | `TNode[]`                       | `[]`                     |
| fields            | 字段映射 `{ key, label, children, disabled }` | `Partial<ProTreeFields>`        | —                        |
| nodeKey           | 节点唯一标识字段名                            | `string`                        | `'id'`                   |
| modelValue        | 勾选的 key 列表(配合 `checkable`)             | `TreeKey[]`                     | `[]`                     |
| currentKey        | 当前高亮节点 key                              | `TreeKey`                       | —                        |
| checkable         | 是否显示勾选框                                | `boolean`                       | `false`                  |
| searchable        | 是否显示搜索框                                | `boolean`                       | `false`                  |
| searchPlaceholder | 搜索框占位符                                  | `string`                        | `'搜索节点'`             |
| defaultExpandAll  | 是否默认展开全部                              | `boolean`                       | `false`                  |
| expandOnClickNode | 是否点击节点切换展开                          | `boolean`                       | `true`                   |
| lazy              | 是否懒加载                                    | `boolean`                       | `false`                  |
| load              | 懒加载回调                                    | `(node, resolve) => void`       | —                        |
| filter            | 自定义搜索过滤函数                            | `(keyword, data) => boolean`    | —                        |
| loading           | 外部加载状态                                  | `boolean`                       | —                        |
| request           | 异步加载整棵树                                | `(context) => Promise<TNode[]>` | —                        |
| requestDebounce   | 请求防抖毫秒数                                | `number`                        | —                        |
| requestRetry      | 请求失败重试次数                              | `number`                        | —                        |
| emptyText         | 空数据文案                                    | `string`                        | `'当前没有可展示的节点'` |
| errorText         | 错误文案,可传入函数动态生成                   | `string \| ((error) => string)` | —                        |
| retryText         | 重试按钮文案                                  | `string`                        | `'重新加载'`             |

## ProTree 事件

| 事件名               | 说明             | 回调参数          |
| -------------------- | ---------------- | ----------------- |
| update:model-value   | 勾选变化         | `keys: TreeKey[]` |
| update:current-key   | 当前节点变化     | `key`             |
| check                | 勾选变化         | `nodes, keys`     |
| select               | 选中节点         | `data, key`       |
| request-success      | 请求成功         | `data`            |
| request-state-change | 请求生命周期变化 | `lifecycle`       |
| request-error        | 请求失败         | `error`           |

## ProTreeSelect Props

| 属性          | 说明                              | 类型                                   | 默认值  |
| ------------- | --------------------------------- | -------------------------------------- | ------- |
| modelValue    | 选中值,单选为 key,多选为 key 数组 | `TreeKey \| TreeKey[]`                 | —       |
| data          | 静态树数据                        | `TNode[]`                              | `[]`    |
| cacheData     | 缓存数据(用于回显未加载的节点)    | `TNode[]`                              | `[]`    |
| fields        | 字段映射                          | `Partial<ProTreeFields>`               | —       |
| nodeKey       | 节点 key 字段                     | `string`                               | `'id'`  |
| multiple      | 是否多选                          | `boolean`                              | `false` |
| checkStrictly | 父子节点是否不关联                | `boolean`                              | `false` |
| lazy          | 是否懒加载                        | `boolean`                              | `false` |
| load          | 懒加载回调                        | `(node, resolve) => void`              | —       |
| loading       | 外部加载状态                      | `boolean`                              | —       |
| request       | 异步加载整棵树                    | `(context) => Promise<TNode[]>`        | —       |
| pathRequest   | 根据 value 异步加载回显路径       | `(value, context) => Promise<TNode[]>` | —       |

## 方法

ProTree 实例方法:`reload()`、`filter(keyword)`、`getCheckedKeys()`、`getCheckedNodes()`、`setCheckedKeys(keys)`、`getCurrentKey()`、`setCurrentKey(key)`、`expandAll()`、`collapseAll()`。

ProTreeSelect 实例方法:`reload()`、`reloadPath()`、`getData()`、`getCacheData()`。
