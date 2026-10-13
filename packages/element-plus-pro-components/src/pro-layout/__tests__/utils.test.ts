import { describe, expect, it } from 'vitest'
import {
  findLayoutRootMenu,
  findLayoutMenu,
  resolveLayoutTabCloseKeys,
  normalizeLayoutMenuItems,
  normalizeLayoutSpacing,
  normalizeLayoutTabItems,
  resolveLayoutBrandInitial,
  resolveLayoutMetrics,
  resolveLayoutSplitMenus
} from '../utils'
import { LayoutMode } from '../types'

describe('resolveLayoutMetrics', () => {
  it('top 模式：无侧栏不占位', () => {
    const metrics = resolveLayoutMetrics({
      layoutMode: LayoutMode.Top,
      collapsed: false,
      asideWidth: 220,
      collapsedWidth: 60,
      mixWidth: 60,
      splitMenu: false,
      showEmptySplitSidebar: false,
      sideMixFixedMenu: false,
      showHeader: true,
      showAside: true,
      showTabs: false,
      showFooter: false,
      headerHeight: 48,
      tabHeight: 40,
      splitMenuHasChildren: false
    })
    expect(metrics.showAside).toBe(false)
    expect(metrics.asideWidth).toBe(0)
    expect(metrics.isTopHeader).toBe(true)
    expect(metrics.isHorizontalHeaderMenu).toBe(true)
  })

  it('SideMix 模式：未固定二级面板时宽度 = mix 宽度', () => {
    const metrics = resolveLayoutMetrics({
      layoutMode: LayoutMode.SideMix,
      collapsed: false,
      asideWidth: 220,
      collapsedWidth: 60,
      mixWidth: 60,
      splitMenu: false,
      showEmptySplitSidebar: false,
      sideMixFixedMenu: false,
      showHeader: true,
      showAside: true,
      showTabs: false,
      showFooter: false,
      headerHeight: 48,
      tabHeight: 40,
      splitMenuHasChildren: false
    })
    expect(metrics.isMixSidebar).toBe(true)
    expect(metrics.asideWidth).toBe(60)
  })

  it('SideMix 模式：固定二级面板时宽度 = mix + asideWidth', () => {
    const metrics = resolveLayoutMetrics({
      layoutMode: LayoutMode.SideMix,
      collapsed: false,
      asideWidth: 220,
      collapsedWidth: 60,
      mixWidth: 60,
      splitMenu: false,
      showEmptySplitSidebar: false,
      sideMixFixedMenu: true,
      showHeader: true,
      showAside: true,
      showTabs: false,
      showFooter: false,
      headerHeight: 48,
      tabHeight: 40,
      splitMenuHasChildren: true
    })
    expect(metrics.asideWidth).toBe(280)
  })

  it('移动端和隐藏头部不会留下 TopMix 占位；固定混合菜单没有子菜单时只占图标列', () => {
    const input = {
      layoutMode: LayoutMode.TopMix,
      collapsed: false,
      asideWidth: 220,
      collapsedWidth: 60,
      mixWidth: 60,
      splitMenu: false,
      showEmptySplitSidebar: false,
      sideMixFixedMenu: true,
      showHeader: false,
      showAside: false,
      showTabs: true,
      showFooter: true,
      headerHeight: 48,
      tabHeight: 30,
      splitMenuHasChildren: false
    }
    const mobile = resolveLayoutMetrics(input)
    expect(mobile.showAside).toBe(false)
    expect(mobile.mainPaddingLeft).toBe(0)
    expect(mobile.mainPaddingTop).toBe(30)
    expect(mobile.asidePaddingTop).toBe(0)
    expect(
      resolveLayoutMetrics({ ...input, showAside: true, layoutMode: LayoutMode.SideMix }).asideWidth
    ).toBe(60)
    expect(resolveLayoutMetrics({ ...input, showAside: true }).asidePaddingTop).toBe(0)
  })

  it('TopMix 模式：未开 splitMenu 显示常规侧栏，开启后无子菜单且未强制显示则隐藏', () => {
    const a = resolveLayoutMetrics({
      layoutMode: LayoutMode.TopMix,
      collapsed: false,
      asideWidth: 220,
      collapsedWidth: 60,
      mixWidth: 60,
      splitMenu: false,
      showEmptySplitSidebar: false,
      sideMixFixedMenu: false,
      showHeader: true,
      showAside: true,
      showTabs: false,
      showFooter: false,
      headerHeight: 48,
      tabHeight: 40,
      splitMenuHasChildren: true
    })
    const b = resolveLayoutMetrics({
      layoutMode: LayoutMode.TopMix,
      collapsed: false,
      asideWidth: 220,
      collapsedWidth: 60,
      mixWidth: 60,
      splitMenu: true,
      showEmptySplitSidebar: false,
      sideMixFixedMenu: false,
      showHeader: true,
      showAside: true,
      showTabs: false,
      showFooter: false,
      headerHeight: 48,
      tabHeight: 40,
      splitMenuHasChildren: false
    })
    const c = resolveLayoutMetrics({
      layoutMode: LayoutMode.TopMix,
      collapsed: false,
      asideWidth: 220,
      collapsedWidth: 60,
      mixWidth: 60,
      splitMenu: true,
      showEmptySplitSidebar: true,
      sideMixFixedMenu: false,
      showHeader: true,
      showAside: true,
      showTabs: false,
      showFooter: false,
      headerHeight: 48,
      tabHeight: 40,
      splitMenuHasChildren: false
    })
    expect(a.showAside).toBe(true)
    expect(b.showAside).toBe(false)
    expect(c.showAside).toBe(true)
  })

  it('showTabs 关闭时不占位 mainPaddingTop', () => {
    const m = resolveLayoutMetrics({
      layoutMode: LayoutMode.Side,
      collapsed: false,
      asideWidth: 220,
      collapsedWidth: 60,
      mixWidth: 60,
      splitMenu: false,
      showEmptySplitSidebar: false,
      sideMixFixedMenu: false,
      showHeader: true,
      showAside: true,
      showTabs: true,
      showFooter: false,
      headerHeight: 48,
      tabHeight: 40,
      splitMenuHasChildren: false
    })
    expect(m.mainPaddingTop).toBe(48 + 40)
  })
})

