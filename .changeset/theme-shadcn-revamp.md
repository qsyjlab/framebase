---
'@framebase/element-plus-theme': minor
---

主题重构为 shadcn/ui 风格：主色 #2563eb、4 档阴影、大圆角（radius-lg 12px）、状态色双值（bg/fg）。
修复 Element Plus 组件运行时注入的 `:root` 变量覆盖主题的问题（改用 `html:root` 提升特异性）。
表格 cell padding 改用 `--el-table-cell-padding` 变量同步列宽计算；输入框聚焦改为仅增强原生 inset 边框，移除多余外层 ring。
