---
'@framebase/element-plus-pro-components': minor
---

新增 `ProPageContainer` 页面容器；扩展 `useProForm` 的查询参数管理能力；为 `useProTable` 增加可直接消费的响应式状态，并保留 1.1.x getter 作为兼容 API；修复 `ProTable` 在 KeepAlive 页面重新激活后自适应高度无法恢复的问题；`ProTable` 勾选列与序号列默认 `fixed: 'left'`（可通过 `rowSelection.fixed` / `indexBorder.fixed` 显式覆盖）。
