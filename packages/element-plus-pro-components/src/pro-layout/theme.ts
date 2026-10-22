import { computed, getCurrentScope, onScopeDispose, toValue, watch } from 'vue'
import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue'
import type { LayoutConfig } from './types'
import { useProLayout } from './use-pro-layout'
import { resolveLayoutPrimaryStyle } from './utils'

export type ProLayoutThemeVars = Record<string, string>
export type ProLayoutThemeTarget = MaybeRefOrGetter<HTMLElement | null | undefined>

/** 内部子组件跟随最近的 Layout，外部接管时不重复绑定应用主题。 */
export const proLayoutThemeBindingKey: InjectionKey<ComputedRef<boolean>> = Symbol(
  'pro-layout-theme-binding'
)

/** 纯函数：同一份主题变量可用于 Layout、外部容器或 html。 */
export function resolveProLayoutThemeVars(config: LayoutConfig): ProLayoutThemeVars {
  const dark = config.theme === 'dark'
  const primary = resolveLayoutPrimaryStyle(config.themeColor)
  const surfaces = {
    '--el-bg-color': dark ? '#172036' : '#ffffff',
    '--el-bg-color-overlay': dark ? '#1d2940' : '#ffffff',
    '--el-bg-color-page': dark ? '#101827' : '#f4f6fa',
    '--el-text-color-primary': dark ? '#e6edf7' : '#0f1b33',
    '--el-text-color-regular': dark ? '#cbd5e1' : '#1f2a44',
    '--el-text-color-secondary': dark ? '#94a3b8' : '#47536b',
    '--el-text-color-placeholder': dark ? '#64748b' : '#8a94ab',
    '--el-text-color-disabled': dark ? '#64748b' : '#8a94ab',
    '--el-border-color': dark ? '#334155' : '#e4e9f2',
    '--el-border-color-light': dark ? '#2a374d' : '#e4e9f2',
    '--el-border-color-lighter': dark ? '#25324a' : '#f1f5f9',
    '--el-border-color-dark': dark ? '#475569' : '#cbd5e4',
    '--el-fill-color': dark ? '#25324a' : '#f1f5f9',
    '--el-fill-color-light': dark ? '#202d43' : '#f1f5f9',
    '--el-fill-color-lighter': dark ? '#1d2940' : '#f8fafc',
    '--el-fill-color-blank': dark ? '#172036' : '#ffffff'
  }
  // Framebase 组件也会直接消费这些 token，不能只覆盖 Element Plus。
  const aliases: Record<string, string> = {
    bg: 'bg-color',
    'bg-page': 'bg-color-page',
    'bg-overlay': 'bg-color-overlay',
    'bg-muted': 'fill-color',
    'bg-subtle': 'fill-color-lighter',
    'fill-light': 'fill-color-light',
    'fill-lighter': 'fill-color-lighter',
    'text-primary': 'text-color-primary',
    'text-regular': 'text-color-regular',
    'text-secondary': 'text-color-secondary',
    'text-placeholder': 'text-color-placeholder',
    'text-disabled': 'text-color-disabled',
    'text-muted': 'text-color-secondary',
    border: 'border-color',
    'border-light': 'border-color-light',
    'border-lighter': 'border-color-lighter',
    'border-strong': 'border-color-dark'
  }
  const framebase: ProLayoutThemeVars = {}
  for (const [name, token] of Object.entries(aliases))
    framebase[`--framebase-color-${name}`] = `var(--el-${token})`
  for (const [name, value] of Object.entries(primary))
    framebase[name.replace('--el-', '--framebase-')] = value

  return {
    'color-scheme': dark ? 'dark' : 'light',
    ...primary,
    ...surfaces,
    ...framebase,
    '--framebase-color-primary-hover': 'var(--el-color-primary-dark-2)',
    '--framebase-color-primary-active': 'var(--el-color-primary-dark-2)',
    '--framebase-table-header-bg': 'var(--el-fill-color-lighter)',
    '--framebase-table-header-hover-bg': 'var(--el-fill-color-light)',
    '--framebase-table-header-text': 'var(--el-text-color-primary)',
    '--framebase-table-row-hover-bg': 'var(--el-fill-color-light)',
    '--framebase-table-current-row-bg': 'var(--el-color-primary-light-9)',
    '--framebase-table-stripe-bg': 'var(--el-fill-color-lighter)',
    '--framebase-table-border-color': 'var(--el-border-color-light)',
    '--pro-layout-page-bg': 'var(--el-bg-color-page)',
    '--pro-layout-text-regular': 'var(--el-text-color-regular)',
    '--pro-layout-text-secondary': 'var(--el-text-color-secondary)',
    '--pro-layout-text-placeholder': 'var(--el-text-color-placeholder)',
    '--pro-layout-heading-color': 'var(--el-text-color-primary)',
    '--pro-layout-line': 'var(--el-border-color-light)',
    '--pro-layout-surface': 'var(--el-bg-color)',
    '--pro-layout-surface-muted': 'var(--el-fill-color-lighter)',
    '--pro-layout-hover-bg': 'var(--el-fill-color-light)',
    '--pro-layout-fill': 'var(--el-fill-color)',
    '--pro-layout-aside-bg': 'var(--el-bg-color)',
    '--pro-layout-header-bg': 'var(--el-bg-color)',
    '--pro-layout-dark-menu-bg': config.darkMenuBackground,
    '--pro-layout-dark-text': 'rgba(255,255,255,.86)',
    '--pro-layout-dark-text-secondary': 'rgba(255,255,255,.68)',
    '--pro-layout-dark-border': 'rgba(255,255,255,.12)',
    '--pro-layout-dark-hover': 'rgba(255,255,255,.1)',
    '--pro-layout-dark-control-bg': 'rgba(255,255,255,.08)',
    '--pro-layout-menu-active-text-color': '#fff',
    '--pro-layout-menu-active-bg-color': 'var(--el-color-primary)',
    '--pro-layout-mix-divider':
      config.sidebarTheme === 'dark' ? 'rgba(255,255,255,.12)' : 'var(--el-border-color)',
    '--el-menu-active-color': 'var(--el-color-primary)'
  }
}

