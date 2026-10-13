<template>
  <el-breadcrumb :separator="separator" class="pro-layout-breadcrumb">
    <el-breadcrumb-item v-for="(item, index) in normalizedItems" :key="index" :to="item.to">
      <span class="pro-layout-breadcrumb__item">
        <span v-if="showIcon && renderIcon(item.icon)" class="pro-layout-breadcrumb__icon">
          <component :is="renderIcon(item.icon)" v-if="isString(item.icon)" />
          <span v-else>{{ item.icon }}</span>
        </span>
        <span>{{ item.text }}</span>
      </span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component, VNodeChild } from 'vue'
import type { LayoutBreadcrumbItem } from './types'
import { renderLayoutIcon } from './utils'
import { isString } from 'lodash-es'

const props = withDefaults(
  defineProps<{
    items?: LayoutBreadcrumbItem[]
    /** 自定义分隔符 */
    separator?: string
    showIcon?: boolean
  }>(),
  {
    items: () => [],
    separator: '/',
    showIcon: true
  }
)

const normalizedItems = computed(() => props.items.filter(i => i?.text))

function renderIcon(icon: Component | (() => VNodeChild) | VNodeChild | undefined): VNodeChild {
  return renderLayoutIcon(icon as never)
}
</script>

<style scoped lang="scss">
.pro-layout-breadcrumb {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  font-size: 14px;
  color: var(--pro-layout-heading-color, var(--el-text-color-primary));

  /* 窄容器下禁止逐字竖排换行 */
  white-space: nowrap;

  :deep(.el-breadcrumb__item) {
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-breadcrumb__inner) {
    color: var(--pro-layout-text-secondary, var(--el-text-color-regular));
    font-weight: 400;
  }

  :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: inherit;
  }

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    font-size: 14px;

    :deep(svg) {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
