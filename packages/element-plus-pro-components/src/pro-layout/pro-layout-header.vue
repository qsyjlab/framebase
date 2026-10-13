<template>
  <header
    class="pro-layout-header"
    :class="{ 'is-top-mode': isTopMode, 'is-dark': isDarkHeader }"
    :style="wrapperStyle"
  >
    <div class="pro-layout-header__left" :class="{ 'is-top-mode': isTopMode }">
      <slot name="header-left">
        <el-tooltip v-if="isMobile" effect="dark" content="打开导航菜单" placement="bottom">
          <button
            class="pro-layout-header__control"
            aria-label="打开导航菜单"
            type="button"
            @click="emit('mobile-drawer')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </svg>
          </button>
        </el-tooltip>

        <slot name="logo">
          <ProLayoutLogo
            v-if="showHeaderLogo && !isMobile"
            :title="title"
            :logo="logo"
            :logo-width="logoWidth"
            :width="logoBoxWidth"
            :height="headerHeight"
            :show-title="logoShowTitle"
          />
        </slot>

        <slot name="breadcrumb">
          <div v-if="breadcrumbVisible" class="pro-layout-header__breadcrumb">
            <ProLayoutBreadcrumb :items="breadcrumbs" :show-icon="showBreadcrumbIcon" />
          </div>
        </slot>

        <div
          v-if="horizontalMenuVisible && !isMobile"
          class="pro-layout-header__horizontal-menu"
          :class="{ 'is-top-mode': isTopMode }"
        >
          <slot name="header-menu" :menus="menus" :active-key="activeKey">
            <el-menu
              mode="horizontal"
              :default-active="activeKey"
              :router="router"
              class="pro-layout-menu is-horizontal"
              :popper-class="'pro-layout-menu__popper'"
              :popper-style="navigationStyle"
              @select="key => emit('select', key)"
            >
              <ProLayoutMenuItem
                v-for="menu in topLevelMenus"
                :key="menu.key"
                :item="menu"
                mode="horizontal"
                :router="router"
              />
            </el-menu>
          </slot>
        </div>
      </slot>
    </div>

    <div class="pro-layout-header__right" :class="{ 'is-top-mode': isTopMode }">
      <slot name="header-right">
        <div class="pro-layout-header__actions">
          <slot name="notification">
            <el-popover
              v-if="showNotification"
              :width="320"
              placement="bottom"
              :show-arrow="false"
              trigger="click"
              :popper-style="surfaceStyle"
            >
              <template #reference>
                <button
                  class="pro-layout-header__control"
                  aria-label="消息通知"
                  type="button"
                  @click="emit('notification-click')"
                >
                  <el-badge is-dot>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10 21a2 2 0 0 0 4 0" />
                    </svg>
                  </el-badge>
                </button>
              </template>
              <div class="pro-layout-header__notification">
                <el-tabs v-model="notiTab">
                  <el-tab-pane label="通知" name="notification"></el-tab-pane>
                  <el-tab-pane label="消息" name="message"></el-tab-pane>
                  <el-tab-pane label="待办" name="todo"></el-tab-pane>
                </el-tabs>
              </div>
            </el-popover>
          </slot>

          <slot name="fullscreen">
            <el-tooltip
              v-if="showFullscreen"
              effect="dark"
              :content="isFullscreen ? '退出全屏' : '全屏'"
              placement="bottom"
            >
              <button
                class="pro-layout-header__control"
                :aria-label="isFullscreen ? '退出全屏' : '全屏'"
                type="button"
                @click="toggleFullscreen"
              >
                <svg
                  v-if="!isFullscreen"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 8V5a2 2 0 0 1 2-2h3" />
                  <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                  <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
                  <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                  <path d="M3 12h18" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9 3v4a1 1 0 0 1-1 1H4" />
                  <path d="M15 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M9 21v-4a1 1 0 0 0-1-1H4" />
                  <path d="M15 21v-4a1 1 0 0 1 1-1h4" />
                </svg>
              </button>
            </el-tooltip>
          </slot>

          <slot name="theme-toggle">
            <el-tooltip
              v-if="showThemeToggle"
              effect="dark"
              :content="theme === 'light' ? '切换为暗黑模式' : '切换为亮色模式'"
              placement="bottom"
            >
              <button
                class="pro-layout-header__control"
                :aria-label="theme === 'light' ? '切换为暗黑模式' : '切换为亮色模式'"
                type="button"
                @click="emit('toggle-theme')"
              >
                <svg
                  v-if="theme === 'light'"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path
                    d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
              </button>
            </el-tooltip>
          </slot>

          <slot name="setting-button">
            <el-tooltip
              v-if="showSettingButton"
              effect="dark"
              content="页面配置"
              placement="bottom"
            >
              <button
                class="pro-layout-header__control"
                aria-label="页面配置"
                type="button"
                @click="emit('toggle-setting')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                  />
                </svg>
              </button>
            </el-tooltip>
          </slot>

          <slot name="user-menu">
            <el-dropdown
              v-if="showUserMenu"
              :popper-style="surfaceStyle"
              class="pro-layout-header__user"
              @command="onUserCommand"
            >
              <button class="pro-layout-header__user-trigger" type="button">
                <el-avatar :size="28" :src="userAvatar">
                  <span v-if="!userAvatar">{{ userInitial }}</span>
                </el-avatar>
                <span class="pro-layout-header__user-name">{{ userName }}</span>
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人首页</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </slot>

          <slot name="header-actions" />
        </div>
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-required-prop-with-default */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ElAvatar,
  ElBadge,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElPopover,
  ElTabPane,
  ElTabs,
  ElTooltip
} from 'element-plus'
import ProLayoutBreadcrumb from './pro-layout-breadcrumb.vue'
import ProLayoutLogo from './pro-layout-logo.vue'
import ProLayoutMenuItem from './pro-layout-menu-item.vue'
import { LayoutMode } from './types'
import type {
  LayoutBreadcrumbItem,
  LayoutMenuItem,
  LayoutMode as LayoutModeType,
  LayoutTheme
} from './types'
import { resolveLayoutBrandInitial } from './utils'
import { useNavigationStyle } from './use-navigation-style'
import { useSurfaceStyle } from './use-surface-style'

