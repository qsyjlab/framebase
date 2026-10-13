import { computed, inject } from 'vue'
import { proLayoutStoreKey } from './use-pro-layout'
import { resolveLayoutPrimaryStyle } from './utils'
import { proLayoutThemeBindingKey } from './theme'

// 弹出菜单 teleport 到 body 后无法继承布局局部主题，显式传入其变量。
export function useNavigationStyle(
  area: 'header' | 'sidebar' | (() => 'header' | 'sidebar') = 'sidebar'
) {
  const store = inject(proLayoutStoreKey, undefined)
  const binding = inject(proLayoutThemeBindingKey, undefined)
  return computed(() => {
    if (!store) return {}
    const target = typeof area === 'function' ? area() : area
    const dark =
      store.config.theme === 'dark' ||
      (target === 'header' ? store.config.headerTheme : store.config.sidebarTheme) === 'dark'
    return {
      ...(binding?.value !== false ? resolveLayoutPrimaryStyle(store.config.themeColor) : {}),
      '--el-menu-bg-color': dark ? store.config.darkMenuBackground : '#fff',
      '--el-menu-text-color': dark ? 'rgba(255,255,255,.86)' : '#47536b',
      '--el-menu-hover-bg-color': dark ? 'rgba(255,255,255,.1)' : '#f4f6fa',
      '--el-menu-active-color': 'var(--el-color-primary)',
      '--el-bg-color-overlay': dark ? store.config.darkMenuBackground : '#fff',
      '--el-border-color-light': dark ? 'rgba(255,255,255,.12)' : '#e4e9f2'
    }
  })
}
