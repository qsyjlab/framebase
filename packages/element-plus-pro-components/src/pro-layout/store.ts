import { computed, markRaw, reactive, watch } from 'vue'
import type { ComputedRef, Raw } from 'vue'
import { DARK_THEME_CLASS, LayoutMode, defaultLayoutConfig } from './types'
import type {
  LayoutConfig,
  LayoutMetrics,
  LayoutMode as LayoutModeType,
  LayoutTheme
} from './types'
import { resolveLayoutMetrics } from './utils'

/**
 * 单一布局 store 实例暴露的全部能力。
 *
 * - `config` 是完整 {@link LayoutConfig} 的响应式对象，可直接复用项目配置；
 * - `ui` 是 UI 临时态（设置抽屉可见性、移动端 drawer）；
 * - `metrics` 是从 config 派生的渲染度量；
 * - 暴露的主题派生用于控制根容器 class；
 * - action 同时支持细粒度 setter（如 `setCollapsed`）和聚合入口（`setSetting`）。
 *
 * Store 内仅持有状态与方法，不绑定任何组件实例。
 * `<ProLayout>` 没有 prop 或注入的外部实例时，内部创建独立 store；
 * 需要共享时，用 {@link createProLayoutStore} 创建后通过 `store` prop 或注入复用。
 */
export interface ProLayoutStore {
  /** 当前布局配置（reactive） */
  readonly config: LayoutConfig
  /** 临时 UI 状态（reactive） */
  readonly ui: ProLayoutUiState
  /** 渲染度量（根据 config 派生） */
  readonly metrics: ComputedRef<LayoutMetrics>
  /** 应用是否处于深色主题 */
  readonly isDarkApp: ComputedRef<boolean>
  /** 侧栏是否实际为深色（应用主题 *或* 侧栏独立主题） */
  readonly isDarkSidebar: ComputedRef<boolean>
  /** 顶部是否实际为深色（应用主题 *或* 头部独立主题） */
  readonly isDarkHeader: ComputedRef<boolean>
  /** 是否为混合侧栏（SideMix） */
  readonly isMixSidebar: ComputedRef<boolean>
  /** 是否应该展示侧栏 */
  readonly showAside: ComputedRef<boolean>

  // 折叠
  setCollapsed: (value: boolean) => void
  toggleCollapsed: () => void

  // 布局模式
  setLayoutMode: (mode: LayoutModeType) => void

  // 主题
  setTheme: (theme: LayoutTheme) => void
  setSidebarTheme: (theme: LayoutTheme) => void
  setHeaderTheme: (theme: LayoutTheme) => void
  setThemeColor: (color: string) => void
  setDarkMenuBackground: (color: string) => void

  // 尺寸
  setAsideWidth: (width: number) => void
  setHeaderHeight: (height: number) => void
  setTabHeight: (height: number) => void
  setFooterHeight: (height: number) => void

  // 显示
  setShowBreadcrumb: (value: boolean) => void
  setShowTabs: (value: boolean) => void
  setShowFooter: (value: boolean) => void
  setSplitMenu: (value: boolean) => void
  setShowEmptySplitSidebar: (value: boolean) => void
  setSideMixFixedMenu: (value: boolean) => void

  // 通用 setter / 重置
  setSetting: <K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) => void
  batchSetSetting: (patch: Partial<LayoutConfig>) => void
  resetSettings: () => void

  // UI 临时态
  openSettings: () => void
  closeSettings: () => void
  toggleSettings: () => void
  setMobileDrawer: (value: boolean) => void
  toggleMobileDrawer: () => void

  /** 释放全局副作用（document 上的 dark class 等）。可重复调用，幂等。 */
  destroy: () => void
  /** 该 store 是否已经被销毁 */
  readonly destroyed: boolean
}

/** UI 临时态结构 */
export interface ProLayoutUiState {
  settingsVisible: boolean
  mobileDrawer: boolean
}

