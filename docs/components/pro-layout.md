# ProLayout 布局

`ProLayout` 从 vite-admin-vue basic-layout 提取布局结构、导航样式与交互，封装为可复用的后台壳：
侧边栏 / 顶部 / 顶部分割 / 侧边混合四种导航模式，内置菜单、面包屑、标签页、通知 / 全屏 / 主题 / 用户菜单、
布局设置抽屉；布局状态由独立的 `ProLayoutStore` 管理，可通过 `store` prop 在多个 `<ProLayout>`
实例间显式共享。

## 基础用法

最简方式：传 `menus` / `tabs` / `breadcrumbs` 即可。所有尺寸、主题、显隐状态都由内部 store 管理。

::::demo 通过 store prop 共享状态
pro-layout/basic
::::

### 受控 vs 非受控

`ProLayout` 同时支持 **受控**（`v-model:*`）和 **非受控**（默认走 store）两种模式：

| 属性                                                                                                               | 受控方式                | 默认来源                    |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------- | --------------------------- |
| `collapsed / layoutMode / theme / sidebarTheme / headerTheme / themeColor / darkMenuBackground / sideMixFixedMenu` | `v-model:*`             | 内部 store                  |
| `asideWidth / headerHeight / tabHeight / footerHeight`                                                             | 同上                    | 内部 store                  |
| `showBreadcrumb / showTabs / showFooter / splitMenu / showEmptySplitSidebar`                                       | 同上                    | 内部 store                  |
| `activeKey / activeTabKey`                                                                                         | `v-model:active-key` 等 | 组件本地 state（emit 事件） |

> 受控 prop 改变会同步到 store；store 变化时也会反向 emit `update:*`。`store.setSetting` 内置 no-op
> 检查，因此双向绑定不会出现循环。

## Store（关键）

`ProLayout` **不使用库级全局单例**。读取优先级为 `store` prop → 最近注入的项目 store → 内部创建。
项目可以持有同一份实例，通过 prop 或应用级注入复用；没有外部实例时才创建独立 store：

```ts
import { createProLayoutStore } from '@framebase/element-plus-pro-components'

/** 在 setup（或任意模块）中创建一份 store */
const store = createProLayoutStore()

store.toggleCollapsed()
store.setLayoutMode('sideMix')
store.openSettings()
// 页面级实例在页面卸载时 destroy；项目级实例仅在应用退出时 destroy。
```

```vue
<template>
  <ProLayout :store="store" :menus="menus" />
  <ProLayout :store="store" :menus="menus" />
  <!-- 没有注入且不传 store：独立状态 -->
  <ProLayout :menus="menus" />
</template>
```

这种显式模式的好处：

- 共享关系一目了然，从模板上就能看出哪些 layout 联动。
- 没有注入且不传 store 时隔离，对比预览、嵌入式组件等场景互不干扰。
- 每个 store 可通过 `createProLayoutStore({ defaults, syncDocumentTheme })` 独立定制默认值。

### 在子组件中读取 store

子组件通过 `useProLayout()` 读取最近的 ProLayout store：

```ts
import { provideProLayout, useProLayout } from '@framebase/element-plus-pro-components'

const myStore = createProLayoutStore({ defaults: { themeColor: '#7c4dff' } })
provideProLayout(myStore)

// 子组件中：
const store = useProLayout()
```

`useProLayout()` 返回最近注入的同一份实例；未命中时明确抛错，避免业务读到另一份空状态。
纯 TS 模块应直接读取项目 store；应用级注入也支持 `app.runWithContext(useProLayout)`。

### 接入项目 Store（Pinia 示例）

组件库不依赖 Pinia。项目持有完整配置，再让 Layout 直接使用它，布局设置与项目状态双向同步：

```ts
// stores/layout.ts
import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { createProLayoutStore, defaultLayoutConfig } from '@framebase/element-plus-pro-components'

export const useLayoutStore = defineStore('layout', () => {
  const config = reactive(defaultLayoutConfig())
  const layout = createProLayoutStore({ config })
  return { config, layout }
})
```

