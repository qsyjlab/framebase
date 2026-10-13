<template>
  <aside
    class="pro-layout-aside"
    :class="{ 'is-collapsed': collapsed, 'is-mix': isMix, 'is-dark': isDarkSidebar }"
    :style="wrapperStyle"
  >
    <div class="pro-layout-aside__inner">
      <slot name="logo">
        <ProLayoutLogo
          v-if="showLogo"
          :title="title"
          :logo="logo"
          :logo-width="logoWidth"
          :width="logoBoxWidth"
          :height="headerHeight"
          :show-title="logoShowTitle && !collapsed"
        />
      </slot>

      <div class="pro-layout-aside__scroll">
        <el-scrollbar>
          <div class="pro-layout-aside__menus">
            <slot name="menu" :menus="menus" :active-key="activeKey" :collapsed="collapsed">
              <el-menu
                :collapse="collapsed"
                :default-active="activeKey"
                :collapse-transition="false"
                :popper-class="menuPopperClass"
                :unique-opened="uniqueOpened"
                :router="router"
                class="pro-layout-menu"
                @select="key => emit('select', key)"
              >
                <ProLayoutMenuItem
                  v-for="menu in menus"
                  :key="menu.key"
                  :item="menu"
                  :router="router"
                />
              </el-menu>
            </slot>
          </div>
        </el-scrollbar>
      </div>

      <slot name="trigger" :collapsed="collapsed" :toggle="toggle">
        <div v-if="collapsible" class="pro-layout-aside__trigger">
          <button
            type="button"
            class="collapse-trigger-btn"
            :aria-label="collapsed ? '展开菜单' : '收起菜单'"
            :title="collapsed ? '展开菜单' : '收起菜单'"
            @click="toggle"
          >
            <svg
              v-if="!collapsed"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h12" />
              <path d="M4 12h8" />
              <path d="M4 18h12" />
              <path d="m14 4 4 4-4 4" transform="translate(2 6)" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M9 6h11" />
              <path d="M9 12h7" />
              <path d="M9 18h11" />
              <path d="m4 4-4 4 4 4" transform="translate(4 6)" />
            </svg>
          </button>
        </div>
      </slot>
    </div>
  </aside>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-required-prop-with-default */
import { computed } from 'vue'
import { ElMenu, ElScrollbar } from 'element-plus'
import ProLayoutLogo from './pro-layout-logo.vue'
import ProLayoutMenuItem from './pro-layout-menu-item.vue'
import { LayoutMode } from './types'
import type { LayoutMenuItem, LayoutMode as LayoutModeType } from './types'

defineOptions({ name: 'ProLayoutAside' })
const emit = defineEmits<{ select: [key: string] }>()

const props = withDefaults(
  defineProps<{
    layoutMode: LayoutModeType
    collapsed: boolean
    collapsible: boolean
    /** 侧栏实际占位宽度（px） */
    width: number
    asideWidth: number
    collapsedWidth: number
    mixWidth: number
    /** 侧栏顶部留白 */
    asidePaddingTop: number
    headerHeight: number
    isDarkSidebar: boolean
    title: string
    logo: string
    logoWidth: number
    logoShowTitle: boolean
    /** mix 模式下 logo 视觉尺寸 */
    mixLogoWidth: number
    menus: LayoutMenuItem[]
    activeKey: string
    router: boolean
    uniqueOpened: boolean
    toggleCollapsed: () => void
  }>(),
  {
    menus: () => [],
    toggleCollapsed: () => undefined
  }
)

const isMix = computed(() => props.layoutMode === LayoutMode.SideMix)
const showLogo = computed(
  () =>
    props.layoutMode === LayoutMode.Side &&
    props.width > 0 &&
    props.width !== props.collapsedWidth - 2
)
const logoBoxWidth = computed(() =>
  props.collapsed && !isMix.value ? props.collapsedWidth : props.asideWidth
)

const wrapperStyle = computed(() => ({
  width: `${props.width}px`,
  paddingTop: `${props.asidePaddingTop}px`
}))

const menuPopperClass = computed(() => {
  const isLightApp = !props.isDarkSidebar
  return ['pro-layout-menu__popper', props.isDarkSidebar && !isLightApp ? 'is-dark-popper' : '']
    .filter(Boolean)
    .join(' ')
})

function toggle() {
  props.toggleCollapsed()
}
</script>

<style scoped lang="scss">
.pro-layout-aside {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100vh;
  overflow: hidden;
  color: var(--pro-layout-text-regular);
  background-color: var(--pro-layout-aside-bg);
  border-right: 1px solid var(--pro-layout-line);
  transition:
    width 0.2s ease-in-out,
    padding-top 0.2s ease-in-out;

  &.is-mix {
    border-right: 0;

    &::after {
      position: absolute;
      z-index: 1;
      top: 0;
      right: 0;
      bottom: 0;
      width: 1px;
      content: '';
      pointer-events: none;
      background-color: var(--pro-layout-mix-divider);
    }
  }

  &__inner {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  &__scroll {
    flex: auto;
    min-height: 0;

    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
    :deep(.el-scrollbar__bar.is-horizontal) {
      display: none;
    }
  }

  &__menus {
    padding: 10px 8px 12px;
  }

  &__trigger {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-end;
    padding: 12px;
  }

  .collapse-trigger-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    min-width: 32px;
    height: 32px;
    padding: 0;
    color: var(--pro-layout-text-regular);
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition:
      background-color 0.18s ease,
      color 0.18s ease;

    &:hover,
    &:focus {
      color: var(--el-color-primary);
      background: var(--pro-layout-hover-bg);
      outline: none;
    }

    &:active {
      background: var(--el-fill-color);
    }
  }

  &.is-dark {
    .collapse-trigger-btn {
      color: var(--pro-layout-text-regular);
      background: var(--pro-layout-dark-control-bg);

      &:hover,
      &:focus {
        color: var(--el-color-white);
        background: var(--pro-layout-dark-hover);
      }
    }
  }

  &.is-collapsed {
    .pro-layout-aside__menus {
      width: 60px;
      padding: 8px 4px;
      box-sizing: border-box;
    }
    .pro-layout-aside__trigger {
      justify-content: center;
      padding: 12px 4px;
    }

    :deep(.el-menu--collapse) {
      --el-menu-icon-width: 20px;
      --el-menu-base-level-padding: 16px;
      width: 52px;
    }
    :deep(.el-menu--collapse > .el-menu-item),
    :deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title) {
      width: 52px;
      height: 44px;
      padding: 0 !important;
      justify-content: center;
      gap: 0 !important;
    }
    :deep(.el-menu--collapse .pro-layout-menu__title) {
      display: none !important;
    }
  }
}
</style>