describe('normalizeLayoutMenuItems', () => {
  it('过滤无效项 + 递归', () => {
    const out = normalizeLayoutMenuItems([
      {
        key: 'a',
        title: 'A',
        children: [
          { key: 'b', title: '' },
          { key: 'c', title: 'C' }
        ]
      }
    ] as never)
    expect(out).toHaveLength(1)
    expect(out[0].key).toBe('a')
    expect(out[0].children).toHaveLength(1)
    expect(out[0].children?.[0].key).toBe('c')
  })
})

describe('normalizeLayoutTabItems', () => {
  it('affix 优先排在前面', () => {
    const out = normalizeLayoutTabItems([
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B', affix: true },
      { key: 'c', label: 'C' }
    ])
    expect(out.map(t => t.key)).toEqual(['b', 'a', 'c'])
  })
})

describe('findLayoutRootMenu + resolveLayoutSplitMenus', () => {
  const menus = [
    {
      key: 'system',
      title: '系统',
      children: [
        { key: 'user', title: '用户' },
        { key: 'role', title: '角色' }
      ]
    },
    { key: 'dashboard', title: '工作台' }
  ] as const

  it('命中子项时返回一级菜单', () => {
    expect(findLayoutRootMenu(menus as never, 'role')?.key).toBe('system')
  })
  it('未命中时返回 undefined', () => {
    expect(findLayoutRootMenu(menus as never, 'xxx')).toBeUndefined()
  })
  it('解析分割菜单', () => {
    const split = resolveLayoutSplitMenus(menus as never, 'user')
    expect(split.map(m => m.key)).toEqual(['user', 'role'])
  })
})

describe('菜单路径与标签批量操作', () => {
  it('按路径递归查找子菜单和所属模块', () => {
    const menus = [
      { key: 'system', title: '系统', children: [{ key: 'user', path: '/users', title: '用户' }] }
    ]
    expect(findLayoutMenu(menus, '/users')?.key).toBe('user')
    expect(findLayoutRootMenu(menus, '/users')?.key).toBe('system')
  })
  it('关闭左右和全部时保留固定、禁用及不可关闭标签', () => {
    const tabs = [
      { key: 'home', label: '首页', affix: true },
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
      { key: 'c', label: 'C' },
      { key: 'disabled', label: '禁用', disabled: true },
      { key: 'locked', label: '锁定', closable: false }
    ]
    expect(resolveLayoutTabCloseKeys(tabs, 'b', 'closeLeft')).toEqual(['a'])
    expect(resolveLayoutTabCloseKeys(tabs, 'b', 'closeRight')).toEqual(['c'])
    expect(resolveLayoutTabCloseKeys(tabs, 'b', 'closeOther')).toEqual(['a', 'c'])
    expect(resolveLayoutTabCloseKeys(tabs, 'b', 'closeAll')).toEqual(['a', 'b', 'c'])
    expect(resolveLayoutTabCloseKeys(tabs, 'missing', 'closeOther')).toEqual([])
    expect(resolveLayoutTabCloseKeys(tabs, 'b', 'reload')).toEqual([])
  })
})

describe('normalizeLayoutSpacing', () => {
  it('false → 0px', () => expect(normalizeLayoutSpacing(false)).toBe('0px'))
  it('true/undefined → 12px', () => expect(normalizeLayoutSpacing(true)).toBe('12px'))
  it('number → `${n}px`', () => expect(normalizeLayoutSpacing(20)).toBe('20px'))
  it('string 原样返回', () => expect(normalizeLayoutSpacing('10px 24px')).toBe('10px 24px'))
})

describe('resolveLayoutBrandInitial', () => {
  it('空串返回 F', () => expect(resolveLayoutBrandInitial('')).toBe('F'))
  it('中文 → 取首字符', () => expect(resolveLayoutBrandInitial('管理员')).toBe('管'))
  it('英文 → 首字母大写', () => expect(resolveLayoutBrandInitial('framebase')).toBe('F'))
})
