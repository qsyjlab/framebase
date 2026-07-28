# 安装

Framebase 由多个独立包组成，按需安装即可。所有包都通过 `peerDependencies` 管理核心依赖，避免与你项目里已有的版本冲突。

## 环境要求

- Node.js 20.19+
- 包管理器：pnpm 10+（推荐）/ npm / yarn
- Vue 3.5+（组件库、`@framebase/vue` 需要）
- Element Plus 2.9+（仅组件库与主题包需要）

## 组件库

安装 Pro 组件库与主题包：

```bash
pnpm add @framebase/element-plus-pro-components @framebase/element-plus-theme
# peerDependencies
pnpm add element-plus @element-plus/icons-vue dayjs lodash-es sortablejs vue
```

> `@framebase/element-plus-pro-components` 的 peer 还包含 `@framebase/core` 与 `@framebase/vue`，npm/pnpm 会自动解析，无需手动安装；如需锁定版本可显式安装。

在应用入口（如 `main.ts`）按顺序引入样式：

```ts
import '@framebase/element-plus-pro-components/style.css'
import '@framebase/element-plus-theme/style.css'
```

> 主题包 `@framebase/element-plus-theme` 是可选的，它为 Element Plus 与 Pro 组件提供了一致的视觉补充（卡片、表格、表单控件、下拉、分页等）。

## 主题包（单独使用）

如果只想使用主题包对 Element Plus 做样式补充，不引入 Pro 组件：

```bash
pnpm add @framebase/element-plus-theme
pnpm add element-plus
```

```ts
import 'element-plus/theme-chalk/index.css'
import '@framebase/element-plus-theme/style.css'
```

## 核心工具 @framebase/core

`@framebase/core` 不依赖任何运行时框架，可被任意 Vue / React / Node 项目使用：

```bash
pnpm add @framebase/core
```

```ts
import { getPathValue, setPathValue, unsetPathValue } from '@framebase/core'

const source = { items: [{ id: 7 }] }
getPathValue(source, 'items[0].id') // 7
```

> 运行时委托 lodash-es 的 `toPath` / `get` / `set` / `unset`，支持 `a[0].b`、`a['name']` 等 bracket notation；类型层 `DataPath<T>` 手写以提供编辑器自动补全。

## 组合式 API @framebase/vue

`@framebase/vue` 在 `@framebase/core` 之上提供 Vue 3 组合式 API，可作为独立 Hook 库使用：

```bash
pnpm add @framebase/vue @framebase/core
pnpm add vue # peer 依赖
# 可选：URL 状态同步需要 vue-router
pnpm add vue-router
```

```ts
import { useRequest, usePagination, useSelection } from '@framebase/vue'
```

## 按需引入

组件库支持具名导入，配合打包工具的 tree-shaking 减小体积：

```ts
import { ProTable, ProForm } from '@framebase/element-plus-pro-components'
```

> 按需引入时仍需引入一次样式：`import '@framebase/element-plus-pro-components/style.css'`。

## 下一步

- [快速上手](/guide/quick-start) —— 跑通第一个示例。
- [组件文档](/components/guide) —— 浏览全部组件。
- [架构说明](/guide/architecture) —— 了解 core / vue / pro-components 的依赖关系。
