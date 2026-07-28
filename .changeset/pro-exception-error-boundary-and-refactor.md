---
'@framebase/element-plus-pro-components': minor
'@framebase/element-plus-theme': minor
---

新增 ProException（403/404/500 状态页）与 ProErrorBoundary（运行时错误边界，基于 onErrorCaptured，支持 fallback/resetKeys）。
ProForm 增加 field 级 effects/watch DSL 与全局字典注册；ProConfigProvider 支持全局分页默认值；ProTable 修复 selection-change 重复触发与编辑态 cacheSelectedData 更新问题。
路径工具与 composables 上提至 @framebase/core 与 @framebase/vue，Pro 组件改为 peer 依赖。
