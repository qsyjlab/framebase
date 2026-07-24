# @framebase/element-plus-theme

面向 Element Plus 2.9+ 的可选视觉主题包，提供统一的颜色、文字、圆角、阴影和常用组件样式。

## 完整使用

```ts
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@framebase/element-plus-theme/style.css'
```

`style.css` 已包含亮色令牌、暗色令牌和组件美化。暗色模式沿用 Element Plus 的 `html.dark` 标记。

表格保留 Element Plus 默认表头，正文使用弱分隔线、柔和悬浮与选中态，并为 `large`、`default`、`small` 三种密度提供递进的行高。

## 按层使用

```ts
import '@framebase/element-plus-theme/tokens.css'
import '@framebase/element-plus-theme/dark.css'
import '@framebase/element-plus-theme/components.css'
```

业务可在主题包之后覆盖 `--framebase-*` 变量，不需要直接修改组件选择器。

## 覆盖品牌色

全局覆盖样式需要放在主题包之后，并使用 `html:root` 保证优先级。可以直接覆盖 Element Plus 的完整色阶：

```css
html:root {
  --el-color-primary: #165bbc;
  --el-color-primary-rgb: 22, 91, 188;
  --el-color-primary-dark-2: #124996;
  --el-color-primary-light-1: #2d6bc3;
  --el-color-primary-light-2: #457cc9;
  --el-color-primary-light-3: #5c8cd0;
  --el-color-primary-light-4: #739dd7;
  --el-color-primary-light-5: #8badde;
  --el-color-primary-light-6: #a2bde4;
  --el-color-primary-light-7: #b9ceeb;
  --el-color-primary-light-8: #d0def2;
  --el-color-primary-light-9: #e8eff8;
}
```

局部主题可将同一组变量传给 `ProConfigProvider` 的 `theme.variables`。布局专属的 `--layout-dark-menu-background` 应继续由应用自身维护，不属于通用 Element Plus 主题。

## 边界

- 只包含通用 Element Plus 视觉规则。
- 不包含后台 Layout、侧边栏、顶部导航等应用专用样式。
- 不自动引入 Element Plus 组件 CSS。
