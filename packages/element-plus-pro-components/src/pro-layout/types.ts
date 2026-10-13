import type { Component, VNodeChild } from 'vue'

/**
 * 布局模式。
 *
 * - `side`：侧边栏，菜单全部在左侧垂直展示。
 * - `top`：顶部导航，菜单全部在顶部水平展示，无侧栏。
 * - `topMix`：顶部混合。未分割时菜单全在左侧；开启 `splitMenu` 后一级在顶部、子菜单在左侧。
 * - `sideMix`：侧边混合。最左为图标列，点击展开二级菜单面板，可图钉固定。
 */
export const LayoutMode = {
  Side: 'side',
  Top: 'top',
  TopMix: 'topMix',
  SideMix: 'sideMix'
} as const

export type LayoutMode = (typeof LayoutMode)[keyof typeof LayoutMode]

/** 应用主题 / 导航主题 */
export type LayoutTheme = 'light' | 'dark'

/**
 * 完整布局配置。所有与尺寸、显示、主题相关的可配置项都在这里。
 * 字段命名对齐 `vite-admin-vue` 的 `ProjectLayoutConfig`，
 * 默认值见 {@link defaultLayoutConfig}。
 */
export interface LayoutConfig {
  /** 当前布局模式 */
  layoutMode: LayoutMode
  /** 侧栏是否折叠 */
  collapsed: boolean
  /** 侧栏展开宽度（px） */
  asideWidth: number
  /** 头部高度（px） */
  headerHeight: number
  /** 标签栏高度（px） */
  tabHeight: number
  /** 页脚高度（px） */
  footerHeight: number
  /** 是否显示面包屑（Side / SideMix 模式） */
  showBreadcrumb: boolean
  /** 是否显示标签栏 */
  showTabs: boolean
  /** 是否显示页脚 */
  showFooter: boolean
  /** TopMix 模式下是否分割菜单（二级菜单放到左侧） */
  splitMenu: boolean
  /** 分割菜单没有子菜单时仍显示侧栏 */
  showEmptySplitSidebar: boolean
  /** SideMix 模式下固定二级菜单面板（图钉） */
  sideMixFixedMenu: boolean
  /** 应用主题 */
  theme: LayoutTheme
  /** 侧边栏主题（可独立于应用主题） */
  sidebarTheme: LayoutTheme
  /** 顶部导航主题（可独立于应用主题） */
  headerTheme: LayoutTheme
  /** 主题色 */
  themeColor: string
  /** 深色导航背景色 */
  darkMenuBackground: string
}

/**
 * 用户在「布局设置」抽屉中暴露的可改字段 —— 完整 config 的别名。
 * 保留别名用于向后兼容与语义化文档；未内置的配置可通过插槽扩展。
 */
export type LayoutSettingsConfig = LayoutConfig

/** 内置菜单项 */
export interface LayoutMenuItem {
  /** 唯一标识，建议使用路由 name */
  key: string
  /** 菜单标题 */
  title: string
  /** 图标：组件、渲染函数或 VNode */
  icon?: Component | (() => VNodeChild)
  /** 点击后跳转地址，配合 `router` 透传给 el-menu */
  path?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 子菜单 */
  children?: LayoutMenuItem[]
}

/** 内置标签项 */
export interface LayoutTabItem {
  /** 唯一标识，建议使用路由 fullPath */
  key: string
  /** 标签文案 */
  label: string
  /** 图标：组件、渲染函数或 VNode */
  icon?: Component | (() => VNodeChild)
  /** 是否可关闭，`false` 时固定展示 */
  closable?: boolean
  /** 是否为固定标签（不可关闭、排序靠前） */
  affix?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

/** 面包屑项 */
export interface LayoutBreadcrumbItem {
  /** 文案 */
  text: string
  /** 跳转地址，配合路由（`to` 形态） */
  to?: string | Record<string, unknown>
  /** 图标：组件、渲染函数或 VNode */
  icon?: Component | (() => VNodeChild)
}

/** 度量：根据当前配置推出的实际渲染参数 */
export interface LayoutMetrics {
  /** 头部是否全宽置于顶部（top / topMix） */
  isTopHeader: boolean
  /** 菜单是否横向渲染在头部（top / topMix） */
  isHorizontalHeaderMenu: boolean
  /** 侧栏是否使用「图标列 + 展开面板」混合形态（sideMix） */
  isMixSidebar: boolean
  showHeader: boolean
  showAside: boolean
  showTabs: boolean
  showFooter: boolean
  /** 侧栏实际占位宽度，0 表示不占位 */
  asideWidth: number
  /** 侧栏顶部留白（TopMix 时头部全宽，侧栏需下移） */
  asidePaddingTop: number
  /** 头部左侧留白（Side / SideMix 时避开侧栏） */
  headerPaddingLeft: number
  /** 头部层级 */
  headerZIndex: number
  /** 内容区顶部留白（固定头部/标签时预留） */
  mainPaddingTop: number
  /** 内容区左侧留白 */
  mainPaddingLeft: number
  /** 标签栏 fixed top 偏移 */
  tabTop: number
}

/**
 * 默认布局配置。
 * 各组件只在缺省时使用，可被 props / settings drawer 覆盖。
 */
export const defaultLayoutConfig = (): LayoutConfig => ({
  layoutMode: LayoutMode.Side,
  collapsed: false,
  asideWidth: 220,
  headerHeight: 44,
  tabHeight: 35,
  footerHeight: 50,
  showBreadcrumb: true,
  showTabs: true,
  showFooter: true,
  splitMenu: false,
  showEmptySplitSidebar: false,
  sideMixFixedMenu: false,
  theme: 'light',
  sidebarTheme: 'light',
  headerTheme: 'light',
  themeColor: '#1677ff',
  darkMenuBackground: '#001529'
})

/** 设计 drawer 中暴露的色板 */
export const layoutThemeSwatches: string[] = [
  '#2b62e8',
  '#1677ff',
  '#5b8ff9',
  '#7c4dff',
  '#13c2c2',
  '#52c41a',
  '#fa8c16',
  '#f5222d'
]

/** 应用主题切换时 documentElement 的 class 名 */
export const DARK_THEME_CLASS = 'dark'
