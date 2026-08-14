<template>
  <span
    class="pro-status"
    :class="[`pro-status--${variant}`, { 'is-pulse': resolvedPulse }]"
    :style="statusStyle"
    :role="live === 'off' ? undefined : 'status'"
    :aria-live="live === 'off' ? undefined : live"
  >
    <slot v-bind="renderContext">
      <el-tag
        v-if="variant === 'tag'"
        class="pro-status__tag"
        :size="size"
        :effect="effect"
        :style="tagStyle"
      >
        <slot v-if="resolvedIcon" name="icon" v-bind="renderContext">
          <el-icon class="pro-status__icon"><component :is="resolvedIcon" /></el-icon>
        </slot>
        {{ resolvedText }}
      </el-tag>

      <template v-else>
        <slot v-if="resolvedIcon" name="icon" v-bind="renderContext">
          <el-icon class="pro-status__icon"><component :is="resolvedIcon" /></el-icon>
        </slot>
        <span v-else-if="variant === 'dot'" class="pro-status__dot" aria-hidden="true" />
        <span class="pro-status__text">{{ resolvedText }}</span>
      </template>
    </slot>
  </span>
</template>

<script setup lang="ts" generic="TValue extends PropertyKey = PropertyKey">
import { computed } from 'vue'
import { ElIcon, ElTag } from 'element-plus'
import type { ProStatusProps, ProStatusRenderContext, ProStatusSlots } from './pro-status'
import {
  getProStatusMeta,
  getProStatusText,
  resolveProStatusColors,
  resolveProStatusTagColors
} from './pro-status-utils'

defineOptions({ name: 'ProStatus' })

const props = withDefaults(defineProps<ProStatusProps<TValue>>(), {
  tone: undefined,
  variant: 'dot',
  effect: 'light',
  size: 'default',
  pulse: false,
  emptyText: '-',
  live: 'off'
})
defineSlots<ProStatusSlots<TValue>>()

const meta = computed(() => getProStatusMeta(props.valueEnum, props.value))
const resolvedText = computed(
  () => getProStatusText(props.value, props.text ?? meta.value?.text) || props.emptyText
)
const resolvedTone = computed(() => props.tone ?? meta.value?.tone ?? 'default')
const resolvedColor = computed(() => props.color ?? meta.value?.color)
const resolvedColors = computed(() =>
  resolveProStatusColors(resolvedTone.value, resolvedColor.value)
)
const resolvedIcon = computed(() => props.icon ?? meta.value?.icon)
const resolvedPulse = computed(
  () => props.pulse || meta.value?.pulse || resolvedTone.value === 'processing'
)
const statusStyle = computed(() => ({
  '--pro-status-foreground': resolvedColors.value.foreground,
  '--pro-status-background': resolvedColors.value.background,
  '--pro-status-border': resolvedColors.value.border,
  '--pro-status-dot': resolvedColors.value.dot
}))
const tagStyle = computed(() => resolveProStatusTagColors(resolvedColors.value, props.effect))
const renderContext = computed<ProStatusRenderContext<TValue>>(() => ({
  value: props.value,
  text: resolvedText.value,
  tone: resolvedTone.value,
  variant: props.variant,
  colors: resolvedColors.value,
  meta: meta.value
}))
</script>

<style scoped lang="scss">
.pro-status {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  color: var(--pro-status-foreground);
  line-height: 1.4;
  vertical-align: middle;

  &__dot {
    width: 7px;
    height: 7px;
    flex: none;
    border-radius: 50%;
    background: var(--pro-status-dot);
  }

  &__icon {
    flex: none;
    color: var(--pro-status-foreground);
  }

  &__tag {
    gap: 4px;
  }

  &__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.is-pulse &__dot {
    animation: pro-status-pulse 1.6s ease-in-out infinite;
  }
}

@keyframes pro-status-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--pro-status-dot) 55%, transparent);
  }
  50% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--pro-status-dot) 0%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pro-status.is-pulse .pro-status__dot {
    animation: none;
  }
}
</style>
