<template>
  <template v-if="!hasChildren(item)">
    <el-menu-item :index="item.key" :disabled="item.disabled" :route="routeFor(item)">
      <slot name="icon" v-bind="slotProps">
        <el-icon v-if="renderIcon(item.icon)" class="pro-layout-menu__icon">
          <component :is="renderIcon(item.icon)" v-if="typeof item.icon !== 'string'" />
          <span v-else>{{ item.icon }}</span>
        </el-icon>
      </slot>
      <template #title>
        <span class="pro-layout-menu__content">
          <span class="pro-layout-menu__label">
            <slot name="title" v-bind="slotProps">{{ item.title }}</slot>
          </span>
          <span v-if="$slots.extra" class="pro-layout-menu__extra">
            <slot name="extra" v-bind="slotProps" />
          </span>
        </span>
      </template>
    </el-menu-item>
  </template>

  <template v-else>
    <el-sub-menu :index="item.key" :disabled="item.disabled" :popper-style="navigationStyle">
      <template #title>
        <slot name="icon" v-bind="slotProps">
          <el-icon v-if="renderIcon(item.icon)" class="pro-layout-menu__icon">
            <component :is="renderIcon(item.icon)" v-if="typeof item.icon !== 'string'" />
            <span v-else>{{ item.icon }}</span>
          </el-icon>
        </slot>
        <span class="pro-layout-menu__content">
          <span class="pro-layout-menu__label">
            <slot name="title" v-bind="slotProps">{{ item.title }}</slot>
          </span>
          <span v-if="$slots.extra" class="pro-layout-menu__extra">
            <slot name="extra" v-bind="slotProps" />
          </span>
        </span>
      </template>
      <template v-for="child in item.children" :key="child.key">
        <ProLayoutMenuItem
          :item="child"
          :mode="mode"
          :router="router"
          :active-key="activeKey"
          :level="level + 1"
        >
          <template v-if="$slots.icon" #icon="slotData"
            ><slot name="icon" v-bind="slotData"
          /></template>
          <template v-if="$slots.title" #title="slotData"
            ><slot name="title" v-bind="slotData"
          /></template>
          <template v-if="$slots.extra" #extra="slotData"
            ><slot name="extra" v-bind="slotData"
          /></template>
        </ProLayoutMenuItem>
      </template>
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import { computed, type Component, type VNodeChild } from 'vue'
import { ElIcon, ElMenuItem, ElSubMenu } from 'element-plus'
import { useNavigationStyle } from './use-navigation-style'
import type { LayoutMenuItem } from './types'
import { renderLayoutIcon } from './utils'

defineOptions({ name: 'ProLayoutMenuItem' })

const props = withDefaults(
  defineProps<{
    item: LayoutMenuItem
    /** 渲染模式，horizontal 用于顶栏 */
    mode?: 'horizontal' | 'vertical'
    /** el-menu 的 router 模式（需 vue-router） */
    router?: boolean
    /** 当前激活菜单 key，用于 scoped slot 判断状态 */
    activeKey?: string
    /** 当前菜单深度，根节点为 0 */
    level?: number
  }>(),
  { mode: 'vertical', router: false, activeKey: '', level: 0 }
)
const navigationStyle = useNavigationStyle(() =>
  props.mode === 'horizontal' ? 'header' : 'sidebar'
)
const slotProps = computed(() => ({
  item: props.item,
  level: props.level,
  active: props.activeKey === props.item.key,
  hasChildren: hasChildren(props.item)
}))

function hasChildren(item: LayoutMenuItem) {
  return Boolean(item.children?.length)
}

function routeFor(item: LayoutMenuItem) {
  if (!props.router) return undefined
  if (item.path) return { path: item.path }
  return { name: item.key }
}

function renderIcon(icon: Component | (() => VNodeChild) | VNodeChild | undefined): VNodeChild {
  return renderLayoutIcon(icon as never)
}
</script>

<style scoped lang="scss">
.pro-layout-menu {
  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 0;
    flex-shrink: 0;
    line-height: 1;

    :deep(svg) {
      display: block;
      width: 18px;
      height: 18px;
    }
  }

  &__content {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    min-width: 0;
    height: 100%;
    gap: 8px;
    line-height: inherit;
  }

  &__label {
    display: block;
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__extra {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    min-width: 0;
    line-height: 1;
  }
}
</style>
