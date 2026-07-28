<template>
  <el-badge
    class="pro-badge"
    :class="`is-${placement}`"
    :value="value"
    :max="max"
    :is-dot="dot"
    :hidden="resolvedHidden"
    :show-zero="showZero"
    :type="badgeType"
    :color="color"
    :offset="offset"
    :badge-style="resolvedBadgeStyle"
    :badge-class="resolvedBadgeClass"
  >
    <slot />
    <template v-if="$slots.content" #content><slot name="content" /></template>
  </el-badge>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { ElBadge, type BadgeProps } from 'element-plus'
import { resolveProStatusColors } from '../pro-status'
import type { ProBadgeProps, ProBadgeSlots } from './pro-badge'

defineOptions({ name: 'ProBadge' })

const props = withDefaults(defineProps<ProBadgeProps>(), {
  value: '',
  max: 99,
  dot: false,
  hidden: false,
  showZero: true,
  pulse: false,
  tone: 'danger',
  offset: () => [0, 0],
  placement: 'top-right',
  badgeStyle: () => ({})
})
defineSlots<ProBadgeSlots>()

const badgeType = computed<BadgeProps['type']>(() => {
  if (props.tone === 'processing') return 'primary'
  if (props.tone === 'default') return 'info'
  return props.tone
})
const resolvedHidden = computed(
  () => props.hidden || (!props.showZero && !props.dot && Number(props.value) === 0)
)
const resolvedBadgeClass = computed(() =>
  ['pro-badge__content', props.pulse ? 'is-pulse' : '', props.badgeClass].filter(Boolean).join(' ')
)
const resolvedBadgeStyle = computed(
  () =>
    ({
      ...props.badgeStyle,
      '--pro-badge-color': props.color ?? resolveProStatusColors(props.tone).dot
    }) as CSSProperties
)
</script>

<style scoped lang="scss">
.pro-badge {
  &.is-top-left :deep(.el-badge__content) {
    right: auto;
    left: 0;
    transform: translate(-50%, -50%);
  }

  &.is-bottom-right :deep(.el-badge__content) {
    top: auto;
    bottom: 0;
    transform: translate(50%, 50%);
  }

  &.is-bottom-left :deep(.el-badge__content) {
    top: auto;
    right: auto;
    bottom: 0;
    left: 0;
    transform: translate(-50%, 50%);
  }

  :deep(.pro-badge__content.is-pulse) {
    animation: pro-badge-pulse 1.6s ease-in-out infinite;
  }
}

@keyframes pro-badge-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--pro-badge-color) 45%, transparent);
  }
  50% {
    box-shadow: 0 0 0 6px transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pro-badge :deep(.pro-badge__content.is-pulse) {
    animation: none;
  }
}
</style>