```vue
<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
const project = useLayoutStore()
</script>

<template>
  <ProLayout :store="project.layout" :menus="menus" />
</template>
```

其它页面、路由守卫或业务模块读取 `useLayoutStore(pinia).layout` 即可调用
`toggleCollapsed()` / `setLayoutMode()` / `openSettings()`，无需等待组件 ref。
`createProLayoutStore` 保留实例身份，放入项目响应式 store 后计算属性也不会被深层解包。
配置持久化只保存 `config`（可用项目已有 Pinia 持久化方案）；方法、计算属性和 `ui` 临时态不序列化。
恢复配置通过 `layout.batchSetSetting(savedConfig)` 合并，保持原对象身份。
不要在路由页面卸载时销毁项目持有的实例，应用退出时再调用 `layout.destroy()`。

也可以在入口注册 `app.provide(proLayoutStoreKey, project.layout)`，之后 `<ProLayout>` 和业务组件的
`useProLayout()` 都能读取这份项目实例。显式 `:store` 会覆盖注入，适合隔离预览。

## 内容区滚动

独立页面默认高度为 `100dvh`（回退 `100vh`）；嵌入式布局显式传入 `height="640px"` 或
`height="100%"`，使用百分比时父容器必须有确定高度。
两种模式均由 `.pro-layout__content` 持有滚动条，页头、标签栏、侧栏和页脚不随正文滚动。
正文内边距与水印位于 `.pro-layout__body`，`bodyStyle` 作用于这个正文容器。
返回顶部也定位到当前实例的内容区。正文滚到边界时不继续带动外层页面。
业务页面默认使用自然内容高度；需要表格等内部滚动时自行为该区域设置明确高度。

## 布局模式

| 模式     | 值        | 说明                                                                |
| -------- | --------- | ------------------------------------------------------------------- |
| 侧边栏   | `side`    | 菜单在左侧垂直展示                                                  |
| 顶部     | `top`     | 菜单在顶部水平展示，无侧栏                                          |
| 顶部混合 | `topMix`  | 未分割时菜单全部在左侧；开启 `splitMenu` 后一级在顶部、子菜单在左侧 |
| 侧边混合 | `sideMix` | 最左侧为图标列，点击展开二级菜单面板，可图钉固定                    |

## 主题

- `theme`：应用主题（`light` / `dark`）。内部全屏 store 同步 `<html>` 的 `dark` 类；传入 `height` 的内部 store 仅改变布局自身的主题。嵌入式外部 store 应设 `syncDocumentTheme: false`。
- `sidebarTheme` / `headerTheme`：导航主题，可独立于应用主题把侧栏或顶部置为深色（深色模式仅
  `theme === 'light'` 时可用）。
- `themeColor`：主题色，内部通过 `color-mix` 推导 Element Plus 主色梯度。
- `darkMenuBackground`：深色导航背景色，默认 `#001529`。

### CSS 变量的绑定归属

主题变量独立于弹层挂载位置，由项目选择绑定范围：

| 方式             | ProLayout         | 外部                                          |
| ---------------- | ----------------- | --------------------------------------------- |
| 局部绑定（默认） | `bindTheme=true`  | 无需绑定，适合隔离预览                        |
| 同步绑定         | `bindTheme=true`  | 将同一份配置生成的变量绑定到外部容器或 `html` |
| 外部接管         | `bindTheme=false` | 只由外部绑定，Layout 与业务弹层继承外部变量   |

整个应用使用同一份主题时，可在应用根组件统一绑定 `html`：

```vue
<script setup lang="ts">
import { bindProLayoutTheme } from '@framebase/element-plus-pro-components'
import { useLayoutStore } from '@/stores/layout'

const project = useLayoutStore()
bindProLayoutTheme(project.layout.config) // 默认目标为 document.documentElement
</script>

<template>
  <ProLayout :store="project.layout" :bind-theme="false" />
  <!-- Teleport 到 body 的业务弹窗也继承 html，不用逐个设置 style -->
  <el-dialog v-model="visible" title="业务弹窗">...</el-dialog>
</template>
```

