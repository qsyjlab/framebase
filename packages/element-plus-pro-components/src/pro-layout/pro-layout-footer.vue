<template>
  <footer class="pro-layout-footer" :style="wrapperStyle">
    <slot>
      <span class="pro-layout-footer__text">{{ text }}</span>
    </slot>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ProLayoutFooter' })

const props = withDefaults(
  defineProps<{
    height?: number
    paddingLeft?: number
    text?: string
  }>(),
  { height: 48, paddingLeft: 0, text: '' }
)

const wrapperStyle = computed(() => ({
  height: `${props.height}px`,
  paddingLeft: `${props.paddingLeft}px`
}))
</script>

<style scoped lang="scss">
.pro-layout-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  font-size: 13px;
  color: var(--pro-layout-text-secondary);
  background-color: transparent;

  &__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
