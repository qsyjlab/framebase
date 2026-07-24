# @framebase/element-plus-theme

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
