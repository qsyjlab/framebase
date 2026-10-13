// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref, type VNodeChild } from 'vue'
import ProLayout from '../pro-layout.vue'
import { createProLayoutStore } from '../store'
import {
  hasInjectedProLayout,
  proLayoutStoreKey,
  provideProLayout,
  useProLayout
} from '../use-pro-layout'
import type { LayoutTabItem } from '../types'
import { bindProLayoutTheme } from '../theme'
import { useSurfaceStyle } from '../use-surface-style'
import { useNavigationStyle } from '../use-navigation-style'

const cleanups: (() => void)[] = []
afterEach(() =>
  cleanups
    .splice(0)
    .reverse()
    .forEach(cleanup => cleanup())
)

function mount(render: () => VNodeChild) {
  const container = document.createElement('div')
  document.body.append(container)
  const app = createApp({ render })
  app.mount(container)
  cleanups.push(() => {
    app.unmount()
    container.remove()
  })
  return container
}

describe('ProLayout 集成', () => {
  it('折叠侧栏的子菜单保留标准图标节点，避免被 Element Plus 隐藏', () => {
    const MenuIcon = defineComponent({
      name: 'MenuIcon',
      setup: () => () => h('svg', { viewBox: '0 0 16 16' })
    })
    const container = mount(() =>
      h(ProLayout, {
        height: '400px',
        collapsed: true,
        showHeader: false,
        showSettings: false,
        menus: [
          {
            key: 'system',
            title: '系统管理',
            icon: MenuIcon,
            children: [{ key: 'users', title: '用户管理' }]
          }
        ]
      })
    )
    const submenuTitle = container.querySelector('.el-sub-menu__title') as HTMLElement
    expect(submenuTitle.querySelector(':scope > .el-icon.pro-layout-menu__icon')).not.toBeNull()
    expect(submenuTitle.querySelector(':scope > span.pro-layout-menu__icon')).toBeNull()
  })

  it('外部 html 接管主题时根节点和设置抽屉不重复绑定，开关动态恢复局部绑定', async () => {
    const store = createProLayoutStore({ syncDocumentTheme: false, defaults: { theme: 'dark' } })
    cleanups.push(store.destroy)
    const binding = bindProLayoutTheme(store.config)
    cleanups.push(binding.stop)
    const bindTheme = ref(false)
    let surface: ReturnType<typeof useSurfaceStyle> | undefined
    let navigation: ReturnType<typeof useNavigationStyle> | undefined
    const child = {
      setup() {
        surface = useSurfaceStyle()
        navigation = useNavigationStyle()
        return () => h('span', '业务内容')
      }
    }
    const container = mount(() =>
      h(ProLayout, { store, height: '400px', bindTheme: bindTheme.value }, () => h(child))
    )
    store.openSettings()
    await nextTick()
    const root = container.querySelector('.pro-layout') as HTMLElement
    const settings = container.querySelector('.pro-layout-settings') as HTMLElement
    expect(document.documentElement.style.getPropertyValue('--el-bg-color')).toBe('#172036')
    expect(root.style.getPropertyValue('--el-bg-color')).toBe('')
    expect(root.style.getPropertyValue('--pro-layout-surface')).toBe('')
    expect(root.style.getPropertyValue('--pro-layout-header-height')).not.toBe('')
    expect(settings.style.getPropertyValue('--el-bg-color')).toBe('')
    expect(surface?.value).toEqual({})
    expect(navigation?.value).not.toHaveProperty('--el-color-primary')
    bindTheme.value = true
    await nextTick()
    expect(root.style.getPropertyValue('--el-bg-color')).toBe('#172036')
    expect(settings.style.getPropertyValue('--el-bg-color')).toBe('#172036')
    expect(surface?.value['--el-bg-color']).toBe('#172036')
    bindTheme.value = false
    store.setTheme('light')
    await nextTick()
    expect(root.style.getPropertyValue('--el-bg-color')).toBe('')
    expect(settings.style.getPropertyValue('--el-bg-color')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--el-bg-color')).toBe('#ffffff')
  })
  it('项目注入、组件 expose 和业务 hook 读取同一实例，卸载布局不销毁项目 store', async () => {
    const store = createProLayoutStore({ syncDocumentTheme: false })
    cleanups.push(store.destroy)
    const visible = ref(true)
    const instance = ref<InstanceType<typeof ProLayout>>()
    let childStore: ReturnType<typeof useProLayout> | undefined
    const child = {
      setup() {
        childStore = useProLayout()
        return () => h('span', store.config.layoutMode)
      }
    }
    const parent = {
      setup() {
        provideProLayout(store)
        return () =>
          visible.value
            ? h(ProLayout, { ref: instance, height: '400px', showSettings: false }, () => h(child))
            : null
      }
    }
    mount(() => h(parent))
    expect(instance.value?.store).toBe(store)
    expect(childStore).toBe(store)
    visible.value = false
    await nextTick()
    expect(store.destroyed).toBe(false)
    store.setLayoutMode('top')
    visible.value = true
    await nextTick()
    expect(instance.value?.store.config.layoutMode).toBe('top')
  })

  it('支持应用级注入，在缺少上下文时明确报错', () => {
    const store = createProLayoutStore({ syncDocumentTheme: false })
    cleanups.push(store.destroy)
    const app = createApp({ render: () => null })
    app.provide(proLayoutStoreKey, store)
    expect(app.runWithContext(useProLayout)).toBe(store)
    expect(app.runWithContext(hasInjectedProLayout)).toBe(true)
    expect(hasInjectedProLayout()).toBe(false)
    expect(() => useProLayout()).toThrow('未提供 layout store')
  })

  it('固定当前打开的混合子菜单不会回退到当前路由，选择无子菜单项后取消面板占位', async () => {
    const store = createProLayoutStore({
      syncDocumentTheme: false,
      defaults: { layoutMode: 'sideMix' }
    })
    cleanups.push(store.destroy)
    const container = mount(() =>
      h(ProLayout, {
        store,
        height: '400px',
        activeKey: 'home',
        showSettings: false,
        menus: [
          { key: 'home', title: '首页' },
          { key: 'system', title: '系统管理', children: [{ key: 'users', title: '用户' }] }
        ]
      })
    )
    ;(container.querySelector('[title="系统管理"]') as HTMLElement).click()
    await nextTick()
    ;(container.querySelector('[aria-label="固定子菜单"]') as HTMLElement).click()
    await nextTick()
    expect(store.config.sideMixFixedMenu).toBe(true)
    expect(container.querySelector('.el-menu-item')?.textContent).toContain('用户')
    expect((container.querySelector('.pro-layout__main') as HTMLElement).style.paddingLeft).toBe(
      '280px'
    )
    ;(container.querySelector('[title="首页"]') as HTMLElement).click()
    await nextTick()
    expect((container.querySelector('.pro-layout__main') as HTMLElement).style.paddingLeft).toBe(
      '60px'
    )
  })
  it('嵌入式抽屉和遮罩留在当前布局内，共享 store 不会打开桌面实例的移动菜单', async () => {
    const store = createProLayoutStore({ syncDocumentTheme: false })
    cleanups.push(store.destroy)
    const container = mount(() =>
      h('div', [
        h(ProLayout, { store, height: '400px', mobile: true }),
        h(ProLayout, { store, height: '300px', showSettings: false })
      ])
    )
    store.openSettings()
    await nextTick()
    const layouts = container.querySelectorAll('.pro-layout')
    const settings = layouts[0].querySelector('.pro-layout-settings')
    expect(settings).not.toBeNull()
    expect(settings?.closest('.el-overlay')?.classList.contains('pro-layout__drawer-overlay')).toBe(
      true
    )
    expect(document.body.querySelector(':scope > .el-overlay')).toBeNull()
    expect(document.body.classList.contains('el-popup-parent--hidden')).toBe(false)
    store.closeSettings()
    store.setMobileDrawer(true)
    await nextTick()
    expect(layouts[0].querySelector('.pro-layout__mobile-drawer')).not.toBeNull()
    const desktopOverlay = layouts[1]
      .querySelector('.pro-layout__mobile-drawer')
      ?.closest('.el-overlay') as HTMLElement
    expect(desktopOverlay.style.display).toBe('none')
  })
  it('省略的配置不会覆盖外部 store，更新单个 prop 不重置其他设置', async () => {
    const store = createProLayoutStore({
      syncDocumentTheme: false,
      defaults: {
        layoutMode: 'topMix',
        splitMenu: true,
        showTabs: false,
        showFooter: false,
        sidebarTheme: 'dark',
        themeColor: '#7c4dff',
        asideWidth: 260
      }
    })
    cleanups.push(store.destroy)
    const width = ref(260)
    mount(() =>
      h(ProLayout, { store, asideWidth: width.value, height: '400px', showSettings: false })
    )
    expect(store.config.splitMenu).toBe(true)
    expect(store.config.showTabs).toBe(false)
    expect(store.config.showFooter).toBe(false)
    expect(store.config.themeColor).toBe('#7c4dff')
    store.setThemeColor('#13c2c2')
    width.value = 280
    await nextTick()
    expect(store.config.asideWidth).toBe(280)
    expect(store.config.themeColor).toBe('#13c2c2')
    expect(store.config.sidebarTheme).toBe('dark')
  })

  it('侧栏选择和关闭标签事件可以交给业务处理，固定标签排序靠前', async () => {
    const onMenuSelect = vi.fn()
    const onTabClose = vi.fn()
    const tabs: LayoutTabItem[] = [
      { key: 'users', label: '用户' },
      { key: 'home', label: '首页', affix: true }
    ]
    const container = mount(() =>
      h(ProLayout, {
        height: '400px',
        showSettings: false,
        showHeader: false,
        menus: [
          { key: 'home', title: '首页' },
          { key: 'users', title: '用户' }
        ],
        tabs,
        activeKey: 'home',
        activeTabKey: 'home',
        onMenuSelect,
        onTabClose
      })
    )
    ;(container.querySelectorAll('.el-menu-item')[1] as HTMLElement).click()
    await nextTick()
    expect(onMenuSelect).toHaveBeenCalledWith('users', expect.objectContaining({ title: '用户' }))
    expect(container.querySelector('[role=tab]')?.getAttribute('data-key')).toBe('home')
    ;(container.querySelector('[aria-label="关闭 用户"]') as HTMLElement).click()
    expect(onTabClose).toHaveBeenCalledWith('users', 1)
    expect(container.querySelector('[aria-label="关闭 首页"]')).toBeNull()
  })

  it('容器深色主题保持局部隔离，卸载内部布局不会销毁外部 store', async () => {
    const store = createProLayoutStore({ syncDocumentTheme: false, defaults: { theme: 'dark' } })
    cleanups.push(store.destroy)
    const originalDark = document.documentElement.classList.contains('dark')
    const visible = ref(true)
    const container = mount(() =>
      visible.value
        ? h(ProLayout, {
            store,
            height: '400px',
            showSettings: false,
            showHeader: false
          })
        : null
    )
    expect(container.querySelector('.pro-layout')?.classList.contains('is-dark')).toBe(true)
    expect(
      (container.querySelector('.pro-layout') as HTMLElement).style.getPropertyValue(
        '--el-bg-color'
      )
    ).toBe('#172036')
    expect(document.documentElement.classList.contains('dark')).toBe(originalDark)
    visible.value = false
    await nextTick()
    expect(store.destroyed).toBe(false)
  })
})
