import { h, isVNode } from 'vue'
import type { Component, VNodeChild } from 'vue'
import { LayoutMode } from './types'
import type { LayoutConfig, LayoutMenuItem, LayoutMetrics, LayoutTabItem } from './types'

/**
 * 根据当前模式与开关计算布局度量。
 * 纯函数，便于单测，也是主壳区域显隐与尺寸的唯一来源。
 */
export function resolveLayoutMetrics(input: {
  layoutMode: LayoutConfig['layoutMode']
  collapsed: boolean
  asideWidth: number
  collapsedWidth: number
  mixWidth: number
  splitMenu: boolean
  showEmptySplitSidebar: boolean
  sideMixFixedMenu: boolean
  showHeader: boolean
  showAside: boolean
  showTabs: boolean
  showFooter: boolean
  headerHeight: number
  tabHeight: number
  /** TopMix + splitMenu 时，当前一级菜单下是否存在子菜单 */
  splitMenuHasChildren: boolean
}): LayoutMetrics {
  const isTopHeader = input.layoutMode === LayoutMode.Top || input.layoutMode === LayoutMode.TopMix
  const isMixSidebar = input.layoutMode === LayoutMode.SideMix

  let showAside = input.showAside
  if (input.layoutMode === LayoutMode.Top) {
    showAside = false
  } else if (input.layoutMode === LayoutMode.TopMix) {
    /* TopMix 未开启 splitMenu 时显示常规侧栏；开启后仅在有子菜单（或强制显示空侧栏）时显示 */
    showAside =
      input.showAside &&
      (!input.splitMenu || input.showEmptySplitSidebar || input.splitMenuHasChildren)
  }

  let asideWidth = 0
  if (showAside) {
    if (isMixSidebar) {
      asideWidth =
        input.sideMixFixedMenu && input.splitMenuHasChildren
          ? input.mixWidth + input.asideWidth
          : input.mixWidth
    } else {
      asideWidth = input.collapsed ? input.collapsedWidth : input.asideWidth
    }
  }

  const asidePaddingTop =
    input.layoutMode === LayoutMode.TopMix && showAside && input.showHeader ? input.headerHeight : 0
  const headerPaddingLeft = input.layoutMode === LayoutMode.Side || isMixSidebar ? asideWidth : 0

  let headerZIndex = 1001
  if (input.layoutMode === LayoutMode.Top || input.layoutMode === LayoutMode.TopMix) {
    headerZIndex = 1003
  }

  const mainPaddingTop = input.showHeader ? input.headerHeight : 0
  const mainPaddingTopWithTab = mainPaddingTop + (input.showTabs ? input.tabHeight : 0)

  return {
    isTopHeader,
    isHorizontalHeaderMenu: isTopHeader,
    isMixSidebar,
    showHeader: input.showHeader,
    showAside,
    showTabs: input.showTabs,
    showFooter: input.showFooter,
    asideWidth,
    asidePaddingTop,
    headerPaddingLeft,
    headerZIndex,
    mainPaddingTop: mainPaddingTopWithTab,
    mainPaddingLeft: asideWidth,
    tabTop: input.showHeader ? input.headerHeight : 0
  }
}

/** 在菜单树中查找包含指定 key 的一级菜单 */
export function findLayoutRootMenu(
  menus: LayoutMenuItem[] | undefined,
  activeKey: string | undefined
): LayoutMenuItem | undefined {
  if (!menus?.length || !activeKey) return undefined
  for (const menu of menus) {
    if (containsLayoutMenuKey(menu, activeKey)) return menu
  }
  return undefined
}

function containsLayoutMenuKey(menu: LayoutMenuItem, key: string): boolean {
  if (menu.key === key || menu.path === key) return true
  return Boolean(menu.children?.some(child => containsLayoutMenuKey(child, key)))
}

/** 按 key / 路径查找菜单，适配 Element Plus 的 select 事件。 */
export function findLayoutMenu(menus: LayoutMenuItem[], key: string): LayoutMenuItem | undefined {
  for (const menu of menus) {
    if (menu.key === key || menu.path === key) return menu
    const child = findLayoutMenu(menu.children ?? [], key)
    if (child) return child
  }
  return undefined
}

export type LayoutTabAction = 'reload' | 'closeOther' | 'closeLeft' | 'closeRight' | 'closeAll'

/** 批量关闭仅针对可关闭标签，固定、禁用标签始终保留。 */
export function resolveLayoutTabCloseKeys(
  tabs: LayoutTabItem[],
  key: string,
  action: LayoutTabAction
): string[] {
  const index = tabs.findIndex(tab => tab.key === key)
  if (action === 'reload' || index < 0) return []
  return tabs
    .filter(
      (tab, i) =>
        !tab.affix &&
        tab.closable !== false &&
        !tab.disabled &&
        (action === 'closeAll' ||
          (action === 'closeOther' && i !== index) ||
          (action === 'closeLeft' && i < index) ||
          (action === 'closeRight' && i > index))
    )
    .map(tab => tab.key)
}

