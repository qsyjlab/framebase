---
'@framebase/vue': minor
---

首次发布 `@framebase/vue`：内置 `@framebase/core`（不单独发版），作为唯一入口对外提供。

- core：框架无关的纯 TS 工具，包含路径访问（getPathValue/setPathValue/unsetPathValue/normalizePath，支持 bracket notation）与分页数据处理（normalizePagedResponse/paginateData/getRowKey/moveItem）。
- vue：Vue 3 composables，聚焦「中后端业务编排」层，避免与 vueuse 的浏览器/响应式工具层重叠：
  - 请求层：useRequest（防抖/重试/中止/latest-wins）、usePagedList（分页列表请求，组合 usePagination + useRequest，分页/查询参数变化自动请求）、useInfiniteList（无限滚动累积加载）、useCrud（增删改查聚合，写操作成功后自动刷新列表）、useAsyncLock（并发锁原语，按 key 去重）
  - 状态层：usePagination（分页状态，setPageSize 自动重置 current）、useSelection（行选择，跨页保留 + key→record 缓存）、useUrlState（vue-router query 双向同步）
  - 表单层：useFormState（值容器 + 初始快照 + 字段级脏检测 + reset/commit）、useFieldArray（稳定 key 动态字段数组，append/insert/remove/move/replace）、useSubmit（防重入提交态封装，loading/error/success）
  - 表格交互层：useTableSort（单列排序 + 可选 URL 同步）、useTableFilters（筛选状态 + 空数组裁剪 + URL 同步）、useColumnVisibility（列显隐 + localStorage 持久化）
  - 字典层：useValueEnum（ValueEnum Record/Map → options/getText/getItem 响应式转换）、useDictionary/provideDictionaries（树级 provide/inject + 嵌套合并 + fallback）
  - 配置层：provideHookConfig / useHookConfig（hook 级别全局默认配置，调用方参数优先于全局配置）
- ProConfigProvider 新增 `hooks` 字段（统一配置 hook 默认值，透传到 inject/provide 体系）与 `dictionaries` 字段（桥接到 @framebase/vue 的字典 inject 体系，供 useDictionary 读取）。