保持 `bindTheme=true` 即为 Layout 与 html 同步绑定。外部接管时，根节点仅绑定尺寸变量，
内置设置抽屉、通知、用户菜单等也不再重复写入应用主题；侧栏和头部的独立导航主题仍由配置控制。
`bindTheme` 不改变抽屉、Dialog 或 Overlay 的挂载位置。

如果项目希望自行管理样式，可以直接读取响应式变量：

```ts
const themeVars = useProLayoutTheme(project.layout.config)
// <div :style="themeVars"><ProLayout :bind-theme="false" ... /></div>
// 非响应式场景：resolveProLayoutThemeVars(config)
```

`bindProLayoutTheme(config, target?)` 支持 HTMLElement、模板 ref 或 getter，目标变更时撤销旧绑定。
返回 `{ themeVars, stop }`；在组件/effect scope 内自动清理，纯 TS 调用由项目执行 `stop()`。
停止时恢复目标原有的内联变量及优先级；推荐每个目标由一个项目级绑定统一维护。
切换深浅色、主题色和导航背景时同步更新，无需逐个处理弹层。
变量包含 `--el-*`、Framebase 对应色彩 token、`--pro-layout-*` 及 `color-scheme`。
绑定函数不修改 `html.dark`；`syncDocumentTheme` 只负责该 class，两者可分别配置。

## 设置抽屉（Settings）

通过 `store.openSettings()` / `store.closeSettings()` 控制。也可通过 `<ProLayout>` 头部齿轮按钮
（`showSettingButton`）进入。抽屉内的所有改动都会落到 store，并 `emit('setting-change', key, value)` /
`emit('setting-reset')`，方便同步到项目配置文件或后端持久化。

抽屉支持「复制配置」按钮，会把当前完整 `config` 复制到剪贴板；「重置」按钮恢复默认值。

传入 `height` 时，设置抽屉、移动端菜单及遮罩均限制在当前布局容器内，不锁定外部页面滚动。
共享 store 时建议仅一个实例开启 `showSettings`，其余实例设为 `false`。
`settings-extra` 插槽可添加权限模式、项目持久化等业务配置。

菜单数据、路由权限、标签数组和页面缓存由业务应用管理。内置导航负责展示并发出事件，
不会绑定 vite-admin-vue 的 Pinia store。`router` 可启用 Vue Router 跳转；批量关闭和重排通过下方事件更新业务数组。

## Props