/** 解析分割菜单：返回当前激活一级菜单下的子菜单 */
export function resolveLayoutSplitMenus(
  menus: LayoutMenuItem[] | undefined,
  activeKey: string | undefined
): LayoutMenuItem[] {
  const root = findLayoutRootMenu(menus, activeKey)
  return root?.children?.length ? normalizeLayoutMenuItems(root.children) : []
}

/** 过滤并规整菜单数据，剔除无效项，空 children 归一为 undefined */
export function normalizeLayoutMenuItems(menus: LayoutMenuItem[] | undefined): LayoutMenuItem[] {
  if (!menus?.length) return []
  const result: LayoutMenuItem[] = []
  for (const menu of menus) {
    if (!menu?.key || !menu.title) continue
    const children = normalizeLayoutMenuItems(menu.children)
    result.push(children.length ? { ...menu, children } : { ...menu, children: undefined })
  }
  return result
}

/** 过滤并规整标签数据，并按「固定标签优先」稳定排序 */
export function normalizeLayoutTabItems(tabs: LayoutTabItem[] | undefined): LayoutTabItem[] {
  if (!tabs?.length) return []
  const valid = tabs.filter(tab => Boolean(tab?.key) && Boolean(tab.label))
  const affix = valid.filter(tab => tab.affix)
  const rest = valid.filter(tab => !tab.affix)
  return [...affix, ...rest]
}

/** 归一内容区内边距：`false` 无内边距，`true`/`undefined` 用默认 12px */
export function normalizeLayoutSpacing(value: number | string | boolean | undefined) {
  if (value === false) return '0px'
  if (value === true || value === undefined) return '12px'
  return typeof value === 'number' ? `${value}px` : value
}

/** 归一尺寸：数字转为 px，其余原样返回 */
export function toLayoutSize(value: number | string | undefined, fallback = '0px') {
  if (value === undefined || value === null || value === '') return fallback
  return typeof value === 'number' ? `${value}px` : value
}

/** 文本首字，作为无 Logo 图片时的占位标识 */
export function resolveLayoutBrandInitial(title?: string) {
  return (title ?? '').trim().charAt(0).toUpperCase() || 'F'
}

/**
 * 依据主题色推导 Element Plus 主色梯度。
 * 使用 CSS `color-mix` 动态混合亮暗变体，避免引入额外的颜色计算依赖。
 */
export function resolveLayoutPrimaryStyle(color?: string): Record<string, string> {
  const value = (color ?? '').trim()
  if (!value) return {}
  return {
    '--el-color-primary': value,
    '--el-color-primary-light-3': `color-mix(in srgb, ${value} 70%, #ffffff)`,
    '--el-color-primary-light-5': `color-mix(in srgb, ${value} 50%, #ffffff)`,
    '--el-color-primary-light-7': `color-mix(in srgb, ${value} 30%, #ffffff)`,
    '--el-color-primary-light-8': `color-mix(in srgb, ${value} 20%, #ffffff)`,
    '--el-color-primary-light-9': `color-mix(in srgb, ${value} 10%, #ffffff)`,
    '--el-color-primary-dark-2': `color-mix(in srgb, ${value} 80%, #000000)`
  }
}

/**
 * 把用户的 menu/tab icon 归一为可渲染的 VNode。
 * 兼容组件、渲染函数、VNode 与文本四种输入。
 */
export function renderLayoutIcon(icon: Component | (() => VNodeChild) | VNodeChild): VNodeChild {
  if (icon === null || icon === undefined) return null
  if (typeof icon === 'string' || typeof icon === 'number' || typeof icon === 'boolean') {
    return icon
  }
  if (Array.isArray(icon) || isVNode(icon)) return icon as VNodeChild
  return h(icon as Component)
}

/** Settings drawer 暴露给「复制配置」按钮用的快照 */
export function snapshotLayoutConfig(config: LayoutConfig) {
  return JSON.parse(JSON.stringify(config)) as LayoutConfig
}

/**
 * 比较两个 menu 项浅相等。
 * 用于 store 内 `activeKey` 变化时判断是否需要刷新。
 */
export function isSameLayoutMenuItem(a: LayoutMenuItem | undefined, b: LayoutMenuItem | undefined) {
  if (a === b) return true
  if (!a || !b) return false
  return a.key === b.key && a.title === b.title
}

/**
 * 根据 LayoutConfig 生成可作为「复制到项目配置」的语义对象（剥除运行时字段）。
 * 当前等价于直接 snapshot，未来可选择性裁剪字段。
 */
export function exportLayoutConfig(config: LayoutConfig) {
  return snapshotLayoutConfig(config)
}
