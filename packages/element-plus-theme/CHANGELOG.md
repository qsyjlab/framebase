# @framebase/element-plus-theme

## 0.2.0

### Minor Changes

- ## ProLightFilter（新增）

  新增轻量筛选组件 `ProLightFilter`：紧凑内联筛选条，字段类型复用 ProField valueType，支持四种边框风格（outlined/borderless/filled/underlined）与三档尺寸。

  - 即时型字段（select/cascader/date 等）选中即提交并自动关闭 popover，无 footer
  - 延迟型字段（text/number 等）维护临时值，popover 底部显示「清除/确认」footer，点确认才提交
  - `field.instant` 可显式覆盖默认提交行为
  - `#field` / `#field-{valueType}` / `#footer` 插槽支持自定义控件与底部按钮
  - `field.popoverWidth` 自定义 popover 宽度，默认按 valueType 推断
  - `collapsedCount` 控制默认显示字段数，超出收进「更多筛选」
  - `borderStyle` / `size` 控制视觉风格

  ## ProTable 工具栏图标

  - 刷新/密度/列设置三个工具栏按钮图标由 Element Plus 图标改为内联 SVG（照抄 Ant Design Icons），不再依赖 @element-plus/icons-vue
  - 列设置面板：拖拽柄 + 固定列首/列尾按钮同步改为内联 SVG
  - 行拖拽柄图标同步替换
  - 列头 tip 图标 cursor 由 `help` 改为 `pointer`

  ## 主题包（element-plus-theme）

  - 新增 `drawer.scss`：`--el-drawer-padding-primary` 默认对齐 dialog（`var(--el-dialog-padding-primary, 0px)`）
  - `select.scss`：`.el-select` 默认 `width: 100%`（分页器内 select 排除，保持 `width: auto`）
  - `table.scss`：表格外 border 圆角改为 `0`（直角）

  ## 工程化

  - 各包新增 `dev` watch 脚本（core/vue/pro-components 用 `vite build --watch`，theme 用 `sass --watch`），根 `dev` 脚本用 concurrently 并行启动 watch + playground
  - 修复 `tsconfig.json` 中 `ignoreDeprecations: "6.0"` 在 TS 5.x 下非法的问题

- 9bcd0bb: 新增 ProException（403/404/500 状态页）与 ProErrorBoundary（运行时错误边界，基于 onErrorCaptured，支持 fallback/resetKeys）。
  ProForm 增加 field 级 effects/watch DSL 与全局字典注册；ProConfigProvider 支持全局分页默认值；ProTable 修复 selection-change 重复触发与编辑态 cacheSelectedData 更新问题。
  路径工具与 composables 上提至 @framebase/core 与 @framebase/vue，Pro 组件改为 peer 依赖。
- 9bcd0bb: 主题重构为 shadcn/ui 风格：主色 #2563eb、4 档阴影、大圆角（radius-lg 12px）、状态色双值（bg/fg）。
  修复 Element Plus 组件运行时注入的 `:root` 变量覆盖主题的问题（改用 `html:root` 提升特异性）。
  表格 cell padding 改用 `--el-table-cell-padding` 变量同步列宽计算；输入框聚焦改为仅增强原生 inset 边框，移除多余外层 ring。

## 0.1.1

### Patch Changes

- 5c133b2: 补齐组件构建产物所需的 Element Plus 样式，并确保自动解析的组件统一使用同一个 Element Plus 运行时入口。

  修复表单容器组件中的模板 ref 绑定冲突和模型递归更新问题。

  仅当表单字段本身超过配置的折叠行数时显示展开和收起操作。

  确保 Element Plus 组件样式异步加载后不会覆盖 Framebase 主题令牌。

  新增偏 Ant Design 风格的 Element Plus 表格主题，支持亮色、暗色语义令牌和多档密度间距。

  调整 Playground，使其直接消费组件包和主题包的构建产物，无需全局安装 Element Plus 或引入完整样式。

  新增 `ProFormSchema` 数组类型；表单展开操作默认仅在 inline 模式下显示并支持独立控制；统一提交区域的按钮间距。

  移除重复的 `ProTableSearch`、`ProTableWithSearch` 和 `ProQueryFilter` 公共 API，统一使用 `ProForm` 与 `ProTable` 直接组合。

  支持使用完整的 Element Plus 主色色阶覆盖主题，并恢复表格表头的原始样式。
