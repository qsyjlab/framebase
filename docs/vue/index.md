# @framebase/vue

在 [`@framebase/core`](../core/) 之上提供 Vue 3 组合式 API，封装请求生命周期、分页、选择、URL 状态同步等高频场景。

可单独作为 Hook 库使用，也是 `@framebase/element-plus-pro-components` 内部 ProTable / ProList / ProForm 等组件的响应式底座。

## 安装

```bash
pnpm add @framebase/vue @framebase/core
pnpm add vue # peer 依赖
# 可选：URL 状态同步需要 vue-router
pnpm add vue-router
```

## Hook 总览

### 请求

- [useRequest](./use-request) —— 可中止的异步状态，支持防抖、重试、最新请求胜出

### 状态

- [usePagination](./use-pagination) —— 响应式分页状态容器
- [useSelection](./use-selection) —— 行选择状态，可选跨页保留
- [useUrlState](./use-url-state) —— URL query 与响应式状态的双向同步

## Pro 前缀别名

`@framebase/vue` 同时导出 `Pro` 前缀别名，供 `@framebase/element-plus-pro-components` 内部使用：`useProRequest` / `useProPagination` / `useProSelection` / `useProUrlState`。

业务侧一般直接使用无前缀版本。

## 设计说明

### 为什么拆出独立包

- `@framebase/core` 保持框架无关，可被 React / Node 项目复用
- Vue 响应式相关（`ref` / `computed` / `watch`）独立到 `@framebase/vue`，避免把 Vue 拖进非 Vue 项目
- Pro 组件库通过 `peerDependencies` 声明对 `@framebase/core` 与 `@framebase/vue` 的依赖，用户安装时 npm/pnpm 会自动解析

### 与 Pro 组件的关系

ProTable / ProList 的 `request` / `pagination` / `selection` / URL 持久化能力都构建在这四个 Hook 之上。直接使用这些 Hook 可以在非 Pro 组件场景获得相同能力，例如自定义列表、自定义表单等。
