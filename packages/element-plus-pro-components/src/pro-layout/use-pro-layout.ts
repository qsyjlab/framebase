import { hasInjectionContext, inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { ProLayoutStore } from './store'

export { defaultLayoutConfig, LayoutMode } from './types'
export { createProLayoutStore } from './store'

export type {
  LayoutConfig,
  LayoutMenuItem,
  LayoutBreadcrumbItem,
  LayoutTabItem,
  LayoutSettingsConfig,
  LayoutMetrics,
  LayoutTheme
} from './types'

export type { ProLayoutStore, ProLayoutUiState, CreateProLayoutStoreOptions } from './store'

export { resolveLayoutMetrics, resolveLayoutSplitMenus } from './utils'
export { layoutThemeSwatches, DARK_THEME_CLASS } from './types'

/**
 * 在组件树中暴露 ProLayout store 的 InjectionKey。
 *
 * `<ProLayout>` 会在自身作用域下 provide 自己持有的 store：
 * - 不传 `store` prop 时复用最近注入的实例，没有注入才内部创建；
 * - 传入 `store` prop 时是调用方创建的共享实例（多个 `<ProLayout>` 传同一个即可共享）。
 *
 * 后代组件用 {@link useProLayout} 读取「最近」一份。
 */
export const proLayoutStoreKey: InjectionKey<ProLayoutStore> = Symbol('pro-layout-store')

/**
 * 在当前组件作用域下 provide 一个 ProLayout store。
 * 必须在 setup() 或 provide 相关上下文内调用，
 * `<ProLayout>` 内部已经自动调用；嵌套隔离场景下再显式调用。
 */
export function provideProLayout(store: ProLayoutStore) {
  provide(proLayoutStoreKey, store)
  return store
}

/**
 * 从 provide/inject 中读取最近的 ProLayout store。
 * - 若当前组件已经被 `<ProLayout>` 包裹（或显式 provide），返回最近一份。
 * - 未提供 store 时抛错，避免业务误读另一份独立状态。
 * - 纯 TS 模块应读取项目持有的实例；也支持 app.runWithContext 下的应用级注入。
 */
export function useProLayout(): ProLayoutStore {
  const scoped = hasInjectionContext() ? inject(proLayoutStoreKey, undefined) : undefined
  if (scoped) return scoped
  throw new Error(
    '[ProLayout] 未提供 layout store，请传入 :store 或通过 proLayoutStoreKey 注入项目实例。'
  )
}

/**
 * 检查当前作用域是否存在 provide 的 store。
 * 主要用于区分「当前组件是不是真的被 ProLayout 包裹了」的场景。
 */
export function hasInjectedProLayout(): boolean {
  const scoped = hasInjectionContext() ? inject(proLayoutStoreKey, undefined) : undefined
  return scoped !== undefined
}