export interface CreateProLayoutStoreOptions {
  /** 直接使用项目持有的完整配置，不复制；建议传入 reactive / Pinia 中的配置对象 */
  config?: LayoutConfig
  /** 没有传入 config 时覆盖默认配置，初次构造时合并 */
  defaults?: Partial<LayoutConfig>
  /** 同步应用主题到 `document.documentElement` 的 dark class；默认 `true` */
  syncDocumentTheme?: boolean
}

// 只有显式同步文档主题的 store 才参与全局主题管理；销毁后恢复此前状态。
const documentThemeOwners = new Map<object, LayoutTheme>()
let originalDocumentDark = false
function applyDocumentTheme() {
  if (typeof document === 'undefined') return
  const themes = [...documentThemeOwners.values()]
  const last = themes[themes.length - 1]
  document.documentElement.classList.toggle(
    DARK_THEME_CLASS,
    last ? last === 'dark' : originalDocumentDark
  )
}

/**
 * 创建一个 ProLayout store。
 * - 独立场景：没有外部实例时，每个 `<ProLayout>` 内部各创建一份。
 * - 共享场景：调用方创建一份后通过 `store` prop 或注入传给多个 `<ProLayout>`，
 *   即可实现多实例共享同一份布局配置。
 * - 用于 SSR / 多根应用：每个根组件创建一份，天然隔离。
 */
