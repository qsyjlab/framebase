<template>
  <div :id="layoutId" class="pro-layout" :class="rootClass" :style="rootStyle">
    <!-- 移动端 drawer：始终渲染，由 store 控制显隐 -->
    <el-drawer
      v-model="mobileDrawerSync"
      class="pro-layout__mobile-drawer"
      :class="{ 'is-dark-navigation': isDarkSidebar }"
      :style="themeStyle"
      direction="ltr"
      :with-header="false"
      :size="mobileDrawerSize"
      :append-to-body="!height"
      :lock-scroll="!height"
      :modal-class="height ? 'pro-layout__drawer-overlay' : undefined"
    >
      <ProLayoutLogo
        :title="title"
        :logo="logo"
        :logo-width="logoWidth"
        :width="config.asideWidth"
        :height="config.headerHeight"
        :show-title="showLogoTitle"
      />
      <slot name="mobile-menu" v-bind="menuSlotProps">
        <el-menu
          :default-active="localActiveMenuKey"
          :router="router"
          class="pro-layout-menu"
          :popper-class="'pro-layout-menu__popper'"
          @select="onElMenuSelect"
        >
          <ProLayoutMenuItem
            v-for="menu in normalizedMenus"
            :key="menu.key"
            :item="menu"
            :router="router"
          />
        </el-menu>
      </slot>
    </el-drawer>

    <!-- 侧栏（Side 全量；TopMix 未开 splitMenu 全量、开启后为分割子菜单） -->
    <slot name="aside" v-bind="menuSlotProps">
      <ProLayoutAside
        v-if="metrics.showAside && config.layoutMode !== 'sideMix' && !isMobile"
        class="pro-layout-navigation"
        :class="{ 'is-dark-navigation': isDarkSidebar }"
        :layout-mode="config.layoutMode"
        :collapsed="config.collapsed"
        :collapsible="true"
        :width="metrics.asideWidth"
        :aside-width="config.asideWidth"
        :collapsed-width="60"
        :mix-width="60"
        :aside-padding-top="metrics.asidePaddingTop"
        :header-height="config.headerHeight"
        :is-dark-sidebar="isDarkSidebar"
        :title="title"
        :logo="logo"
        :logo-width="logoWidth"
        :logo-show-title="showLogoTitle"
        :mix-logo-width="46"
        :menus="asideMenus"
        :active-key="localActiveMenuKey"
        :router="router"
        :unique-opened="true"
        :toggle-collapsed="toggleCollapsed"
        @select="onElMenuSelect"
      >
        <template v-for="name in asideSlotNames" :key="name" #[name]="slotData">
          <slot
            :name="
              name === 'menu'
                ? $slots['aside-menu']
                  ? 'aside-menu'
                  : 'menu'
                : name === 'trigger'
                  ? 'aside-trigger'
                  : name
            "
            v-bind="slotData ?? menuSlotProps"
          />
        </template>
      </ProLayoutAside>

      <!-- SideMix 模式：图标列 + 子菜单面板 -->
      <ProLayoutMixSidebar
        v-if="config.layoutMode === 'sideMix' && !isMobile"
        class="pro-layout-navigation"
        :class="{ 'is-dark-navigation': isDarkSidebar }"
        :title="title"
        :logo="logo"
        :logo-width="46"
        :width="60"
        :aside-width="config.asideWidth"
        :header-height="config.headerHeight"
        :menus="normalizedMenus"
        :active-key="localActiveMenuKey"
        :fixed="config.sideMixFixedMenu"
        :router="router"
        @select="onMenuSelect"
        @update:fixed="onSideMixFixedChange"
        @children-visible="mixChildrenVisible = $event"
      >
        <template v-if="$slots.logo" #logo><slot name="logo" v-bind="defaultSlotProps" /></template>
      </ProLayoutMixSidebar>
    </slot>

    <!-- 头部 -->
    <slot v-if="showHeader" name="header" v-bind="menuSlotProps">
      <ProLayoutHeader
        v-if="showHeader"
        :active-key="
          config.layoutMode === 'topMix' && config.splitMenu ? activeRootKey : localActiveMenuKey
        "
        :layout-mode="config.layoutMode"
        :is-mobile="isMobile"
        :collapsed="config.collapsed"
        :header-height="config.headerHeight"
        :header-padding-left="metrics.headerPaddingLeft"
        :header-z-index="metrics.headerZIndex"
        :logo-box-width="logoBoxWidth"
        :title="title"
        :logo="logo"
        :logo-width="logoWidth"
        :logo-show-title="showLogoTitle"
        :show-breadcrumb="config.showBreadcrumb"
        :show-breadcrumb-icon="showBreadcrumbIcon"
        :breadcrumbs="breadcrumbs"
        :menus="config.layoutMode === 'topMix' ? topLevelMenus : menus"
        :router="router"
        :split-menu="config.splitMenu"
        :theme="config.theme"
        :is-dark-header="isDarkHeader"
        :show-notification="showNotification"
        :show-fullscreen="showFullscreen"
        :show-theme-toggle="showThemeToggle"
        :show-setting-button="showSettings && showSettingButton"
        :show-user-menu="showUserMenu"
        :user-name="userName"
        :user-avatar="userAvatar"
        @mobile-drawer="openMobileDrawer"
        @toggle-setting="openSettings"
        @toggle-theme="onToggleTheme"
        @user-command="onUserCommand"
        @notification-click="onNotificationClick"
        @select="onElMenuSelect"
      >
        <!-- 透传 header 的所有插槽 -->
        <template v-for="name in headerSlotNames" :key="name" #[name]="slotData">
          <slot :name="name" v-bind="slotData ?? {}" />
        </template>
      </ProLayoutHeader>
    </slot>

    <!-- 标签栏 -->
    <div v-if="config.showTabs" class="pro-layout__tabs" :style="tabsStyle">
      <slot name="tabs" v-bind="tabsSlotProps">
        <ProLayoutTabs
          :tabs="normalizedTabs"
          :active-key="localActiveTabKey"
          :height="config.tabHeight"
          @change="onTabChange"
          @close="onTabClose"
          @action="(action, key, keys) => emit('tabAction', action, key, keys)"
          @reorder="keys => emit('tabReorder', keys)"
        />
      </slot>
    </div>

    <!-- 内容区 -->
    <main class="pro-layout__main" :style="mainStyle">
      <div class="pro-layout__content">
        <div class="pro-layout__body" :style="contentStyle">
          <slot v-bind="defaultSlotProps" />
          <div v-if="watermark" class="pro-layout__watermark" :style="watermarkStyle" />
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer v-if="config.showFooter" class="pro-layout__footer" :style="footerStyle">
      <slot name="footer" v-bind="defaultSlotProps">
        <ProLayoutFooter v-if="showFooterText" :height="config.footerHeight" :text="footerText" />
      </slot>
    </footer>

    <!-- 设置抽屉 -->
    <slot name="settings" v-bind="settingsSlotProps">
      <ProLayoutSettings
        v-if="showSettings"
        :visible="settingsVisible"
        :config="config"
        :theme-swatches="themeSwatches"
        :size="drawerSize"
        :contained="Boolean(height)"
        :bind-theme="bindTheme"
        @update:visible="closeSettings"
        @change="onSettingChange"
        @reset="onSettingReset"
      >
        <template v-if="$slots['settings-extra']" #default="slotData">
          <slot name="settings-extra" v-bind="slotData" />
        </template>
      </ProLayoutSettings>
    </slot>

    <!-- 返回顶部 -->
    <el-backtop
      v-if="showBackTop"
      :target="`#${layoutId} .pro-layout__content`"
      :style="{
        position: 'absolute',
        bottom: `${(config.showFooter ? config.footerHeight : 0) + 24}px`
      }"
      :right="24"
      :bottom="24"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useId,
  useSlots,
  watch
} from 'vue'
import { ElBacktop, ElDrawer, ElMenu } from 'element-plus'
import ProLayoutAside from './pro-layout-aside.vue'
import ProLayoutFooter from './pro-layout-footer.vue'
import ProLayoutHeader from './pro-layout-header.vue'
import ProLayoutMenuItem from './pro-layout-menu-item.vue'
import ProLayoutMixSidebar from './pro-layout-mix-sidebar.vue'
import ProLayoutSettings from './pro-layout-settings.vue'
import ProLayoutTabs from './pro-layout-tabs.vue'
import ProLayoutLogo from './pro-layout-logo.vue'
import './navigation.scss'
import { createProLayoutStore } from './store'
import { proLayoutThemeBindingKey, useProLayoutTheme } from './theme'
import type { ProLayoutStore } from './store'
import { proLayoutStoreKey, provideProLayout } from './use-pro-layout'
import { LayoutMode } from './types'
import type {
  LayoutBreadcrumbItem,
  LayoutConfig,
  LayoutMenuItem,
  LayoutSettingsConfig,
  LayoutTabItem,
  LayoutTheme
} from './types'
import {
  normalizeLayoutMenuItems,
  normalizeLayoutTabItems,
  normalizeLayoutSpacing,
  resolveLayoutSplitMenus,
  resolveLayoutMetrics,
  findLayoutMenu,
  findLayoutRootMenu
} from './utils'
import type { LayoutTabAction } from './utils'

