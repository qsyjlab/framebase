/**
 * Hook 级别的全局默认配置。
 *
 * 定位：@framebase/vue 是 composable 包，不提供 UI 组件，因此本模块只暴露
 * inject/provide 原语与一个 `HookConfig` 类型。UI 层（如 pro-components 的
 * ProConfigProvider）可以通过 `provideHookConfig` 向下注入默认值，hook 内部
 * 通过 `useHookConfig()` 读取并与调用方传入的 options 合并（调用方参数优先）。
 *
 * 合并策略：调用方显式传入的选项 > 最近一层 provide 的配置 > 根级默认值。
 */
import {
  computed,
  inject,
  provide,
  toValue,
  type InjectionKey,
  type MaybeRefOrGetter,
  type Ref
} from 'vue'
import type { RequestExecuteOptions } from '../request'

/**
 * 请求相关默认配置，作用于 useRequest 与 usePagedList 的内部 useRequest。
 * 字段含义与 RequestOptions / RequestExecuteOptions 一致。
 */
export interface HookRequestConfig {
  /** 默认防抖时间（ms）。 */
  debounce?: number
  /** 默认重试次数。 */
  retry?: number
  /** 默认重试间隔（ms）或基于失败次数的函数。 */
  retryDelay?: RequestExecuteOptions['retryDelay']
}

/**
 * 分页相关默认配置，作用于 usePagination 与 usePagedList。
 */
export interface HookPaginationConfig {
  /** 默认初始页码，默认 1。 */
  defaultCurrent?: number
  /** 默认每页条数，默认 10。 */
  defaultPageSize?: number
}

/**
 * 分页列表请求（usePagedList）的默认配置。
 */
export interface HookPagedListConfig {
  /** 是否在挂载时自动发起首次请求，默认 true。 */
  immediate?: boolean
  /** 默认防抖时间（ms），覆盖 request.debounce。 */
  debounce?: number
}

export interface HookConfig {
  request?: HookRequestConfig
  pagination?: HookPaginationConfig
  pagedList?: HookPagedListConfig
}

export const hookConfigKey: InjectionKey<Readonly<Ref<HookConfig>>> =
  Symbol('framebase-hook-config')

const DEFAULT_CONFIG: HookConfig = {
  pagination: {
    defaultCurrent: 1,
    defaultPageSize: 10
  },
  pagedList: {
    immediate: true
  }
}

/**
 * 注入 hook 配置。若无上层 provide，返回基于内置默认值的只读 ref。
 */
export function useHookConfig(): Readonly<Ref<HookConfig>> {
  const injected = inject(hookConfigKey, undefined)
  if (injected) return injected
  return computed(() => DEFAULT_CONFIG)
}

/**
 * 向后代注入 hook 配置。
 *
 * @param config 配置对象，支持响应式 getter（MaybeRefOrGetter）。
 *   传入的配置会与父级配置深度合并（当前层覆盖父级同名字段）。
 * @returns 合并后的只读 ref，便于当前层读取。
 */
export function provideHookConfig(config: MaybeRefOrGetter<HookConfig>): Readonly<Ref<HookConfig>> {
  const parent = useHookConfig()
  const merged = computed<HookConfig>(() => {
    const parentValue = parent.value
    const current = toValue(config)
    return mergeHookConfig(parentValue, current)
  })
  provide(hookConfigKey, merged)
  return merged
}

/**
 * 在 hook 内部使用的合并工具：以 `defaults`（调用方传入）为高优先级，
 * 以全局配置为低优先级回退。返回 `undefined` 表示两边都未提供。
 */
export function resolveHookOption<T>(local: T | undefined, config: T | undefined): T | undefined {
  return local !== undefined ? local : config
}

export function mergeHookConfig(parent: HookConfig, current: HookConfig): HookConfig {
  return {
    request: mergeSection(parent.request, current.request),
    pagination: mergeSection(parent.pagination, current.pagination),
    pagedList: mergeSection(parent.pagedList, current.pagedList)
  }
}

function mergeSection<T extends object>(parent?: T, current?: T): T | undefined {
  if (!parent && !current) return undefined
  return { ...parent, ...current } as T
}