export function createProLayoutStore(
  options: CreateProLayoutStoreOptions = {}
): Raw<ProLayoutStore> {
  const { defaults, syncDocumentTheme = true } = options

  const config = reactive<LayoutConfig>(
    options.config ?? { ...defaultLayoutConfig(), ...defaults }
  ) as LayoutConfig

  const ui = reactive<ProLayoutUiState>({
    settingsVisible: false,
    mobileDrawer: false
  })

  let destroyed = false
  const themeOwner = {}

  function ensureAlive() {
    if (destroyed) throw new Error('[ProLayout] store 已销毁，无法调用 action。')
  }

  /**
   * 把应用主题同步到 document.documentElement。
   * 默认开启；嵌套场景可通过 `syncDocumentTheme: false` 关闭。
   */
  function syncDocument(value: LayoutTheme) {
    if (!syncDocumentTheme) return
    if (typeof document === 'undefined') return
    if (documentThemeOwners.size === 0)
      originalDocumentDark = document.documentElement.classList.contains(DARK_THEME_CLASS)
    documentThemeOwners.delete(themeOwner)
    documentThemeOwners.set(themeOwner, value)
    applyDocumentTheme()
  }

  // 计算属性
  const metrics = computed<LayoutMetrics>(() =>
    resolveLayoutMetrics({
      layoutMode: config.layoutMode,
      collapsed: config.collapsed,
      asideWidth: config.asideWidth,
      collapsedWidth: 60,
      mixWidth: 60,
      splitMenu: config.splitMenu,
      showEmptySplitSidebar: config.showEmptySplitSidebar,
      sideMixFixedMenu: config.sideMixFixedMenu,
      showHeader: true,
      showAside: true,
      showTabs: config.showTabs,
      showFooter: config.showFooter,
      headerHeight: config.headerHeight,
      tabHeight: config.tabHeight,
      splitMenuHasChildren: true
    })
  )
  const isDarkApp = computed(() => config.theme === 'dark')
  const isDarkSidebar = computed(() => isDarkApp.value || config.sidebarTheme === 'dark')
  const isDarkHeader = computed(() => isDarkApp.value || config.headerTheme === 'dark')
  const isMixSidebar = computed(() => config.layoutMode === LayoutMode.SideMix)
  const showAside = computed(() => metrics.value.showAside)

  // actions
  function setCollapsed(value: boolean) {
    ensureAlive()
    if (config.collapsed === value) return
    config.collapsed = value
  }
  function toggleCollapsed() {
    setCollapsed(!config.collapsed)
  }

  function setLayoutMode(mode: LayoutModeType) {
    ensureAlive()
    config.layoutMode = mode
  }

  function setTheme(theme: LayoutTheme) {
    ensureAlive()
    if (config.theme === theme) return
    config.theme = theme
  }
  function setSidebarTheme(theme: LayoutTheme) {
    ensureAlive()
    config.sidebarTheme = theme
  }
  function setHeaderTheme(theme: LayoutTheme) {
    ensureAlive()
    config.headerTheme = theme
  }
  function setThemeColor(color: string) {
    ensureAlive()
    config.themeColor = color
  }
  function setDarkMenuBackground(color: string) {
    ensureAlive()
    config.darkMenuBackground = color
  }

  function setAsideWidth(width: number) {
    ensureAlive()
    config.asideWidth = Math.max(160, Math.round(width))
  }
  function setHeaderHeight(height: number) {
    ensureAlive()
    config.headerHeight = Math.max(40, Math.round(height))
  }
  function setTabHeight(height: number) {
    ensureAlive()
    config.tabHeight = Math.max(28, Math.round(height))
  }
  function setFooterHeight(height: number) {
    ensureAlive()
    config.footerHeight = Math.max(32, Math.round(height))
  }

  function setShowBreadcrumb(value: boolean) {
    ensureAlive()
    config.showBreadcrumb = value
  }
  function setShowTabs(value: boolean) {
    ensureAlive()
    config.showTabs = value
  }
  function setShowFooter(value: boolean) {
    ensureAlive()
    config.showFooter = value
  }
  function setSplitMenu(value: boolean) {
    ensureAlive()
    config.splitMenu = value
  }
  function setShowEmptySplitSidebar(value: boolean) {
    ensureAlive()
    config.showEmptySplitSidebar = value
  }
  function setSideMixFixedMenu(value: boolean) {
    ensureAlive()
    config.sideMixFixedMenu = value
  }

  function setSetting<K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) {
    ensureAlive()
    if (config[key] === value) return
    Object.assign(config, { [key]: value })
  }
  function batchSetSetting(patch: Partial<LayoutConfig>) {
    ensureAlive()
    for (const key of Object.keys(patch) as Array<keyof LayoutConfig>) {
      const next = patch[key]
      if (next === undefined) continue
      setSetting(key, next as LayoutConfig[typeof key])
    }
  }
  function resetSettings() {
    ensureAlive()
    const fresh = defaultLayoutConfig()
    Object.assign(config, fresh)
  }

  function openSettings() {
    ensureAlive()
    ui.settingsVisible = true
  }
  function closeSettings() {
    ensureAlive()
    ui.settingsVisible = false
  }
  function toggleSettings() {
    ensureAlive()
    ui.settingsVisible = !ui.settingsVisible
  }
  function setMobileDrawer(value: boolean) {
    ensureAlive()
    ui.mobileDrawer = value
  }
  function toggleMobileDrawer() {
    ensureAlive()
    ui.mobileDrawer = !ui.mobileDrawer
  }

  function destroy() {
    if (destroyed) return
    destroyed = true
    stopThemeWatch()
    if (syncDocumentTheme && typeof document !== 'undefined') {
      documentThemeOwners.delete(themeOwner)
      applyDocumentTheme()
    }
  }

  // 项目直接修改配置时也同步主题；销毁时释放监听。
  const stopThemeWatch = watch(() => config.theme, syncDocument, { immediate: true, flush: 'sync' })

  // 放入 Pinia / reactive 项目 store 时保留实例及 ComputedRef，不被深层解包。
  return markRaw({
    config,
    ui,
    metrics,
    isDarkApp,
    isDarkSidebar,
    isDarkHeader,
    isMixSidebar,
    showAside,
    setCollapsed,
    toggleCollapsed,
    setLayoutMode,
    setTheme,
    setSidebarTheme,
    setHeaderTheme,
    setThemeColor,
    setDarkMenuBackground,
    setAsideWidth,
    setHeaderHeight,
    setTabHeight,
    setFooterHeight,
    setShowBreadcrumb,
    setShowTabs,
    setShowFooter,
    setSplitMenu,
    setShowEmptySplitSidebar,
    setSideMixFixedMenu,
    setSetting,
    batchSetSetting,
    resetSettings,
    openSettings,
    closeSettings,
    toggleSettings,
    setMobileDrawer,
    toggleMobileDrawer,
    destroy,
    get destroyed() {
      return destroyed
    }
  })
}