defineOptions({ name: 'ProLayout' })

/**
 * Props 全部可选。
 * - 「受控」属性（带 v-model）通过 watch 双向同步到 store；
 * - 「非受控」属性直接作为初始值写入 store。
 */
const props = withDefaults(
  defineProps<{
    /** 外部传入的 store；传入后多个 `<ProLayout>` 共享同一份布局配置，不传则内部自建 */
    store?: ProLayoutStore
    /** 是否在布局及内置浮层上绑定主题变量；false 时继承外部主题 */
    bindTheme?: boolean

    // —— 受控 / 非受控 props ——
    layoutMode?: LayoutConfig['layoutMode']
    collapsed?: boolean
    asideWidth?: number
    headerHeight?: number
    tabHeight?: number
    footerHeight?: number
    showBreadcrumb?: boolean
    showTabs?: boolean
    showFooter?: boolean
    splitMenu?: boolean
    showEmptySplitSidebar?: boolean
    sideMixFixedMenu?: boolean
    theme?: LayoutTheme
    sidebarTheme?: LayoutTheme
    headerTheme?: LayoutTheme
    themeColor?: string
    darkMenuBackground?: string

    // —— 显示控制 ——
    height?: string
    showHeader?: boolean
    showBreadcrumbIcon?: boolean
    showNotification?: boolean
    showFullscreen?: boolean
    showThemeToggle?: boolean
    showSettings?: boolean
    showSettingButton?: boolean
    showBackTop?: boolean
    showFooterText?: boolean

    // —— 数据 + 受控 key ——
    title?: string
    logo?: string
    logoWidth?: number
    showLogoTitle?: boolean
    menus?: LayoutMenuItem[]
    activeKey?: string
    router?: boolean
    tabs?: LayoutTabItem[]
    activeTabKey?: string
    breadcrumbs?: LayoutBreadcrumbItem[]
    watermark?: string
    footerText?: string

    // —— 用户 / 通知 ——
    userName?: string
    userAvatar?: string
    showUserMenu?: boolean
    contentPadding?: number | string | boolean
    bodyStyle?: Record<string, string>
    themeSwatches?: string[]
    drawerSize?: string | number

    // —— 移动端 ——
    mobile?: boolean
    mobileBreakpoint?: number
  }>(),
  {
    collapsed: undefined,
    showBreadcrumb: undefined,
    showTabs: undefined,
    showFooter: undefined,
    splitMenu: undefined,
    showEmptySplitSidebar: undefined,
    sideMixFixedMenu: undefined,
    height: '',
    bindTheme: true,
    showHeader: true,
    showBreadcrumbIcon: true,
    showNotification: true,
    showFullscreen: true,
    showThemeToggle: true,
    showSettings: true,
    showSettingButton: true,
    showBackTop: false,
    showFooterText: true,
    title: '',
    logo: '',
    logoWidth: 36,
    showLogoTitle: true,
    menus: () => [],
    activeKey: '',
    router: false,
    tabs: () => [],
    activeTabKey: '',
    breadcrumbs: () => [],
    watermark: '',
    footerText: `© ${new Date().getFullYear()} Framebase`,
    userName: '管理员',
    userAvatar: '',
    showUserMenu: true,
    contentPadding: 16,
    bodyStyle: () => ({}),
    themeSwatches: () => [],
    drawerSize: '420px',
    mobile: false,
    mobileBreakpoint: 768
  }
)

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'update:layoutMode': [value: LayoutConfig['layoutMode']]
  'update:activeKey': [value: string]
  'update:activeTabKey': [value: string]
  'update:sideMixFixedMenu': [value: boolean]
  'update:theme': [value: LayoutTheme]
  'update:asideWidth': [value: number]
  'update:headerHeight': [value: number]
  'update:tabHeight': [value: number]
  'update:footerHeight': [value: number]
  'update:showBreadcrumb': [value: boolean]
  'update:showTabs': [value: boolean]
  'update:showFooter': [value: boolean]
  'update:splitMenu': [value: boolean]
  'update:showEmptySplitSidebar': [value: boolean]
  'update:sidebarTheme': [value: LayoutTheme]
  'update:headerTheme': [value: LayoutTheme]
  'update:themeColor': [value: string]
  'update:darkMenuBackground': [value: string]

  menuSelect: [key: string, item: LayoutMenuItem]
  tabChange: [key: string]
  tabClose: [key: string, index: number]
  tabAction: [action: LayoutTabAction, key: string, closeKeys: string[]]
  tabReorder: [keys: string[]]
  userCommand: [command: string]
  notificationClick: []
  settingChange: [
    key: keyof LayoutSettingsConfig,
    value: LayoutSettingsConfig[keyof LayoutSettingsConfig]
  ]
  settingReset: []
}>()

