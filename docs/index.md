---
layout: home

hero:
  name: Framebase
  text: Vue 3 中后台前端基础设施
  tagline: 多包 monorepo，覆盖 Pro 组件、主题与核心工具，按需组合使用
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/intro
    - theme: alt
      text: 架构说明
      link: /guide/architecture

features:
  - icon: 🧩
    title: Pro 组件库
    details: 基于 Element Plus 的高阶组件，覆盖表单、表格、选择、文件上传等中后台高频场景，Schema 驱动、请求驱动。
    link: /components/guide
  - icon: 🎨
    title: 主题包
    details: 对 Element Plus 与 Pro 组件做统一视觉补充，支持亮/暗色模式，可单独使用。
  - icon: 📦
    title: 多包架构
    details: pnpm monorepo，组件、主题、核心工具各自独立，按需安装，互不耦合。
    link: /guide/architecture
  - icon: 🔧
    title: 核心工具
    details: '@framebase/core 提供框架无关的路径与分页工具，@framebase/vue 在其之上构建 useRequest / usePagination / useSelection / useUrlState 等组合式 API。'
    link: /guide/architecture
  - icon: 📊
    title: ProTable 请求驱动表格
    details: 基于 request 函数自动管理分页、加载态、刷新、密度与列设置，内置选择与可编辑能力。
    link: /components/pro-table
  - icon: 📝
    title: ProForm Schema 表单
    details: 通过 Schema 声明字段与联动，内置常用控件与校验，告别繁琐模板代码。
    link: /components/pro-form
---