/** 可直接 :style="themeVars"；省略 config 时读取当前注入的 Layout store。 */
export function useProLayoutTheme(config?: MaybeRefOrGetter<LayoutConfig>) {
  const source = config ?? useProLayout().config
  return computed(() => resolveProLayoutThemeVars(toValue(source)))
}

/** 外部接管主题变量；默认绑定 html，不修改 dark class。支持响应式目标和手动停止。 */
export function bindProLayoutTheme(
  config: MaybeRefOrGetter<LayoutConfig>,
  target: ProLayoutThemeTarget = () =>
    typeof document === 'undefined' ? undefined : document.documentElement
) {
  const themeVars = useProLayoutTheme(config)
  const stopWatch = watch(
    [() => toValue(target), themeVars],
    ([element, vars], _previous, onCleanup) => {
      if (!element) return
      const original = Object.entries(vars).map(([key, value]) => {
        const oldValue = element.style.getPropertyValue(key)
        const priority = element.style.getPropertyPriority(key)
        element.style.setProperty(key, value)
        return { key, oldValue, priority, applied: element.style.getPropertyValue(key) }
      })
      onCleanup(() => {
        for (const { key, oldValue, priority, applied } of original) {
          // 不覆盖绑定期间由项目其它代码接管的值。
          if (
            element.style.getPropertyValue(key) !== applied ||
            element.style.getPropertyPriority(key)
          )
            continue
          if (oldValue) element.style.setProperty(key, oldValue, priority)
          else element.style.removeProperty(key)
        }
      })
    },
    { immediate: true, flush: 'sync' }
  )
  if (getCurrentScope()) onScopeDispose(stopWatch)
  return { themeVars, stop: stopWatch }
}
