<template>
  <template v-if="!hasChildren(item)">
    <el-menu-item :index="item.key" :disabled="item.disabled" :route="routeFor(item)">
      <span v-if="renderIcon(item.icon)" class="pro-layout-menu__icon">
        <component :is="renderIcon(item.icon)" v-if="typeof item.icon !== 'string'" />
        <span v-else>{{ item.icon }}</span>
      </span>
      <template #title>
        <span class="pro-layout-menu__title">{{ item.title }}</span>
      </template>
    </el-menu-item>
  </template>

  <template v-else>
    <el-sub-menu :index="item.key" :disabled="item.disabled" :popper-style="navigationStyle">
      <template #title>
        <span v-if="renderIcon(item.icon)" class="pro-layout-menu__icon">
          <component :is="renderIcon(item.icon)" v-if="typeof item.icon !== 'string'" />
          <span v-else>{{ item.icon }}</span>
        </span>
        <span class="pro-layout-menu__title">{{ item.title }}</span>
      </template>
      <template v-for="child in item.children" :key="child.key">
        <ProLayoutMenuItem :item="child" :mode="mode" :router="router" />
      </template>
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import type { Component, VNodeChild } from 'vue'
import { ElMenuItem, ElSubMenu } from 'element-plus'
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
  }>(),
  { mode: 'vertical', router: false }
)
const navigationStyle = useNavigationStyle(() =>
  props.mode === 'horizontal' ? 'header' : 'sidebar'
)

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

  &__title {
    display: inline-block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
