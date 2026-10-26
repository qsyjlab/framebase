---
'@framebase/element-plus-pro-components': minor
---

新增 `useCrudTable` 业务编排 hook：把查询条件（`params`）、行选中（`selectedKeys` / `selectedRows`）、列定义与增删改查动作收拢到一处，泛型沿 `TRecord` / `TQuery` / `TFormModel` 贯通。内置二次确认、成功提示、并发保护、删除末行自动回上一页、批量删除后清空选中；`tableProps` 可直接 `v-bind` 到 `<ProTable>`，业务侧无需再自行声明 `params` 与选中态。
