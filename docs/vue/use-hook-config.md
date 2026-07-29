# useHookConfig / provideHookConfig

Hook 级别的全局默认配置。在组件树顶层注入一次，所有 `useRequest` / `usePagination` / `usePagedList` 自动应用默认值，调用方显式传入的参数优先级更高。

## 用法

### 基础用法

```ts
import { provideHookConfig } from '@framebase/vue'
import { ref } from 'vue'

// 在根组件 setup 中注入
const defaultPageSize = ref(20)

provideHookConfig({
  request: {
    debounce: 300,
    retry: 2,
    retryDelay: 500
  },
  pagination: {
    defaultCurrent: 1,
    defaultPageSize: 20
  },
  pagedList: {
    immediate: true,
    debounce: 200
  }
})

// 后代组件中的 hook 自动应用这些默认值
// usePagination() → pageSize 初始为 20
// useRequest({ retry: 1 }) → debounce 用全局的 300，retry 用调用方传入的 1
```

### 响应式配置

`provideHookConfig` 接受响应式 getter，配置变化时所有 hook 自动更新。

```ts
import { provideHookConfig } from '@framebase/vue'
import { ref } from 'vue'

const retryCount = ref(2)
provideHookConfig(() => ({
  request: { retry: retryCount.value }
}))

// 运行时修改
retryCount.value = 5
```

### 嵌套层级

多层 `provideHookConfig` 会深度合并，当前层覆盖父级同名字段。

```ts
// 根组件
provideHookConfig({
  request: { debounce: 100, retry: 1 },
  pagination: { defaultPageSize: 20 }
})

// 子组件
provideHookConfig({
  request: { debounce: 300 } // 只覆盖 debounce，retry 保留父级的 1
})

// 孙子组件中读取
const config = useHookConfig()
config.value.request.debounce // 300（当前层覆盖）
config.value.request.retry // 1（父级保留）
config.value.pagination.defaultPageSize // 20（父级保留）
```

### 配合 ProConfigProvider

通常不需要直接调用 `provideHookConfig`，使用 `ProConfigProvider` 的 `hooks` 字段即可：

```vue
<template>
  <ProConfigProvider :hooks="{ request: { retry: 2 }, pagination: { defaultPageSize: 20 } }">
    <App />
  </ProConfigProvider>
</template>
```

`ProConfigProvider` 内部会调用 `provideHookConfig` 透传到 `@framebase/vue` 的 inject/provide 体系。

## 签名

```ts
function provideHookConfig(config: MaybeRefOrGetter<HookConfig>): Readonly<Ref<HookConfig>>
function useHookConfig(): Readonly<Ref<HookConfig>>
```

## 参数

### HookConfig

| 属性         | 类型                   | 说明                 |
| ------------ | ---------------------- | -------------------- |
| `request`    | `HookRequestConfig`    | 请求相关默认配置     |
| `pagination` | `HookPaginationConfig` | 分页相关默认配置     |
| `pagedList`  | `HookPagedListConfig`  | 分页列表请求默认配置 |

### HookRequestConfig

作用于 `useRequest` 与 `usePagedList` 的内部 `useRequest`。

| 属性         | 类型                                     | 说明               |
| ------------ | ---------------------------------------- | ------------------ |
| `debounce`   | `number`                                 | 默认防抖时间（ms） |
| `retry`      | `number`                                 | 默认重试次数       |
| `retryDelay` | `number \| ((attempt, error) => number)` | 默认重试间隔（ms） |

### HookPaginationConfig

作用于 `usePagination` 与 `usePagedList`。

| 属性              | 类型     | 默认值 | 说明         |
| ----------------- | -------- | ------ | ------------ |
| `defaultCurrent`  | `number` | `1`    | 默认初始页码 |
| `defaultPageSize` | `number` | `10`   | 默认每页条数 |

### HookPagedListConfig

作用于 `usePagedList`。

| 属性        | 类型      | 默认值 | 说明                                        |
| ----------- | --------- | ------ | ------------------------------------------- |
| `immediate` | `boolean` | `true` | 是否挂载时自动发起首次请求                  |
| `debounce`  | `number`  | -      | 默认防抖时间（ms），覆盖 `request.debounce` |

## 返回值

`useHookConfig` 返回 `Readonly<Ref<HookConfig>>`，无上层 provide 时回退到内置默认值：

```ts
{
  pagination: { defaultCurrent: 1, defaultPageSize: 10 },
  pagedList: { immediate: true }
}
```

## 优先级

调用方显式参数 > 最近一层 `provideHookConfig` > 根级默认值

```ts
// 全局配了 retry: 2
provideHookConfig({ request: { retry: 2 } })

// 调用方显式传 retry: 1 → 用 1
useRequest({ retry: 1 })

// 调用方不传 retry → 用全局的 2
useRequest()
```

## 类型声明

```ts
interface HookConfig {
  request?: HookRequestConfig
  pagination?: HookPaginationConfig
  pagedList?: HookPagedListConfig
}

interface HookRequestConfig {
  debounce?: number
  retry?: number
  retryDelay?: number | ((attempt: number, error: unknown) => number)
}

interface HookPaginationConfig {
  defaultCurrent?: number
  defaultPageSize?: number
}

interface HookPagedListConfig {
  immediate?: boolean
  debounce?: number
}
```

## 说明

### resolveHookOption

合并工具函数，hook 内部用于合并调用方参数与全局配置。

```ts
function resolveHookOption<T>(local: T | undefined, config: T | undefined): T | undefined
```

- `local` 为 `undefined` 时回退到 `config`
- `local` 为任意非 `undefined` 值（包括 `0` / `false` / `''`）都视为显式传入，优先于 `config`

### Vue 组件树层级

`provideHookConfig` 基于 Vue 的 `provide`/`inject`，层级机制只在 Vue 组件树内生效。非 Vue 环境或无 provide 上下文时（如测试环境），`useHookConfig` 回退到内置默认值。