| 参数                      | 说明                                                   | 类型                          | 默认值            |
| ------------------------- | ------------------------------------------------------ | ----------------------------- | ----------------- |
| `store`                   | 外部传入的 store，传入后多个实例共享同一份布局状态     | `ProLayoutStore`              | —                 |
| `bindTheme`               | 是否局部绑定主题 CSS 变量，关闭后继承外部主题          | `boolean`                     | `true`            |
| `layoutMode`              | 布局模式（`v-model:layout-mode`）                      | `LayoutMode`                  | `'side'`          |
| `collapsed`               | 侧栏是否折叠（`v-model:collapsed`）                    | `boolean`                     | `false`           |
| `asideWidth`              | 侧栏展开宽度（px）                                     | `number`                      | `220`             |
| `headerHeight`            | 头部高度（px）                                         | `number`                      | `44`              |
| `tabHeight`               | 标签栏高度（px）                                       | `number`                      | `35`              |
| `footerHeight`            | 页脚高度（px）                                         | `number`                      | `50`              |
| `showBreadcrumb`          | 是否显示面包屑（Side / SideMix 模式）                  | `boolean`                     | `true`            |
| `showBreadcrumbIcon`      | 是否显示面包屑图标                                     | `boolean`                     | `true`            |
| `showTabs`                | 是否显示标签栏                                         | `boolean`                     | `true`            |
| `showFooter`              | 是否显示页脚                                           | `boolean`                     | `true`            |
| `splitMenu`               | TopMix 模式下是否分割一级与子菜单                      | `boolean`                     | `false`           |
| `showEmptySplitSidebar`   | 顶部分割时无子菜单仍显示侧栏                           | `boolean`                     | `false`           |
| `sideMixFixedMenu`        | SideMix 图钉固定二级菜单面板（`v-model`）              | `boolean`                     | `false`           |
| `theme`                   | 应用主题（`v-model:theme`）                            | `'light' \| 'dark'`           | `'light'`         |
| `sidebarTheme`            | 侧栏主题                                               | `'light' \| 'dark'`           | `'light'`         |
| `headerTheme`             | 顶部导航主题                                           | `'light' \| 'dark'`           | `'light'`         |
| `themeColor`              | 主题色                                                 | `string`                      | `'#1677ff'`       |
| `darkMenuBackground`      | 深色导航背景色                                         | `string`                      | `'#001529'`       |
| `title`                   | 标题文案                                               | `string`                      | `''`              |
| `logo`                    | Logo 图片地址                                          | `string`                      | `''`              |
| `logoWidth`               | Logo 图片视觉尺寸（px）                                | `number`                      | `36`              |
| `showLogoTitle`           | 是否显示 Logo 标题                                     | `boolean`                     | `true`            |
| `menus`                   | 菜单数据                                               | `LayoutMenuItem[]`            | `[]`              |
| `activeKey`               | 激活菜单 key（`v-model:active-key`）                   | `string`                      | `''`              |
| `router`                  | 透传 `el-menu` 的 router 模式                          | `boolean`                     | `false`           |
| `tabs`                    | 标签数据                                               | `LayoutTabItem[]`             | `[]`              |
| `activeTabKey`            | 激活标签 key（`v-model:active-tab-key`）               | `string`                      | `''`              |
| `breadcrumbs`             | 面包屑数据                                             | `LayoutBreadcrumbItem[]`      | `[]`              |
| `showHeader`              | 是否显示头部                                           | `boolean`                     | `true`            |
| `showNotification`        | 头部右侧是否显示消息通知                               | `boolean`                     | `true`            |
| `showFullscreen`          | 头部右侧是否显示全屏按钮                               | `boolean`                     | `true`            |
| `showThemeToggle`         | 头部右侧是否显示主题切换按钮                           | `boolean`                     | `true`            |
| `showSettings`            | 是否显示内置布局设置抽屉                               | `boolean`                     | `true`            |
| `showSettingButton`       | 是否显示头部设置按钮                                   | `boolean`                     | `true`            |
| `showBackTop`             | 是否显示返回顶部按钮                                   | `boolean`                     | `false`           |
| `watermark`               | 水印文案                                               | `string`                      | `''`              |
| `footerText`              | 页脚文案                                               | `string`                      | 版权信息          |
| `showFooterText`          | 是否显示默认页脚文案                                   | `boolean`                     | `true`            |
| `userName` / `userAvatar` | 用户名 / 头像                                          | `string`                      | `'管理员'` / `''` |
| `showUserMenu`            | 是否显示用户菜单                                       | `boolean`                     | `true`            |
| `contentPadding`          | 内容区内边距，`false` 表示无内边距                     | `number \| string \| boolean` | `16`              |
| `bodyStyle`               | 内容区额外样式                                         | `CSSProperties`               | —                 |
| `themeSwatches`           | 设置抽屉主题色预设色板                                 | `string[]`                    | 内置色板          |
| `drawerSize`              | 设置抽屉宽度                                           | `string \| number`            | `'420px'`         |
| `mobile`                  | 强制进入移动端形态                                     | `boolean`                     | `false`           |
| `mobileBreakpoint`        | 移动端断点（px）                                       | `number`                      | `768`             |
| `height`                  | 根容器高度，默认占满视口；传入后导航和抽屉相对实例定位 | `string`                      | `''`              |

## 插槽

ProLayout 只开放有明确归属的扩展点。页面正文结构由业务页面或 `ProPageContainer` 管理；侧栏外壳、
响应式形态以及头部内置控制项仍由 ProLayout 管理，避免替换局部后丢失布局联动。所有插槽都能取得
同一份 `store` 和基础布局上下文。

