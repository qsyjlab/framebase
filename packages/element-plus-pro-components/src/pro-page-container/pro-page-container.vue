<template>
  <section
    class="pro-page-container"
    :class="{
      'is-ghost': ghost,
      'is-bordered': bordered,
      'is-header-bordered': headerBordered
    }"
  >
    <header v-if="hasHeader" class="pro-page-container__header" :style="headerStyle">
      <slot name="breadcrumb">
        <el-breadcrumb v-if="resolvedBreadcrumbs.length" class="pro-page-container__breadcrumb">
          <el-breadcrumb-item
            v-for="(item, index) in resolvedBreadcrumbs"
            :key="`${index}-${item.text}`"
            :to="item.to"
            :replace="item.replace"
          >
            {{ item.text }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </slot>

      <div class="pro-page-container__title-row">
        <el-button
          v-if="isBackVisible()"
          class="pro-page-container__back"
          text
          circle
          :icon="ArrowLeft"
          aria-label="返回"
          @click="handleBack"
        />
        <div class="pro-page-container__heading">
          <slot name="title">
            <div v-if="title" class="pro-page-container__title">{{ title }}</div>
          </slot>
          <slot name="subtitle">
            <div v-if="subtitle" class="pro-page-container__subtitle">{{ subtitle }}</div>
          </slot>
        </div>
        <div v-if="extra || $slots.extra" class="pro-page-container__extra">
          <slot name="extra">{{ extra }}</slot>
        </div>
      </div>

      <slot name="description">
        <div v-if="description" class="pro-page-container__description">{{ description }}</div>
      </slot>
    </header>

    <div class="pro-page-container__body">
      <slot v-if="loading" name="loading">
        <el-skeleton animated :rows="5" />
      </slot>
      <div v-else class="pro-page-container__content" :style="resolvedContentStyle">
        <slot />
      </div>
    </div>

    <footer
      v-if="$slots.footer"
      class="pro-page-container__footer"
      :class="`is-${footerAlign}`"
      :style="footerStyle"
    >
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, useSlots } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElBreadcrumb, ElBreadcrumbItem, ElButton, ElSkeleton } from 'element-plus'
import { normalizeProCardSpacing } from '../pro-card'
import { normalizeProPageBreadcrumbs, resolveProPageBackVisible } from './pro-page-container-utils'
import type { ProPageContainerProps } from './pro-page-container'

defineOptions({ name: 'ProPageContainer' })

const props = withDefaults(defineProps<ProPageContainerProps>(), {
  ghost: false,
  bordered: false,
  headerBordered: true,
  loading: false,
  footerAlign: 'right'
})

const emit = defineEmits<{
  back: []
}>()

const slots = useSlots()
const instance = getCurrentInstance()

const resolvedBreadcrumbs = computed(() => normalizeProPageBreadcrumbs(props.breadcrumb))

const hasHeader = computed(() =>
  Boolean(
    props.title ||
    props.subtitle ||
    props.description ||
    props.extra ||
    props.breadcrumb?.length ||
    slots.title ||
    slots.subtitle ||
    slots.description ||
    slots.extra ||
    slots.breadcrumb
  )
)

const resolvedContentStyle = computed(() => {
  let padding: string | undefined
  if (props.contentPadding !== undefined) {
    padding = normalizeProCardSpacing(props.contentPadding)
  } else if (props.ghost) {
    padding = '0px'
  }
  return { padding, ...props.contentStyle }
})

function hasBackHandler() {
  return typeof instance?.vnode.props?.onBack === 'function'
}

function isBackVisible() {
  return resolveProPageBackVisible(props.back, hasBackHandler())
}

function handleBack() {
  if (hasBackHandler()) {
    emit('back')
    return
  }
  if (typeof window !== 'undefined') window.history.back()
}
</script>

<style scoped lang="scss">
.pro-page-container {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border-radius: var(--framebase-radius-lg);

  &.is-bordered {
    border: 1px solid var(--el-border-color-light);
  }

  &.is-ghost {
    background: transparent;
    border: 0;
    border-radius: 0;
  }

  &__header {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    gap: 12px;
    padding: 16px 24px;
  }

  &.is-header-bordered &__header {
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__breadcrumb {
    line-height: 1.5;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__back {
    flex-shrink: 0;
    font-size: 18px;
    color: var(--el-text-color-primary);
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
  }

  &__subtitle {
    font-size: 14px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  &__extra {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  &__description {
    font-size: 14px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  &__body {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
  }

  &__content {
    box-sizing: border-box;
    padding: 24px;
  }

  &__footer {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    padding: 12px 24px;
    border-top: 1px solid var(--el-border-color-lighter);

    &.is-left {
      justify-content: flex-start;
    }

    &.is-center {
      justify-content: center;
    }

    &.is-right {
      justify-content: flex-end;
    }
  }
}
</style>