defineOptions({ name: 'ProLayoutHeader' })

const props = withDefaults(
  defineProps<{
    layoutMode: LayoutModeType
    isMobile: boolean
    collapsed: boolean
    headerHeight: number
    headerPaddingLeft: number
    headerZIndex: number
    logoBoxWidth: number
    title: string
    logo: string
    logoWidth: number
    logoShowTitle: boolean
    showBreadcrumb: boolean
    showBreadcrumbIcon?: boolean
    breadcrumbs: LayoutBreadcrumbItem[]
    menus: LayoutMenuItem[]
    activeKey: string
    router: boolean
    splitMenu: boolean
    theme: LayoutTheme
    isDarkHeader: boolean
    showNotification: boolean
    showFullscreen: boolean
    showThemeToggle: boolean
    showSettingButton: boolean
    showUserMenu: boolean
    userName: string
    userAvatar: string
  }>(),
  {
    showBreadcrumbIcon: true,
    breadcrumbs: () => [],
    menus: () => []
  }
)

const emit = defineEmits<{
  'mobile-drawer': []
  'toggle-setting': []
  'toggle-theme': []
  'user-command': [command: string]
  'notification-click': []
  select: [key: string]
}>()

const isFullscreen = ref(false)
const navigationStyle = useNavigationStyle('header')
const surfaceStyle = useSurfaceStyle()
const notiTab = ref('notification')

function syncFullscreen() {
  isFullscreen.value = typeof document !== 'undefined' && Boolean(document.fullscreenElement)
}

async function toggleFullscreen() {
  if (typeof document === 'undefined') return
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    /* 受限静默 */
  }
}

onMounted(() => {
  syncFullscreen()
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', syncFullscreen)
  }
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('fullscreenchange', syncFullscreen)
  }
})