/** 显式 prop > 项目注入 > 组件内部实例；外部实例生命周期由项目管理。 */
const externalStore = props.store ?? inject(proLayoutStoreKey, undefined)
const store: ProLayoutStore =
  externalStore ?? createProLayoutStore({ syncDocumentTheme: !props.height })
const layoutId = `pro-layout-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

/**
 * 把 store 的 setting 同步到 props。
 * 通过计算 config 来 follow store。
 */
const config = computed(() => store.config)
const settingsVisible = computed(() => store.ui.settingsVisible)
const mixChildrenVisible = ref(false)
const metrics = computed(() =>
  resolveLayoutMetrics({
    ...config.value,
    collapsedWidth: 60,
    mixWidth: 60,
    showHeader: props.showHeader,
    showAside: !isMobile.value,
    splitMenuHasChildren:
      config.value.layoutMode === 'sideMix' ? mixChildrenVisible.value : splitMenus.value.length > 0
  })
)
const isDarkSidebar = computed(() => store.isDarkSidebar.value)
const isDarkHeader = computed(() => store.isDarkHeader.value)
const isDarkApp = computed(() => store.isDarkApp.value)

/* 把 props 的初值/变化同步进 store */
// 缺省配置由 store 提供；每个 prop 独立同步，避免一个 prop 更新重置整份设置。
const configPropKeys = [
  'layoutMode',
  'collapsed',
  'asideWidth',
  'headerHeight',
  'tabHeight',
  'footerHeight',
  'showBreadcrumb',
  'showTabs',
  'showFooter',
  'splitMenu',
  'showEmptySplitSidebar',
  'sideMixFixedMenu',
  'theme',
  'sidebarTheme',
  'headerTheme',
  'themeColor',
  'darkMenuBackground'
] as const
for (const key of configPropKeys) {
  watch(
    () => props[key],
    value => {
      if (value !== undefined) store.setSetting(key, value)
    },
    { immediate: true }
  )
  watch(
    () => store.config[key],
    value => {
      const update = emit as (
        event: `update:${keyof LayoutConfig}`,
        value: LayoutConfig[keyof LayoutConfig]
      ) => void
      update(`update:${key}`, value)
    }
  )
}

/* 把 store 的 config 变化反向写给 props，实现 v-model */

/* 移动端检测 */
const isMobile = ref(props.mobile)
let mediaQuery: MediaQueryList | undefined
function syncMobile() {
  isMobile.value = Boolean(props.mobile || mediaQuery?.matches)
}
function setupMediaQuery() {
  mediaQuery?.removeEventListener?.('change', syncMobile)
  mediaQuery = undefined
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    syncMobile()
    return
  }
  mediaQuery = window.matchMedia(`(max-width: ${Math.max(0, props.mobileBreakpoint - 1)}px)`)
  mediaQuery.addEventListener?.('change', syncMobile)
  syncMobile()
}

watch(
  () => props.mobile,
  () => setupMediaQuery()
)
watch(
  () => props.mobileBreakpoint,
  () => setupMediaQuery()
)
onMounted(setupMediaQuery)
onBeforeUnmount(() => {
  mediaQuery?.removeEventListener?.('change', syncMobile)
  if (!externalStore) store.destroy()
})

/* 受控 activeKey / activeTabKey：跟随 props；非受控时用本地 ref */
const localActiveMenuKey = ref(props.activeKey)
const localActiveTabKey = ref(props.activeTabKey)
watch(
  () => props.activeKey,
  v => (localActiveMenuKey.value = v)
)
watch(
  () => props.activeTabKey,
  v => (localActiveTabKey.value = v)
)

/* drawer */
const mobileDrawerSync = computed({
  get: () => isMobile.value && store.ui.mobileDrawer,
  set: (v: boolean) => store.setMobileDrawer(v)
})
watch(isMobile, v => {
  if (!v) store.setMobileDrawer(false)
})
function openMobileDrawer() {
  store.setMobileDrawer(true)
}

/* 派生数据 */
const slots = useSlots()
const normalizedMenus = computed(() => normalizeLayoutMenuItems(props.menus))
const normalizedTabs = computed(() => normalizeLayoutTabItems(props.tabs))
const splitMenus = computed(() =>
  resolveLayoutSplitMenus(normalizedMenus.value, localActiveMenuKey.value)
)
const asideMenus = computed(() => {
  if (config.value.layoutMode !== LayoutMode.TopMix) return normalizedMenus.value
  /* TopMix 未开启 splitMenu 时侧栏展示完整菜单；开启后仅展示当前一级的子菜单 */
  return config.value.splitMenu ? splitMenus.value : normalizedMenus.value
})
const topLevelMenus = computed(() =>
  normalizedMenus.value.map(m => ({ ...m, children: undefined }))
)
const activeRootKey = computed(
  () =>
    findLayoutRootMenu(normalizedMenus.value, localActiveMenuKey.value)?.key ??
    localActiveMenuKey.value
)
const logoBoxWidth = computed(() =>
  config.value.layoutMode === LayoutMode.TopMix ? config.value.asideWidth : 220
)
const mobileDrawerSize = computed(() => `min(${config.value.asideWidth}px, calc(100% - 48px))`)

const rootClass = computed(() => ({
  'is-collapsed': config.value.collapsed,
  'is-mobile': isMobile.value,
  'is-dark': isDarkApp.value,
  'is-dark-sidebar': isDarkSidebar.value,
  'is-dark-header': isDarkHeader.value,
  'is-fixed-header': props.height === '',
  'is-contained': Boolean(props.height)
}))

const themeVars = useProLayoutTheme(config)
const themeStyle = computed(() => (props.bindTheme ? themeVars.value : {}))
provide(
  proLayoutThemeBindingKey,
  computed(() => props.bindTheme)
)
const rootStyle = computed(() => ({
  ...themeStyle.value,
  ...(props.height ? { height: props.height, minHeight: '0' } : {}),
  '--pro-layout-header-height': `${config.value.headerHeight}px`,
  '--pro-layout-tab-height': `${config.value.tabHeight}px`,
  '--pro-layout-footer-height': `${config.value.footerHeight}px`,
  '--pro-layout-aside-width': `${metrics.value.asideWidth}px`
}))

const mainStyle = computed(() => ({
  paddingTop: `${metrics.value.mainPaddingTop}px`,
  paddingLeft: `${metrics.value.mainPaddingLeft}px`
}))
const contentStyle = computed(() => ({
  ...props.bodyStyle,
  padding: normalizeLayoutSpacing(props.contentPadding)
}))
const tabsStyle = computed(() => ({
  top: `${metrics.value.tabTop}px`,
  height: `${config.value.tabHeight}px`,
  paddingLeft: `${metrics.value.mainPaddingLeft}px`
}))
const footerStyle = computed(() => ({
  height: `${config.value.footerHeight}px`,
  paddingLeft: `${metrics.value.mainPaddingLeft}px`
}))

const watermarkStyle = computed(() => {
  const text = (props.watermark ?? '').replace(/[<>&"]/g, '')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140'><text x='18' y='90' font-size='14' fill='rgba(0,0,0,0.06)' transform='rotate(-22 110 70)'>${text}</text></svg>`
  return { backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")` }
})

