# 架构说明

Framebase 采用 pnpm monorepo 组织代码，每个包职责清晰、相互独立，可单独安装使用。

## 包概览

```
@framebase/element-plus-pro-components   ← Pro 组件库
        │
        ├── 依赖 element-plus（peer）
        ├── 依赖 @framebase/element-plus-theme（可选，样式补充）
        └── 未来依赖 @framebase/core（工具与 Hook）

@framebase/element-plus-theme            ← 主题包
        │
        └── 依赖 element-plus（peer，仅样式覆盖）

@framebase/core                          ← 核心工具（规划中）
        │
        └── 零外部依赖（纯 Vue 3 + TS）
```

## 各包职责

### @framebase/element-plus-pro-components

Pro 组件库，封装 Element Plus，提供中后台高频场景的高阶组件。

- **数据展示**：ProCard、ProStatisticCard、ProDescriptions、ProList、ProEmpty、ProResult
- **数据录入**：ProField、ProForm、ProModalForm、ProDrawerForm、ProStepsForm、ProSelect、ProRadioGroup、ProCheckboxGroup、ProCheckCard、ProTree、ProTreeSelect
- **复杂数据**：ProTable、ProEditableTable、ProDragSortTable
- **文件与配置**：ProUpload、ProUploadList、ProPreviewFile、ProConfigProvider

> 详细用法见 [组件文档](/components/guide)。

### @framebase/element-plus-theme

主题包，对 Element Plus 与 Pro 组件做视觉层面的统一补充。

- 卡片、表格、表单控件、下拉、分页等样式微调
- 与 Element Plus 主题变量对齐，支持亮/暗色模式
- 可单独使用，也可配合 Pro 组件库

### @framebase/core（规划中）

核心工具与组合式 API，不依赖 Element Plus。

- 通用 `useXxx` Hook（请求、分页、状态管理等）
- 请求层封装（适配 axios / fetch）
- 类型工具与运行时工具

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
│   ├── element-plus-pro-components/
│   │   ├── src/                       # 源码（按组件分目录）
│   │   ├── __tests__/                 # 单元测试
│   │   └── package.json
│   ├── element-plus-theme/
│   │   ├── src/                       # 样式源码
│   │   └── package.json
│   └── core/                          # 规划中
├── build/
│   └── element-plus-resolver.ts       # 内部构建工具
└── pnpm-workspace.yaml
```

## 依赖关系

各包之间通过 `workspace:*` 引用，发布后转为正常版本号。

- `@framebase/element-plus-pro-components` 的 `peerDependencies` 包含 `element-plus`、`vue` 等，避免与使用方项目里的版本冲突
- `@framebase/element-plus-theme` 是可选依赖，不引入也能运行，只是视觉上缺少补充样式
- `@framebase/core` 设计为零外部依赖，可被任意包引用

## 构建工具

- 组件库与主题包使用 Vite 库模式构建，输出 ESM + 类型声明
- 文档站点基于 VitePress 1.6
- 发版使用 Changesets 管理版本与 CHANGELOG

## 下一步

- [安装](/guide/install) —— 按需安装对应包。
- [贡献与发版](/guide/contributing) —— 了解本地开发与发版流程。
