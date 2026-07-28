# 架构说明

Framebase 采用 pnpm monorepo 组织代码，每个包职责清晰、相互独立，可单独安装使用。

## 包概览

```
@framebase/element-plus-pro-components   ← Pro 组件库
        │
        ├── peerDependencies: element-plus / vue / dayjs / lodash-es / sortablejs
        ├── peerDependencies: @framebase/core / @framebase/vue
        └── 可选搭配 @framebase/element-plus-theme（视觉补充）

@framebase/element-plus-theme            ← 主题包
        │
        └── peerDependencies: element-plus（仅样式覆盖）

@framebase/vue                           ← Vue 3 组合式 API
        │
        ├── dependencies: @framebase/core
        └── peerDependencies: vue

@framebase/core                          ← 框架无关工具
        │
        └── dependencies: lodash-es（路径工具运行时）
```

## 各包职责

### @framebase/element-plus-pro-components

Pro 组件库，封装 Element Plus，提供中后台高频场景的高阶组件。

- **数据展示**：ProCard、ProStatisticCard、ProDescriptions、ProList、ProEmpty、ProResult、ProException、ProErrorBoundary、ProStatus、ProBadge
- **操作反馈**：ProAsyncButton、ProConfirmButton
- **数据录入**：ProField、ProForm、ProModalForm、ProDrawerForm、ProStepsForm、ProSelect、ProRadioGroup、ProCheckboxGroup、ProCheckCard、ProTree、ProTreeSelect
- **复杂数据**：ProTable、ProEditableTable、ProDragSortTable
- **文件与配置**：ProUpload、ProUploadList、ProPreviewFile、ProConfigProvider

> 详细用法见 [组件文档](/components/guide)。

### @framebase/element-plus-theme

主题包，对 Element Plus 原生组件做视觉层面的统一补充。

- 卡片、表格、表单控件、下拉、分页等样式微调
- 与 Element Plus 主题变量对齐，支持亮/暗色模式
- 可单独使用，也可配合 Pro 组件库

> Pro 组件自带 scoped 样式，主题包只负责覆盖 `.el-xxx` 原生组件，不会与 Pro 组件层重复或冲突。

### @framebase/core

框架无关的纯 TypeScript 工具，不依赖 Vue / React 等任何运行时框架。

- **路径工具**：`getPathValue` / `setPathValue` / `unsetPathValue` / `normalizePath`，运行时委托 lodash-es 的 `toPath` / `get` / `set` / `unset`，支持 `a[0].b` / `a['name']` 等 bracket notation
- **路径类型**：`DataPath<T>` / `DataIndex<T>` / `LiteralUnion<T>` 手写类型层，为编辑器提供自动补全与错误校验
- **分页工具**：`normalizePagedResponse` / `paginateData` / `getRowKey` / `moveItem`，以及 `PageInfo` / `PagedResponse` 共享类型
- 同时导出 `Pro` 前缀别名（`getProPathValue` 等），兼容 Pro 组件历史调用

### @framebase/vue

Vue 3 组合式 API，基于 `@framebase/core` 提供响应式封装。

- `useRequest` / `useProRequest` —— 可中止的异步状态，支持防抖、重试、最新请求胜出
- `usePagination` / `useProPagination` —— 响应式分页状态容器
- `useSelection` / `useProSelection` —— 行选择状态，可选跨页保留
- `useUrlState` / `useProUrlState` —— URL query 状态同步（可选 `vue-router`）

## 目录结构

```
framebase/
├── docs/                              # 文档站点（VitePress）
│   ├── guide/                         # 整体指南（架构、安装、贡献等）
│   ├── components/                    # 组件库文档
│   ├── examples/                      # 示例代码
│   └── .vitepress/
├── apps/
│   └── playground/                    # 在线示例与调试
├── packages/
│   ├── core/                          # 框架无关工具（路径 / 分页）
│   │   ├── src/
│   │   │   ├── path/                  # 路径工具（委托 lodash-es）
│   │   │   └── data/                  # 分页工具与类型
│   │   └── package.json
│   ├── vue/                           # Vue 3 组合式 API
│   │   ├── src/
│   │   │   ├── request/
│   │   │   ├── pagination/
│   │   │   ├── selection/
│   │   │   └── url-state/
│   │   └── package.json
│   ├── element-plus-pro-components/
│   │   ├── src/                       # 源码（按组件分目录）
│   │   └── package.json
│   └── element-plus-theme/
│       ├── src/                       # 样式源码
│       └── package.json
├── build/
│   └── element-plus-resolver.ts       # 内部构建工具
└── pnpm-workspace.yaml
```

## 依赖关系

各包之间通过 `workspace:*` 引用，发布后转为正常版本号。

- `@framebase/core` 运行时依赖 lodash-es，类型层完全手写，无任何框架依赖
- `@framebase/vue` 依赖 `@framebase/core`，peer 依赖 `vue`，`vue-router` 为可选 peer
- `@framebase/element-plus-pro-components` 的 `peerDependencies` 包含 `@framebase/core` / `@framebase/vue` / `element-plus` / `vue` / `dayjs` / `lodash-es` / `sortablejs`，避免与使用方项目里的版本冲突
- `@framebase/element-plus-theme` 是可选依赖，不引入也能运行，只是视觉上缺少补充样式

## 构建工具

- 各包使用 Vite 库模式构建，输出 ESM + 类型声明
- `@framebase/core` 与 `@framebase/vue` 通过 `vue-tsc` 生成 `.d.ts`
- 文档站点基于 VitePress 1.6
- 发版使用 Changesets 管理版本与 CHANGELOG

## 下一步

- [安装](/guide/install) —— 按需安装对应包。
- [贡献与发版](/guide/contributing) —— 了解本地开发与发版流程。