/* 透传到插槽的载荷 */
const defaultSlotProps = computed(() => ({
  layoutMode: config.value.layoutMode,
  collapsed: config.value.collapsed,
  isMobile: isMobile.value,
  asideWidth: metrics.value.asideWidth,
  headerHeight: config.value.headerHeight,
  theme: config.value.theme,
  themeColor: config.value.themeColor,
  toggleCollapsed,
  setCollapsed: store.setCollapsed
}))

const menuSlotProps = computed(() => ({
  ...defaultSlotProps.value,
  menus: normalizedMenus.value,
  activeKey: localActiveMenuKey.value
}))

const tabsSlotProps = computed(() => ({
  ...defaultSlotProps.value,
  tabs: normalizedTabs.value,
  activeKey: localActiveTabKey.value
}))

const settingsSlotProps = computed(() => ({
  ...defaultSlotProps.value,
  visible: settingsVisible.value,
  open: openSettings,
  close: closeSettings
}))

/* 透传 header 的插槽白名单 */
const HEADER_SLOT_WHITELIST = [
  'header-left',
  'logo',
  'breadcrumb',
  'header-menu',
  'header-right',
  'notification',
  'fullscreen',
  'theme-toggle',
  'setting-button',
  'user-menu',
  'header-actions'
]
const headerSlotNames = computed(() =>
  Object.keys(slots).filter(name => HEADER_SLOT_WHITELIST.includes(name))
)
const asideSlotNames = computed(() =>
  ['logo', 'menu', 'trigger'].filter(name =>
    name === 'menu'
      ? slots['aside-menu'] || slots.menu
      : slots[name === 'trigger' ? 'aside-trigger' : name]
  )
)

