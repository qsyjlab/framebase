# 安装

Framebase 由多个独立包组成，按需安装即可。所有包都通过 `peerDependencies` 管理核心依赖，避免与你项目里已有的版本冲突。

## 环境要求

- Node.js 20.19+
- 包管理器：pnpm 10+（推荐）/ npm / yarn
- Vue 3.5+
- Element Plus 2.9+（仅组件库与主题包需要）

## 组件库

安装 Pro 组件库与主题包：

```bash
pnpm add @framebase/element-plus-pro-components @framebase/element-plus-theme
# peerDependencies
pnpm add element-plus @element-plus/icons-vue dayjs lodash-es sortablejs
```

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

## 核心工具（规划中）

`@framebase/core` 提供不依赖 Element Plus 的通用 Hook 与工具，未来可用：

```bash
pnpm add @framebase/core
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
