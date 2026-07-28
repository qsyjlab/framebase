---
'@framebase/core': minor
'@framebase/vue': minor
---

首次发布 `@framebase/core` 与 `@framebase/vue`：

- core：框架无关的纯 TS 工具，包含路径访问（getPathValue/setPathValue/unsetPathValue/normalizePath，支持 bracket notation）与分页数据处理（normalizePagedResponse/paginateData/getRowKey/moveItem）。
- vue：Vue 3 composables，包含 useRequest（防抖/重试/中止/latest-wins）、usePagination、useSelection（跨页保留）、useUrlState（vue-router 同步）。
