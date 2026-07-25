<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClipboard, useToggle } from '@vueuse/core'
import { CaretTop, DocumentCopy, Link } from '@element-plus/icons-vue'

import Example from './vp-example.vue'
import SourceCode from './vp-source-code.vue'

const props = withDefaults(
  defineProps<{
    source?: string
    path?: string
    rawSource?: string
    description?: string
  }>(),
  {
    description: ''
  }
)

const demos = import.meta.glob('../../../examples/**/*.vue', { eager: true })

const { copy, isSupported } = useClipboard({
  source: decodeURIComponent(props.rawSource || ''),
  read: false
})

const [sourceVisible, toggleSourceVisible] = useToggle()

const sourceCodeRef = ref<HTMLButtonElement>()
const formatPathDemos = computed(() => {
  let _demos: Record<string, unknown> = {}
  Object.keys(demos).forEach(key => {
    _demos[key.replace('../../../examples/', '').replace('.vue', '')] = (
      demos[key] as { default: unknown }
    ).default
  })
  return _demos
})

const decodedDescription = computed(() => decodeURIComponent(props.description!))

const copyCode = async () => {
  if (!isSupported) return
  try {
    await copy()
  } catch {
    // ignore
  }
}
</script>

<template>
  <ClientOnly>
    <p text="sm" v-html="decodedDescription" />

    <div class="example">
      <Example v-if="path" :file="path" :demo="formatPathDemos[path]" />

      <ElDivider class="m-0" />

      <div class="op-btns">
        <ElTooltip content="复制源码" :show-arrow="false" :trigger="['hover', 'focus']">
          <ElIcon
            :size="16"
            aria-label="复制"
            class="op-btn"
            tabindex="0"
            role="button"
            @click="copyCode"
          >
            <DocumentCopy />
          </ElIcon>
        </ElTooltip>
        <ElTooltip content="查看代码" :show-arrow="false" :trigger="['hover', 'focus']">
          <button
            ref="sourceCodeRef"
            :aria-label="sourceVisible ? '隐藏' : '查看'"
            class="reset-btn el-icon op-btn"
            @click="toggleSourceVisible()"
          >
            <ElIcon :size="16">
              <Link />
            </ElIcon>
          </button>
        </ElTooltip>
      </div>

      <ElCollapseTransition>
        <SourceCode v-if="source" v-show="sourceVisible" :source="source" />
      </ElCollapseTransition>

      <Transition name="el-fade-in-linear">
        <div
          v-show="sourceVisible"
          class="example-float-control"
          tabindex="0"
          role="button"
          @click="toggleSourceVisible(false)"
        >
          <ElIcon :size="16">
            <CaretTop />
          </ElIcon>
        </div>
      </Transition>
    </div>
  </ClientOnly>
</template>

<style scoped lang="scss">
.example {
  .op-btns {
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 2.5rem;
    border-top: 1px solid var(--vp-c-divider, var(--el-border-color));

    .op-btn {
      margin: 0 0.5rem;
      cursor: pointer;
      color: var(--el-text-color-secondary);
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  &-float-control {
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid var(--vp-c-divider, var(--el-border-color));
    height: 40px;
    box-sizing: border-box;
    background-color: var(--vp-c-bg, #fff);
    margin-top: -1px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    position: sticky;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