const isTopMode = computed(() => props.layoutMode === LayoutMode.Top)
const showHeaderLogo = computed(
  () => props.layoutMode === LayoutMode.Top || props.layoutMode === LayoutMode.TopMix
)
const breadcrumbVisible = computed(
  () =>
    props.showBreadcrumb &&
    !props.isMobile &&
    (props.layoutMode === LayoutMode.Side || props.layoutMode === LayoutMode.SideMix)
)
const horizontalMenuVisible = computed(
  () =>
    !props.isMobile &&
    (props.layoutMode === LayoutMode.Top ||
      (props.layoutMode === LayoutMode.TopMix && props.splitMenu))
)
const topLevelMenus = computed<LayoutMenuItem[]>(() =>
  props.layoutMode === LayoutMode.TopMix && props.splitMenu
    ? props.menus.map(m => ({ ...m, children: undefined }))
    : props.menus
)
const userInitial = computed(() => resolveLayoutBrandInitial(props.userName))

const wrapperStyle = computed(() => {
  const height = Math.max(0, Number(props.headerHeight) || 0)
  const menuInset = Math.min(6, height * 0.12)
  return {
    height: `${height}px`,
    paddingLeft: `${props.headerPaddingLeft + (props.headerPaddingLeft ? 12 : 0)}px`,
    zIndex: props.headerZIndex,
    '--pro-layout-header-height': `${height}px`,
    '--pro-layout-header-menu-height': `${Math.max(0, height - menuInset * 2)}px`,
    '--pro-layout-header-menu-icon-size': `${Math.min(18, height * 0.45)}px`,
    '--pro-layout-header-control-size': `${Math.min(32, height * 0.72)}px`,
    '--pro-layout-header-user-height': `${Math.min(36, height * 0.82)}px`,
    '--pro-layout-header-avatar-size': `${Math.min(32, height * 0.72)}px`
  }
})

function onUserCommand(command: string) {
  emit('user-command', command)
}
</script>