/* Actions */
function toggleCollapsed() {
  store.toggleCollapsed()
}
function openSettings() {
  store.openSettings()
}
function closeSettings() {
  store.closeSettings()
}

function onMenuSelect(key: string, item: LayoutMenuItem) {
  localActiveMenuKey.value = key
  emit('update:activeKey', key)
  emit('menuSelect', key, item)
  if (isMobile.value) store.setMobileDrawer(false)
}

/** el-menu 的 @select 适配器，转为我们的事件格式 */
function onElMenuSelect(index: string) {
  const item = findLayoutMenu(normalizedMenus.value, index)
  if (item) onMenuSelect(item.key, item)
}

function onTabChange(key: string) {
  if (localActiveTabKey.value === key) return
  localActiveTabKey.value = key
  emit('update:activeTabKey', key)
  emit('tabChange', key)
}

function onTabClose(key: string, index: number) {
  emit('tabClose', key, index)
}

function onSideMixFixedChange(v: boolean) {
  store.setSideMixFixedMenu(v)
}

function onToggleTheme() {
  const next: LayoutTheme = config.value.theme === 'light' ? 'dark' : 'light'
  store.setTheme(next)
}

function onUserCommand(command: string) {
  emit('userCommand', command)
}

function onNotificationClick() {
  emit('notificationClick')
}

