<template>
  <div class="pro-layout-check-group">
    <div v-for="item in options" :key="String(item.value)" class="pro-layout-check-group__item">
      <el-tooltip effect="dark" :content="item.title" placement="top">
        <button
          type="button"
          :class="['pro-layout-check-group__card', item.value === modelValue ? 'is-active' : '']"
          :aria-label="item.title"
          :aria-pressed="item.value === modelValue"
          @click="onClick(item.value)"
        >
          <span
            v-if="item.value === modelValue"
            class="pro-layout-check-group__checked"
            aria-hidden="true"
          >
            <CheckIcon />
          </span>
          <component :is="item.icon" />
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import type { Component } from 'vue'
import { CheckIcon } from './icons/mode-icons'

defineOptions({ name: 'ProLayoutCheckButtonGroup' })

const props = defineProps<{
  modelValue: T
  options: { title: string; value: T; icon: Component }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [value: T]
}>()

function onClick(value: T) {
  emit('update:modelValue', value)
  emit('change', value)
}

void props
</script>

<style scoped lang="scss">
.pro-layout-check-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  &__item {
    flex: 0 0 auto;
  }

  &__card {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 44px;
    padding: 0;
    color: var(--pro-layout-text-regular);
    background: var(--pro-layout-surface);
    cursor: pointer;
    border: 1px solid var(--pro-layout-line);
    border-radius: 8px;
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      color 0.18s ease;

    :deep(svg) {
      width: 28px;
      height: 28px;
    }

    &:hover {
      transform: translateY(-1px);
      border-color: var(--el-color-primary-light-5);
    }

    &.is-active {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
  }

  &__checked {
    position: absolute;
    top: -7px;
    right: -7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 10px;
    color: #fff;
    background: var(--el-color-primary);
    border-radius: 999px;
    box-shadow: var(--el-box-shadow-light);

    :deep(svg) {
      width: 12px;
      height: 12px;
    }
  }
}
</style>
