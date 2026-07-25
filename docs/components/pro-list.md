# ProList 列表

请求驱动的列表组件,内置分页、选择、网格布局、加载骨架屏、错误重试与空状态。支持静态 `data` 与 `request` 异步加载两种数据源,可使用 `itemMeta` 快速配置每项的标题、描述、头像与内容,也可通过插槽完全自定义渲染。

## 基础用法

静态数据 + 分页:

```vue
<script setup lang="ts">
import { ProList } from '@framebase/element-plus-pro-components'

interface Record {
  id: number
  name: string
  email: string
  avatar: string
}

const data: Record[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: 'https://i.pravatar.cc/80?img=1' },
  { id: 2, name: '李四', email: 'lisi@example.com', avatar: 'https://i.pravatar.cc/80?img=2' }
]
</script>

<template>
  <ProList
    :data="data"
    row-key="id"
    :item-meta="{
      title: 'name',
      description: 'email',
      avatar: 'avatar'
    }"
  />
</template>
```

异步请求 + 网格布局:

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { ProList } from '@framebase/element-plus-pro-components'

interface Record {
  id: number
  name: string
  price: number
}
interface Query {
  keyword?: string
}

const params = reactive<Query>({ keyword: '' })

async function request(query: Query & { current: number; pageSize: number }) {
  const res = await fetch(
    `/api/products?keyword=${query.keyword ?? ''}&page=${query.current}&size=${query.pageSize}`
  )
  const json = await res.json()
  return { data: json.list, total: json.total }
}
</script>

<template>
  <ProList
    :request="request"
    :params="params"
    row-key="id"
    layout="grid"
    :grid-columns="{ xs: 1, sm: 2, xl: 3 }"
    selectable
    :page-size="10"
  >
    <template #actions="{ record }">
      <el-button link type="primary">查看</el-button>
    </template>
  </ProList>
</template>
```

## Props

| 属性             | 说明                                                  | 类型                                            | 默认值                    |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------- | ------------------------- |
| data             | 静态数据,与 `request` 二选一                          | `TRecord[]`                                     | `[]`                      |
| request          | 异步请求函数,接收分页与 params,返回 `{ data, total }` | `(params, context) => Promise<{ data, total }>` | —                         |
| params           | 请求参数,与 `request` 配合使用,变化会自动重载         | `object`                                        | `{}`                      |
| responseAdapter  | 自定义响应数据适配                                    | `(response) => { data, total }`                 | —                         |
| transformParams  | 请求参数预处理                                        | `(params) => params`                            | —                         |
| autoRequest      | 是否在挂载或参数变化时自动发起请求                    | `boolean`                                       | `true`                    |
| requestDebounce  | 请求防抖毫秒数                                        | `number`                                        | —                         |
| requestRetry     | 请求失败重试次数                                      | `number`                                        | —                         |
| loading          | 外部加载状态                                          | `boolean`                                       | —                         |
| pagination       | 分页配置,`false` 关闭                                 | `boolean \| ProListPagination`                  | `true`                    |
| rowKey           | 行唯一标识字段或函数                                  | `string \| ((record) => string \| number)`      | `'id'`                    |
| itemMeta         | 项元信息配置:标题、描述、头像、内容                   | `ProListItemMeta`                               | `{}`                      |
| layout           | 布局方式,`list` 纵向 / `grid` 网格                    | `'list' \| 'grid'`                              | `'list'`                  |
| gridColumns      | 网格列数响应式配置                                    | `ProCardResponsiveColumns`                      | `{ xs: 1, md: 2, xl: 3 }` |
| gap              | 网格间距,数字按 px 处理                               | `number \| string`                              | `16`                      |
| size             | 尺寸                                                  | `'large' \| 'default' \| 'small'`               | —                         |
| bordered         | 是否显示边框                                          | `boolean`                                       | `true`                    |
| split            | 列表模式下是否使用连续分割样式                        | `boolean`                                       | `true`                    |
| selectable       | 是否显示选择框                                        | `boolean`                                       | `false`                   |
| selectedKeys     | 受控选中项 key 列表                                   | `Array<string \| number>`                       | `[]`                      |
| reserveSelection | 翻页时是否保留选中项                                  | `boolean`                                       | `false`                   |
| emptyText        | 空数据文案                                            | `string`                                        | `'暂无列表数据'`          |
| errorText        | 错误文案,可传入函数动态生成                           | `string \| ((error) => string)`                 | —                         |
| retryText        | 重试按钮文案                                          | `string`                                        | `'重新加载'`              |

## 事件

| 事件名               | 说明               | 回调参数                          |
| -------------------- | ------------------ | --------------------------------- |
| update:selectedKeys  | 选中项变化         | `keys: Array<string \| number>`   |
| selection-change     | 选中记录变化       | `records: TRecord[]`              |
| page-change          | 页码或每页条数变化 | `current, pageSize`               |
| pagination-change    | 分页信息变化       | `pageInfo: { current, pageSize }` |
| loading-change       | 加载状态变化       | `loading: boolean`                |
| request-state-change | 请求生命周期变化   | `lifecycle`                       |
| request-error        | 请求失败           | `error`                           |

## 插槽

| 插槽名      | 说明                                              |
| ----------- | ------------------------------------------------- |
| item        | 自定义整项渲染,接收 `{ record, index, selected }` |
| title       | 自定义标题                                        |
| description | 自定义描述                                        |
| content     | 自定义内容                                        |
| actions     | 自定义操作区                                      |
| loading     | 自定义加载骨架                                    |
| empty       | 自定义空数据                                      |
| error       | 自定义错误提示                                    |

## 方法

通过 ref 可获取实例方法:`reload(resetPage?)`、`refresh()`、`getData()`、`getTotal()`、`getPageInfo()`、`setPageInfo(info, reload?)`、`getSelectedKeys()`、`getSelectedRows()`、`clearSelection()`。