function onSettingChange(
  key: keyof LayoutSettingsConfig,
  value: LayoutSettingsConfig[keyof LayoutSettingsConfig]
) {
  // store 实际承载的字段：LayoutSettingsConfig 与 LayoutConfig 同名同义。
  store.setSetting(key as keyof LayoutConfig, value as never)
  emit('settingChange', key, value)
}

function onSettingReset() {
  store.resetSettings()
  emit('settingReset')
}

/* 暴露给父级 */
provideProLayout(store)

defineExpose({
  store,
  metrics,
  toggleCollapsed,
  openSettings,
  closeSettings
})
</script>

<style scoped lang="scss">
.pro-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  color: var(--pro-layout-text-regular);
  background-color: var(--pro-layout-page-bg, var(--el-bg-color-page, #f4f6fa));

  :deep(.is-dark-navigation) {
    --pro-layout-aside-bg: var(--pro-layout-dark-menu-bg);
    --pro-layout-text-regular: var(--pro-layout-dark-text);
    --pro-layout-text-secondary: var(--pro-layout-dark-text-secondary);
    --pro-layout-line: var(--pro-layout-dark-border);
    --pro-layout-surface-muted: var(--pro-layout-dark-control-bg);
    --pro-layout-hover-bg: var(--pro-layout-dark-hover);
    --pro-layout-heading-color: var(--el-color-white);

    .el-menu {
      --el-menu-bg-color: transparent;
      --el-menu-text-color: var(--pro-layout-text-regular);
      --el-menu-hover-text-color: var(--el-color-white);
      --el-menu-hover-bg-color: var(--pro-layout-dark-hover);
      --el-menu-active-color: #fff;
    }
  }

  :deep(.pro-layout-header.is-dark) {
    --pro-layout-header-bg: var(--pro-layout-dark-menu-bg);
    --pro-layout-text-regular: var(--pro-layout-dark-text);
    --pro-layout-line: var(--pro-layout-dark-border);
    --pro-layout-hover-bg: var(--pro-layout-dark-hover);
  }

  /* 容器模式：导航相对实例定位；滚动由内容区统一负责。 */
  &.is-contained {
    min-height: 0;
    overflow: hidden;
    isolation: isolate;

    :deep(.pro-layout__drawer-overlay) {
      position: absolute;
      inset: 0;
    }

    :deep(.pro-layout-header) {
      position: absolute;
    }
    :deep(.pro-layout-aside) {
      position: absolute;
      height: 100%;
    }
    :deep(.pro-layout-mix-sidebar) {
      position: absolute;
      height: 100%;
    }
    :deep(.pro-layout-mix-menu) {
      .pro-layout-mix-menu__children {
        position: absolute;
        height: 100%;
      }
    }
    .pro-layout__tabs {
      position: absolute;
    }
  }

  &__tabs {
    position: fixed;
    right: 0;
    left: 0;
    z-index: 999;
    box-sizing: border-box;
    background-color: var(--pro-layout-header-bg);
    border-bottom: 1px solid var(--pro-layout-line);
    transition: padding-left 0.2s ease-in-out;
  }

  &__main {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    box-sizing: border-box;
    transition: padding 0.2s ease-in-out;
  }

  &__content {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
  }

  &__body {
    position: relative;
    min-width: 0;
    min-height: 100%;
    box-sizing: border-box;
  }

  &__footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    background-color: transparent;
  }

  &__watermark {
    position: absolute;
    z-index: 5;
    inset: 0;
    pointer-events: none;
    background-repeat: repeat;
  }
}
</style>
