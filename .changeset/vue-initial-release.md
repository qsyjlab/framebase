---
'@framebase/vue': minor
---

首次发布 `@framebase/vue`：内置 `@framebase/core`（不单独发版），作为唯一入口对外提供。

- core：框架无关的纯 TS 工具，包含路径访问（getPathValue/setPathValue/unsetPathValue/normalizePath，支持 bracket notation）与分页数据处理（normalizePagedResponse/paginateData/getRowKey/moveItem）。
- vue：Vue 3 composables，包含：
  - useRequest（防抖/重试/中止/latest-wins）
  - usePagination、usePagedList（分页列表请求，组合 usePagination + useRequest，分页/查询参数变化自动请求）
  - useSelection（跨页保留）、useUrlState（vue-router 同步）
  - provideHookConfig / useHookConfig（hook 级别全局默认配置，支持 request/pagination/pagedList 三组配置，调用方参数优先于全局配置）
- ProConfigProvider 新增 `hooks` 字段，可统一配置 hook 默认值，透传到 @framebase/vue 的 inject/provide 体系。
