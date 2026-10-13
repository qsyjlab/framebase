<template>
  <aside
    class="pro-layout-mix-sidebar"
    :class="{ 'is-fixed': fixed }"
    :style="{ width: `${width}px` }"
  >
    <slot name="logo">
      <ProLayoutLogo
        :title="title"
        :logo="logo"
        :logo-width="logoWidth"
        :width="width"
        :height="headerHeight"
        :show-title="false"
      />
    </slot>
    <ProLayoutMixMenu
      :menus="menus"
      :active-key="activeKey"
      :menu-width="asideWidth"
      :header-height="headerHeight"
      :fixed="fixed"
      :router="router"
      @select="onSelect"
      @update:fixed="onFixedChange"
      @children-visible="value => emit('children-visible', value)"
    />
  </aside>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-required-prop-with-default */
import ProLayoutLogo from './pro-layout-logo.vue'
import ProLayoutMixMenu from './pro-layout-mix-menu.vue'
import type { LayoutMenuItem } from './types'

defineOptions({ name: 'ProLayoutMixSidebar' })

const props = withDefaults(
  defineProps<{
    title: string
    logo: string
    logoWidth: number
    width: number
    asideWidth: number
    headerHeight: number
    menus: LayoutMenuItem[]
    activeKey: string
    fixed: boolean
    router?: boolean
  }>(),
  { menus: () => [], router: false }
)

const emit = defineEmits<{
  select: [key: string, item: LayoutMenuItem]
  'update:fixed': [value: boolean]
  'children-visible': [value: boolean]
}>()

function onSelect(key: string, item: LayoutMenuItem) {
  emit('select', key, item)
}
function onFixedChange(value: boolean) {
  emit('update:fixed', value)
}

// 占位以避免未使用参数告警
void props
</script>

<style scoped lang="scss">
.pro-layout-mix-sidebar {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  height: 100vh;
  overflow: visible;
  background-color: var(--pro-layout-aside-bg);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1002;

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
</style>