| 插槽                     | 说明                                                   |
| ------------------------ | ------------------------------------------------------ |
| default                  | 内容区正文                                             |
| logo                     | Logo 区域（头部或侧栏）                                |
| aside-menu               | 替换桌面侧栏菜单内容，不替换侧栏外壳                   |
| menu                     | `aside-menu` 的兼容别名，已废弃，后续版本移除          |
| aside-trigger            | 替换侧栏底部折叠按钮                                   |
| mobile-menu              | 替换移动端 Drawer 内的菜单内容                         |
| menu-title / menu-extra  | 自定义默认菜单项标题 / 右侧附加内容                    |
| header                   | 替换整个头部                                           |
| breadcrumb               | 替换默认面包屑                                         |
| header-menu              | 替换顶部导航菜单区域                                   |
| header-actions           | 在默认头部右侧追加业务操作                             |
| notification / user-menu | 替换通知 / 用户菜单                                    |
| tabs                     | 替换整个标签栏                                         |
| tabs-prefix / tabs-extra | 在默认标签栏左 / 右侧追加内容                          |
| footer                   | 替换页脚                                               |
| settings                 | 替换布局设置抽屉                                       |
| settings-extra           | 默认设置抽屉内的扩展区域，取得 `config` / `setSetting` |

`fullscreen`、`theme-toggle`、`setting-button` 通过对应 props 控制显隐；需要完全不同的交互时使用
`header`。菜单图标直接通过 `LayoutMenuItem.icon` 配置。

### 整体替换插槽上下文

整体替换插槽不仅提供数据，也提供继续驱动 ProLayout 的控制器。自定义实现不需要复制组件内部的
受控状态和事件同步逻辑。

| 插槽                         | 额外上下文                                                            |
| ---------------------------- | --------------------------------------------------------------------- |
| `aside-menu` / `mobile-menu` | `menus`、`activeKey`、`collapsed`、`select(key)`                      |
| `tabs` / `tabs-*`            | `tabs`、`activeKey`、`change`、`close`、`action`、`reorder`           |
| `header`                     | `menus`、`activeKey`、`openMobileMenu`、`openSettings`、`toggleTheme` |
| `settings`                   | `visible`、`open`、`close`                                            |

替换侧栏菜单时可以直接复用公开的 `ProLayoutMenuItem`：

```vue
<script setup lang="ts">
import { ProLayoutMenuItem } from '@framebase/element-plus-pro-components'
</script>

<template>
  <ProLayout :menus="menus">
    <template #aside-menu="{ menus, activeKey, select }">
      <el-menu :default-active="activeKey" @select="select">
        <ProLayoutMenuItem
          v-for="item in menus"
          :key="item.key"
          :item="item"
          :active-key="activeKey"
        />
      </el-menu>
    </template>
  </ProLayout>
</template>
```

替换标签栏时也可以复用默认组件，并把事件交回上下文控制器：

```vue
<script setup lang="ts">
import { ProLayoutTabs } from '@framebase/element-plus-pro-components'
</script>

<template>
  <ProLayout :tabs="tabs">
    <template #tabs="{ tabs, activeKey, change, close, action, reorder }">
      <ProLayoutTabs
        :tabs="tabs"
        :active-key="activeKey"
        @change="change"
        @close="close"
        @action="action"
        @reorder="reorder"
      />
    </template>
  </ProLayout>
</template>
```

### 公开子组件

以下子组件作为稳定 API，可用于插槽内复用：

- `ProLayoutLogo`
- `ProLayoutMenuItem`
- `ProLayoutTabs`
- `ProLayoutBreadcrumb`
- `ProLayoutFooter`

以下组件属于 Advanced API，继续导出以保持兼容，但其参数和内部结构可能随 ProLayout 演进：

- `ProLayoutAside` / `ProLayoutHeader`
- `ProLayoutMixMenu` / `ProLayoutMixSidebar`
- `ProLayoutSettings` / `ProLayoutCheckButtonGroup`

## 事件

