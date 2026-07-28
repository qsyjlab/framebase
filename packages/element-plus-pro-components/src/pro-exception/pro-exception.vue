<template>
  <section
    class="pro-exception"
    :class="[`is-${status}`, { 'is-full-page': fullPage }]"
    :style="bodyStyle"
    role="alert"
    aria-live="assertive"
  >
    <div class="pro-exception__illustration" :style="illustrationStyle" aria-hidden="true">
      <slot name="illustration">
        <img v-if="illustration" :src="illustration" alt="" />
        <svg v-else viewBox="0 0 320 200" fill="none">
          <path class="pro-exception__ghost" :d="ghostPath" />
          <template v-if="status === '403'">
            <path
              class="pro-exception__surface"
              d="M160 36 92 60v44c0 36 28 64 68 76 40-12 68-40 68-76V60l-68-24Z"
            />
            <path class="pro-exception__panel" d="M160 60Z" />
            <rect class="pro-exception__panel" x="134" y="96" width="52" height="44" rx="6" />
            <path class="pro-exception__accent-line" d="M144 96v-8a16 16 0 0 1 32 0v8" />
            <circle class="pro-exception__accent-fill" cx="160" cy="114" r="5" />
            <path class="pro-exception__accent-line" d="M160 119v10" />
          </template>
          <template v-else-if="status === '404'">
            <path
              class="pro-exception__surface"
              d="M120 44h60a8 8 0 0 1 8 8v96a8 8 0 0 1-8 8H88a8 8 0 0 1-8-8V64l40-20Z"
            />
            <path class="pro-exception__panel" d="M80 64h32a8 8 0 0 0 8-8V44" />
            <path class="pro-exception__line" d="M104 92h56M104 112h56M104 132h32" />
            <circle class="pro-exception__accent-fill" cx="208" cy="140" r="22" />
            <path class="pro-exception__surface" d="m226 158 14 14" stroke-width="6" />
            <path class="pro-exception__on-accent" d="M208 130v12M208 150v2" />
          </template>
          <template v-else>
            <rect class="pro-exception__surface" x="92" y="44" width="136" height="112" rx="8" />
            <path class="pro-exception__panel" d="M92 72h136" />
            <circle class="pro-exception__accent-fill" cx="104" cy="58" r="3" />
            <circle class="pro-exception__accent-fill" cx="116" cy="58" r="3" />
            <path class="pro-exception__accent-line" d="M160 90v36" />
            <circle class="pro-exception__accent-fill" cx="160" cy="140" r="4" />
            <path
              class="pro-exception__accent-line"
              d="M120 168h80"
              stroke-width="6"
              stroke-linecap="round"
            />
          </template>
        </svg>
      </slot>
    </div>

    <h1 class="pro-exception__title">
      <slot name="title">{{ resolvedTitle }}</slot>
    </h1>
    <p v-if="resolvedSubTitle || $slots.subTitle" class="pro-exception__subtitle">
      <slot name="subTitle">{{ resolvedSubTitle }}</slot>
    </p>

    <div v-if="$slots.default" class="pro-exception__content">
      <slot />
    </div>

    <div v-if="hasExtra" class="pro-exception__actions">
      <slot name="actions">
        <el-button
          v-for="action in resolvedActions"
          :key="action.key"
          :type="action.type === 'primary' ? 'primary' : 'default'"
          @click="handleAction(action)"
        >
          {{ action.text }}
        </el-button>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { ElButton } from 'element-plus'
import type { ProExceptionAction, ProExceptionProps, ProExceptionSlots } from './pro-exception'
import { getProExceptionDefaultContent } from './pro-exception-utils'

defineOptions({ name: 'ProException' })

const props = withDefaults(defineProps<ProExceptionProps>(), {
  status: '404',
  fullPage: true,
  illustrationSize: 360,
  showBack: true,
  showHome: true,
  showReload: false
})
const emit = defineEmits<{
  back: []
  home: []
  reload: []
  action: [key: string]
}>()
defineSlots<ProExceptionSlots>()

