# 简介

Framebase 是一个面向中后台的 Vue 3 前端基础设施集合，以 pnpm monorepo 组织代码。它把多个独立可用的包组合在一起，覆盖从组件、主题到未来的核心工具（core）等不同层面的需求。

## 它包含什么

Framebase 不是一个单一的组件库，而是由多个职责清晰的包组成：

| 包                                       | 说明                                                                            | 状态   |
| ---------------------------------------- | ------------------------------------------------------------------------------- | ------ |
| `@framebase/element-plus-pro-components` | 基于 Element Plus 的 Pro 组件库，覆盖表单、表格、选择、文件上传等中后台高频场景 | 可用   |
| `@framebase/element-plus-theme`          | 主题包，对 Element Plus 样式做统一补充与覆盖                                    | 可用   |
| `@framebase/core`                        | 核心工具与组合式 API（useXxx、请求封装、状态管理等）                            | 规划中 |
| 其他                                     | 按需扩展的工具包、脚手架等                                                      | 规划中 |

> 不同包相互独立，可以单独安装使用；也可以组合使用获得完整能力。

## 设计理念

- **按职责分包**：组件、主题、核心工具各自独立，避免一个包承担过多职责。
- **Schema 驱动**：组件库以结构化配置声明字段与列，而非手写大量模板。
- **请求驱动**：表格以 `request` 函数为入口，自动接管分页、加载态、刷新。
- **可组合可扩展**：每个组件都提供 `useXxx` Hook 与上下文，支持深度定制。
- **类型完备**：全量 TypeScript，支持泛型推导，IDE 体验友好。

## 技术栈

- Vue 3.5+（`<script setup>`、组合式 API）
- Element Plus 2.9+（组件库的底层依赖）
- TypeScript 5.8+
- Vite 构建
- pnpm workspace 管理 monorepo

## Monorepo 结构

```
framebase/
├── docs/                              # 本文档站点（VitePress）
├── apps/
│   └── playground/                    # 在线示例与调试
├── packages/
│   ├── element-plus-pro-components/   # Pro 组件库
│   ├── element-plus-theme/            # 主题包
│   └── core/                          # 核心工具（规划中）
├── build/                             # 内部构建工具
└── pnpm-workspace.yaml
```

## 下一步

- [架构说明](/guide/architecture) —— 了解各包职责与依赖关系。
- [安装](/guide/install) —— 按需安装对应包。
- [快速上手](/guide/quick-start) —— 几分钟跑通第一个示例。
- [组件文档](/components/guide) —— 浏览 Pro 组件库。
