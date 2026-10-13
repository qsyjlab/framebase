<template>
  <div :class="['pro-layout-logo', { 'is-compact': isCompact }]" :style="styles">
    <div class="pro-layout-logo__img" :style="logoImageStyle">
      <img v-if="logo" :src="logo" alt="" />
      <span v-else class="pro-layout-logo__initial">{{ initial }}</span>
    </div>
    <div class="pro-layout-logo__title" :style="{ display: showTitle ? 'block' : 'none' }">
      {{ title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveLayoutBrandInitial } from './utils'

const props = withDefaults(
  defineProps<{
    /** 标题文案 */
    title?: string
    /** Logo 图片地址；缺省时显示首字占位 */
    logo?: string
    /** 图片/占位的视觉边长（px） */
    logoWidth?: number
    /** 是否展示标题 */
    showTitle?: boolean
    /** 容器宽度（px） */
    width?: number
    /** 容器高度（px） */
    height?: number
  }>(),
  {
    title: '',
    logo: '',
    logoWidth: 36,
    showTitle: true,
    width: 220,
    height: 48
  }
)

const isCompact = computed(() => !props.showTitle || props.width <= 60)
const initial = computed(() => resolveLayoutBrandInitial(props.title))

const styles = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  '--pro-logo-height': `${props.height}px`,
  '--pro-logo-image-size': `${props.logoWidth}px`
}))

const logoImageStyle = computed(() => {
  const size = Math.max(0, Math.min(props.logoWidth, props.height * 0.8))
  return {
    width: `${size}px`,
    height: `${size}px`
  }
})
</script>

<style scoped lang="scss">
.pro-layout-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 0 14px;
  gap: 10px;
  height: 100%;
  min-width: 0;

  &.is-compact {
    justify-content: center;
    padding: 0;
    gap: 0;
  }

  &__img {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 8px;
    background: var(--pro-layout-surface-muted);
    border: 1px solid var(--pro-layout-line);

    img {
      width: auto;
      height: auto;
      max-width: calc(100% - 8px);
      max-height: calc(100% - 8px);
    }
  }

  &__initial {
    font-size: 16px;
    font-weight: 700;
    color: var(--pro-layout-text-secondary);
    line-height: 1;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--pro-layout-heading-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
}
</style>