<style scoped lang="scss">
.pro-layout-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  width: auto;
  padding: 0 16px 0 12px;
  background-color: var(--pro-layout-header-bg);
  border-bottom: 1px solid var(--pro-layout-line);
  transition-property: padding-left, background-color, border-bottom-color, color;

  &.is-top-mode {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  &.is-dark {
    color: var(--pro-layout-dark-text);

    :deep(.el-menu) {
      --el-menu-bg-color: transparent;
      --el-menu-text-color: var(--pro-layout-dark-text);
      --el-menu-hover-text-color: var(--el-color-white);
      --el-menu-hover-bg-color: var(--pro-layout-dark-hover);
      --el-menu-active-color: var(--el-color-white);
      background-color: transparent;
    }

    :deep(.el-breadcrumb) {
      --el-text-color-regular: var(--pro-layout-dark-text-secondary);
      --el-text-color-primary: var(--pro-layout-dark-text);
    }

    .pro-layout-header__horizontal-menu :deep(.el-menu--horizontal) {
      > .el-menu-item,
      > .el-sub-menu > .el-sub-menu__title {
        color: var(--pro-layout-dark-text);
      }

      > .el-menu-item:hover,
      > .el-sub-menu > .el-sub-menu__title:hover {
        color: var(--el-color-white);
        background: var(--pro-layout-dark-hover);
      }

      > .el-menu-item.is-active,
      > .el-sub-menu.is-active > .el-sub-menu__title {
        color: var(--el-color-white);
        background: var(--el-color-primary);
      }
    }

    .pro-layout-header__control {
      color: var(--pro-layout-dark-text);

      &:hover,
      &:focus-visible {
        color: var(--el-color-white);
        background: var(--pro-layout-dark-hover);
      }
    }

    .pro-layout-header__user-trigger {
      color: var(--pro-layout-dark-text);
      border-color: var(--pro-layout-dark-border);
      background: var(--pro-layout-dark-control-bg);

      &:hover,
      &:focus-visible {
        color: var(--el-color-white);
        border-color: var(--el-color-primary);
        background: var(--pro-layout-dark-hover);
      }
    }
  }

  &__left,
  &__right {
    display: flex;
    align-items: center;
    height: 100%;
  }

  &__left {
    flex: auto;
    min-width: 0;
    gap: 10px;

    &.is-top-mode {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      column-gap: 20px;
      width: 100%;
    }
  }

  &__breadcrumb {
    min-width: 0;
    padding-left: 0;
    overflow: hidden;
  }

  &__horizontal-menu {
    display: flex;
    flex: auto;
    align-items: center;
    min-width: 0;
    height: 100%;

    &.is-top-mode {
      flex: 1 1 auto;
      justify-content: center;
      width: 100%;
      margin: 0;
    }

    :deep(.el-menu--horizontal) {
      --el-menu-horizontal-height: var(--pro-layout-header-height, 100%);

      height: 100%;
      min-height: 0;
      width: 100%;
      overflow: hidden;
      align-items: stretch;
      border-bottom: none;

      > .el-menu-item {
        align-self: center;
      }

      > .el-sub-menu {
        display: flex;
        align-items: center;
        height: 100%;
        min-height: 0;
      }

      > .el-menu-item,
      > .el-sub-menu > .el-sub-menu__title {
        height: var(--pro-layout-header-menu-height, 100%);
        min-height: 0;
        margin: 0 2px;
        padding-right: 14px;
        padding-left: 14px;
        gap: 7px;
        line-height: 1;
        align-items: center;
        box-sizing: border-box;
        border-bottom: 0 !important;
        border-radius: 6px;
      }

      > .el-menu-item > .icon,
      > .el-sub-menu > .el-sub-menu__title > .icon {
        width: var(--pro-layout-header-menu-icon-size, 18px);
        height: var(--pro-layout-header-menu-icon-size, 18px);
        flex-basis: var(--pro-layout-header-menu-icon-size, 18px);
      }

      > .el-sub-menu > .el-sub-menu__title {
        padding-right: 34px;

        > .ellipsis {
          margin-right: 8px;
        }

        .el-sub-menu__icon-arrow {
          right: 12px;
        }
      }

      > .el-menu-item:hover,
      > .el-sub-menu > .el-sub-menu__title:hover {
        background: var(--pro-layout-hover-bg);
      }

      > .el-menu-item.is-active,
      > .el-sub-menu.is-active > .el-sub-menu__title {
        border-bottom: 0 !important;
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }
    }
  }

  &__right {
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    justify-content: flex-end;
    gap: 8px;

    &.is-top-mode {
      margin-left: 20px;
    }
  }

  &__actions {
    display: inline-flex;
    align-items: center;
    height: 100%;
    gap: 4px;
  }

  &__control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--pro-layout-header-control-size, 32px);
    height: var(--pro-layout-header-control-size, 32px);
    min-width: 0;
    min-height: 0;
    padding: 0;
    color: inherit;
    background: transparent;
    border: 0;
    border-radius: 50%;
    cursor: pointer;
    transition:
      background-color 0.18s ease,
      color 0.18s ease;

    &:hover,
    &:focus-visible {
      color: var(--el-color-primary);
      background: transparent;
      outline: none;
    }

    :deep(.el-badge) {
      line-height: 1;
    }

    :deep(svg) {
      width: 14px;
      height: 14px;
    }
  }

  &__user {
    display: inline-flex;
    align-items: center;
    height: 100%;
  }

  &__user-trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: var(--pro-layout-header-user-height, 36px);
    min-height: 0;
    padding: 0 10px 0 6px;
    color: var(--pro-layout-heading-color);
    background: var(--pro-layout-surface);
    border: 0;
    border-radius: 10px;
    cursor: pointer;
    transition:
      background-color 0.18s ease,
      color 0.18s ease;

    :deep(.el-avatar) {
      flex: 0 0 var(--pro-layout-header-avatar-size, 32px);
      width: var(--pro-layout-header-avatar-size, 32px) !important;
      height: var(--pro-layout-header-avatar-size, 32px) !important;
    }

    &:hover,
    &:focus-visible {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      outline: none;
    }
  }

  &__user-name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
  }

  &__notification {
    :deep(.el-tabs__nav-wrap::after) {
      background-color: var(--pro-layout-line);
    }
  }
}
</style>