| 事件名                       | 说明                                                                  | 回调参数                                                 |
| ---------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| `update:collapsed`           | 折叠状态变化                                                          | `(value: boolean)`                                       |
| `update:layout-mode`         | 布局模式变化                                                          | `(value: LayoutMode)`                                    |
| `update:theme`               | 应用主题变化                                                          | `(value: 'light' \| 'dark')`                             |
| `update:side-mix-fixed-menu` | SideMix 图钉状态变化                                                  | `(value: boolean)`                                       |
| `update:active-key`          | 激活菜单 key                                                          | `(value: string)`                                        |
| `update:active-tab-key`      | 激活标签 key                                                          | `(value: string)`                                        |
| `menu-select`                | 选中菜单                                                              | `(key, item)`                                            |
| `tab-change` / `tab-close`   | 标签切换 / 关闭                                                       | `(key[, index])`                                         |
| `tab-action`                 | 刷新、关闭当前/其他/左侧/右侧/全部；keys 已排除固定、禁用与不可关闭项 | `(action: LayoutTabAction, key: string, keys: string[])` |
| `tab-reorder`                | 拖动排序后的完整 key 数组                                             | `(keys: string[])`                                       |
| `user-command`               | 用户菜单操作                                                          | `(command: string)`                                      |
| `notification-click`         | 点击通知按钮                                                          | —                                                        |
| `setting-change`             | 设置项变化                                                            | `(key, value)`                                           |
| `setting-reset`              | 重置设置                                                              | —                                                        |

## Expose

通过 `ref` 取得 `<ProLayout>` 实例后可用：

| 字段              | 说明                                                   | 类型             |
| ----------------- | ------------------------------------------------------ | ---------------- |
| `store`           | 当前实例绑定的 store                                   | `ProLayoutStore` |
| `metrics`         | 当前实例的响应式度量（含移动端、头部显隐与子菜单状态） | `LayoutMetrics`  |
| `toggleCollapsed` | 切换折叠状态                                           | `() => void`     |
| `openSettings`    | 打开布局设置抽屉                                       | `() => void`     |
| `closeSettings`   | 关闭布局设置抽屉                                       | `() => void`     |

## API

### `createProLayoutStore(options?)`

创建一份独立的 ProLayout store。默认场景每个 `<ProLayout>` 内部各自创建；需要多实例共享时，
调用方创建一份后通过 `store` prop 或注入传给多个 `<ProLayout>`。`options.config` 直接使用项目的完整
响应式配置对象，不复制；省略时 `options.defaults` 可覆盖默认配置，
`options.syncDocumentTheme` 控制是否同步切换 `<html>` 的 `dark` class（默认 `true`，多实例共存
场景可按需关闭）。

组件仅销毁自己创建的 store；prop 或注入的外部 store 由创建者调用 `destroy()`。
`store.metrics` 仅由配置推导基准尺寸；获取运行时布局尺寸应读取组件 expose 的 `metrics`。

### `useProLayout()`

从组件树或应用上下文中读取最近的 ProLayout store；未命中时抛错。纯 TS 模块直接使用项目持有的实例。

### `provideProLayout(store)`

在当前组件作用域下 provide 一个 ProLayout store。

### `proLayoutStoreKey`

InjectionKey，可用于直接 `inject`。

### 类型导出

`LayoutMode` / `LayoutTheme` / `LayoutConfig` / `LayoutSettingsConfig` / `LayoutMenuItem` /
`LayoutTabItem` / `LayoutBreadcrumbItem` / `LayoutMetrics` / `LayoutTabAction` 全部从
`@framebase/element-plus-pro-components` 顶层导出。

## 设计 token

ProLayout 内部使用的设计 token 与 `element-plus-theme` 风格一致：

- `--framebase-color-bg-page`：根容器底色（浅色 `#f4f6fa`，深色由 el-bg-color-page 控制）
- `--framebase-color-bg` / `--framebase-color-bg-overlay`：表面 / 头部底色
- `--framebase-color-border`：分隔线
- `--framebase-color-text-primary / text-regular / text-secondary`：标题 / 正文 / 辅助文字
- `--framebase-color-primary`：主题色
- `--framebase-color-fill-lighter / fill-light`：hover / 默认 placeholder 背景

如果你的项目使用了其它 design system，只需要在根容器级覆盖 `--pro-layout-*` 即可就地换皮。