const slots = useSlots()
const defaultContent = computed(() => getProExceptionDefaultContent(props.status))
const resolvedTitle = computed(() => props.title ?? defaultContent.value.title)
const resolvedSubTitle = computed(() => props.subTitle ?? defaultContent.value.subTitle)
const illustrationStyle = computed(() => {
  const size = props.illustrationSize
  return { maxWidth: typeof size === 'number' ? `${size}px` : size }
})

const ghostPath = computed(
  () =>
    ({
      '403': 'M160 8 60 44v72c0 56 44 96 100 112 56-16 100-56 100-112V44L160 8Z',
      '404': 'M160 4 56 40v76c0 54 44 92 104 108 60-16 104-54 104-108V40L160 4Z',
      '500': 'M160 4 56 40v76c0 54 44 92 104 108 60-16 104-54 104-108V40L160 4Z'
    })[props.status]
)

const resolvedActions = computed<ProExceptionAction[]>(() => {
  if (props.actions) return props.actions
  const list: ProExceptionAction[] = []
  if (props.showBack) {
    list.push({ key: 'back', text: props.backText ?? '返回上一页', type: 'default' })
  }
  if (props.showHome) {
    list.push({ key: 'home', text: props.homeText ?? '返回首页', type: 'primary' })
  }
  if (props.showReload) {
    list.push({ key: 'reload', text: props.reloadText ?? '重新加载', type: 'default' })
  }
  return list
})

const hasExtra = computed(() => Boolean(slots.actions || resolvedActions.value.length))

function handleAction(action: ProExceptionAction) {
  if (action.key === 'back') emit('back')
  else if (action.key === 'home') emit('home')
  else if (action.key === 'reload') emit('reload')
  emit('action', action.key)
}
</script>

<style scoped lang="scss">
.pro-exception {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 48px 24px;
  color: var(--el-text-color-primary);
  text-align: center;

  &.is-full-page {
    min-height: 100%;
  }

  &__illustration {
    max-width: 100%;
    margin-bottom: 24px;

    img,
    svg {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  &__ghost {
    fill: var(--el-fill-color-light, #f5f7fa);
  }

  &__surface {
    fill: var(--el-bg-color-overlay, #fff);
    stroke: var(--el-border-color, #dcdfe6);
    stroke-width: 3;
    stroke-linejoin: round;
  }

  &__panel {
    fill: var(--el-fill-color, #f0f2f5);
    stroke: var(--el-border-color-light, #e4e7ed);
    stroke-width: 3;
    stroke-linejoin: round;
  }

  &__line {
    stroke: var(--el-border-color, #dcdfe6);
    stroke-width: 4;
    stroke-linecap: round;
  }

  &__accent-line {
    fill: none;
    stroke: var(--el-color-primary, #409eff);
    stroke-width: 5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &__accent-fill {
    fill: var(--el-color-primary, #409eff);
  }

  &__on-accent {
    stroke: var(--el-color-white, #fff);
    stroke-width: 5;
    stroke-linecap: round;
    fill: none;
  }

  &.is-403 &__accent-line,
  &.is-403 &__accent-fill {
    stroke: var(--el-color-warning, #e6a23c);
    fill: var(--el-color-warning, #e6a23c);
  }

  &.is-404 &__accent-line,
  &.is-404 &__accent-fill {
    stroke: var(--el-color-info, #909399);
    fill: var(--el-color-info, #909399);
  }

  &.is-500 &__accent-line,
  &.is-500 &__accent-fill {
    stroke: var(--el-color-danger, #f56c6c);
    fill: var(--el-color-danger, #f56c6c);
  }

  &__title {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 28px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 1px;
  }

  &__subtitle {
    max-width: 480px;
    margin: 12px 0 0;
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-base, 14px);
    line-height: 1.6;
  }

  &__content {
    max-width: 640px;
    margin-top: 20px;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 28px;
  }
}
</style>
