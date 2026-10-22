// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { createProLayoutStore as createStore } from '../store'
import type { CreateProLayoutStoreOptions, ProLayoutStore } from '../store'
import { LayoutMode, defaultLayoutConfig } from '../types'

const stores: ProLayoutStore[] = []
function createProLayoutStore(options?: CreateProLayoutStoreOptions) {
  const store = createStore(options)
  stores.push(store)
  return store
}
afterEach(() => {
  stores
    .splice(0)
    .reverse()
    .forEach(store => store.destroy())
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark')
  }
})

describe('createProLayoutStore', () => {
  it('创建独立 store 并反映到 config / ui', () => {
    const store = createProLayoutStore()
    expect(store.config.layoutMode).toBe(LayoutMode.Side)
    expect(store.config.collapsed).toBe(false)
    expect(store.ui.settingsVisible).toBe(false)
    expect(store.destroyed).toBe(false)
  })

  it('defaults 覆盖默认配置', () => {
    const store = createProLayoutStore({
      defaults: { themeColor: '#7c4dff', layoutMode: LayoutMode.Top }
    })
    expect(store.config.themeColor).toBe('#7c4dff')
    expect(store.config.layoutMode).toBe(LayoutMode.Top)
  })

  it('项目 reactive store 保持实例和计算属性，共用配置可双向修改', () => {
    const config = reactive(defaultLayoutConfig())
    const layout = createProLayoutStore({ config })
    const project = reactive({ layout, config })
    expect(project.layout).toBe(layout)
    expect(project.layout.config).toBe(config)
    layout.setCollapsed(true)
    expect(project.config.collapsed).toBe(true)
    project.config.layoutMode = LayoutMode.Top
    expect(layout.metrics.value.showAside).toBe(false)
    project.config.theme = 'dark'
    expect(layout.isDarkApp.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    layout.resetSettings()
    expect(project.config.theme).toBe('light')
    expect(project.config).toBe(config)
  })

  it('toggleCollapsed + setCollapsed 双向幂等', () => {
    const store = createProLayoutStore({ syncDocumentTheme: false })
    store.toggleCollapsed()
    expect(store.config.collapsed).toBe(true)
    store.toggleCollapsed()
    expect(store.config.collapsed).toBe(false)
    store.setCollapsed(true)
    store.setCollapsed(true) // no-op
    expect(store.config.collapsed).toBe(true)
  })

  it('setSetting 接受 partial + 等值守卫', () => {
    const store = createProLayoutStore({ syncDocumentTheme: false })
    store.setSetting('themeColor', '#fa8c16')
    expect(store.config.themeColor).toBe('#fa8c16')
    store.setSetting('themeColor', '#fa8c16') // no-op
    expect(store.config.themeColor).toBe('#fa8c16')
  })

  it('resetSettings 恢复默认', () => {
    const store = createProLayoutStore({ syncDocumentTheme: false })
    store.batchSetSetting({ themeColor: '#000', collapsed: true })
    store.resetSettings()
    expect(store.config.themeColor).toBe(defaultLayoutConfig().themeColor)
    expect(store.config.collapsed).toBe(false)
  })

  it('UI 临时态：openSettings / closeSettings / toggleMobileDrawer', () => {
    const store = createProLayoutStore({ syncDocumentTheme: false })
    store.openSettings()
    expect(store.ui.settingsVisible).toBe(true)
    store.closeSettings()
    expect(store.ui.settingsVisible).toBe(false)
    store.toggleMobileDrawer()
    expect(store.ui.mobileDrawer).toBe(true)
  })

  it('destroy 后 action 抛错', () => {
    const store = createProLayoutStore({ syncDocumentTheme: false })
    store.destroy()
    expect(store.destroyed).toBe(true)
    expect(() => store.toggleCollapsed()).toThrow()
  })

  it('主题切换联动 dark class', () => {
    if (typeof document === 'undefined') return
    const store = createProLayoutStore()
    store.setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    store.setTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('syncDocumentTheme: false 时不联动', () => {
    if (typeof document === 'undefined') return
    const store = createProLayoutStore({ syncDocumentTheme: false })
    store.setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('销毁共享文档主题的实例时恢复剩余实例，最后恢复原主题', () => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.add('dark')
    const a = createProLayoutStore({ defaults: { theme: 'light' } })
    const b = createProLayoutStore({ defaults: { theme: 'dark' } })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    b.destroy()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    a.destroy()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('isDarkSidebar / isDarkHeader / isDarkApp 派生正确', () => {
    const store = createProLayoutStore({
      syncDocumentTheme: false,
      defaults: { theme: 'light', sidebarTheme: 'dark', headerTheme: 'light' }
    })
    expect(store.isDarkApp.value).toBe(false)
    expect(store.isDarkSidebar.value).toBe(true)
    expect(store.isDarkHeader.value).toBe(false)

    store.setTheme('dark')
    expect(store.isDarkApp.value).toBe(true)
    expect(store.isDarkSidebar.value).toBe(true)
    expect(store.isDarkHeader.value).toBe(true)
  })

  it('两次创建返回不同实例（无全局单例）', () => {
    const a = createProLayoutStore({ syncDocumentTheme: false })
    const b = createProLayoutStore({ syncDocumentTheme: false })
    expect(a).not.toBe(b)
    a.setCollapsed(true)
    expect(b.config.collapsed).toBe(false)
  })
})
