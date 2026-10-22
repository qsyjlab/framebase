<template>
  <div class="pro-layout-tabs" :style="wrapperStyle">
    <button
      v-if="overflow"
      type="button"
      class="pro-layout-tabs__nav"
      aria-label="向左滚动标签"
      @click="scroll(-200)"
    >
      ‹
    </button>
    <div ref="viewportRef" class="pro-layout-tabs__viewport" @wheel.prevent="onWheel">
      <div ref="listRef" class="pro-layout-tabs__list" role="tablist" aria-label="页面标签">
        <div
          v-for="(tab, index) in items"
          :key="tab.key"
          :data-key="tab.key"
          role="tab"
          :aria-selected="tab.key === activeKey"
          :aria-disabled="tab.disabled"
          :tabindex="tab.disabled ? -1 : tab.key === activeKey ? 0 : -1"
          :class="[
            'pro-layout-tabs__item',
            tab.key === activeKey ? 'is-active' : '',
            tab.disabled ? 'is-disabled' : '',
            tab.affix ? 'is-affix' : ''
          ]"
          @click="onClick(tab, index)"
          @keydown="onKeydown($event, tab, index)"
          @contextmenu.prevent="openContext($event, tab)"
        >
          <span v-if="renderIcon(tab.icon)" class="pro-layout-tabs__icon" aria-hidden="true">
            <component
              :is="renderIcon(tab.icon)"
              v-if="typeof tab.icon !== 'string' && renderIcon(tab.icon)"
            />
            <span v-else>{{ tab.icon }}</span>
          </span>
          <span class="pro-layout-tabs__label">{{ tab.label }}</span>
          <span v-if="tab.affix" class="pro-layout-tabs__affix" aria-hidden="true" title="固定标签">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <button
            v-if="isClosable(tab, index)"
            class="pro-layout-tabs__close"
            type="button"
            :aria-label="`关闭 ${tab.label}`"
            :title="'关闭'"
            @click.stop="onClose(tab, index)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 6 18 18" />
              <path d="M6 18 18 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <button
      v-if="overflow"
      type="button"
      class="pro-layout-tabs__nav"
      aria-label="向右滚动标签"
      @click="scroll(200)"
    >
      ›
    </button>
    <el-dropdown
      trigger="click"
      placement="bottom-end"
      :popper-style="surfaceStyle"
      @command="action => onAction(action, activeKey)"
    >
      <button type="button" class="pro-layout-tabs__more" aria-label="标签页操作">•••</button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="action in actions"
            :key="action.value"
            :command="action.value"
            :disabled="actionDisabled(action.value, activeKey)"
            >{{ action.label }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <Teleport to="body">
      <div
        v-if="context"
        ref="contextRef"
        class="pro-layout-tabs-context"
        role="menu"
        :style="{ ...surfaceStyle, left: context.x + 'px', top: context.y + 'px' }"
        @keydown.esc="context = undefined"
      >
        <button
          v-for="action in actions"
          :key="action.value"
          type="button"
          role="menuitem"
          :disabled="actionDisabled(action.value, context.key)"
          @click="onAction(action.value, context.key)"
        >
          {{ action.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import Sortable from 'sortablejs'
import type { Component, VNodeChild } from 'vue'
import type { LayoutTabItem } from './types'
import { renderLayoutIcon, resolveLayoutTabCloseKeys } from './utils'
import type { LayoutTabAction } from './utils'
import { useSurfaceStyle } from './use-surface-style'

defineOptions({ name: 'ProLayoutTabs' })

const props = withDefaults(
  defineProps<{
    tabs?: LayoutTabItem[]
    activeKey?: string
    height?: number
  }>(),
  { tabs: () => [], activeKey: '', height: 35 }
)

const emit = defineEmits<{
  change: [key: string]
  close: [key: string, index: number]
  contextmenu: [event: MouseEvent, tab: LayoutTabItem]
  action: [action: LayoutTabAction, key: string, closeKeys: string[]]
  reorder: [keys: string[]]
}>()

const items = computed(() => props.tabs)
const surfaceStyle = useSurfaceStyle()

const wrapperStyle = computed(() => ({
  height: `${props.height}px`
}))

function isClosable(tab: LayoutTabItem, index: number) {
  if (tab.affix) return false
  if (tab.closable === false) return false
  return !tab.disabled && index >= 0
}

function onClick(tab: LayoutTabItem, _index: number) {
  if (tab.disabled) return
  if (tab.key === props.activeKey) return
  emit('change', tab.key)
}

function onClose(tab: LayoutTabItem, index: number) {
  if (!isClosable(tab, index)) return
  emit('close', tab.key, index)
}

function renderIcon(icon: Component | (() => VNodeChild) | VNodeChild | undefined): VNodeChild {
  return renderLayoutIcon(icon as never)
}

const viewportRef = ref<HTMLDivElement | null>(null)
const listRef = ref<HTMLDivElement | null>(null)
const contextRef = ref<HTMLDivElement>()
const overflow = ref(false)
const context = ref<{ key: string; x: number; y: number }>()
const actions: { value: LayoutTabAction; label: string }[] = [
  { value: 'reload', label: '重新加载' },
  { value: 'closeOther', label: '关闭其他' },
  { value: 'closeLeft', label: '关闭左侧' },
  { value: 'closeRight', label: '关闭右侧' },
  { value: 'closeAll', label: '关闭全部' }
]
function actionDisabled(action: LayoutTabAction, key: string) {
  if (action === 'reload') return !key || key !== props.activeKey
  return resolveLayoutTabCloseKeys(props.tabs, key, action).length === 0
}
function onAction(action: LayoutTabAction, key: string) {
  if (actionDisabled(action, key)) return
  emit('action', action, key, resolveLayoutTabCloseKeys(props.tabs, key, action))
  context.value = undefined
}
function openContext(event: MouseEvent, tab: LayoutTabItem) {
  emit('contextmenu', event, tab)
  context.value = {
    key: tab.key,
    x: Math.max(0, Math.min(event.clientX, window.innerWidth - 156)),
    y: Math.max(0, Math.min(event.clientY, window.innerHeight - 190))
  }
  void nextTick(() =>
    contextRef.value?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
  )
}
function dismissContext(event: Event) {
  if (!contextRef.value?.contains(event.target as Node)) context.value = undefined
}
function scroll(left: number) {
  viewportRef.value?.scrollBy({ left, behavior: 'smooth' })
}
function onWheel(event: WheelEvent) {
  scroll(event.deltaX || event.deltaY)
}
function onKeydown(event: KeyboardEvent, tab: LayoutTabItem, index: number) {
  if (event.target !== event.currentTarget) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onClick(tab, index)
  }
  if (event.key === 'Delete') onClose(tab, index)
  if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault()
    const enabled = items.value.filter(item => !item.disabled)
    const current = enabled.findIndex(item => item.key === tab.key)
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : (current + (event.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length
    const target = enabled[next]
    if (target) {
      emit('change', target.key)
      const nodes = listRef.value?.querySelectorAll<HTMLElement>('[role=tab]')
      nodes?.[items.value.findIndex(item => item.key === target.key)]?.focus()
    }
  }
}
function checkOverflow() {
  const el = viewportRef.value
  overflow.value = Boolean(el && el.scrollWidth > el.clientWidth + 1)
}
async function scrollToActive() {
  await nextTick()
  checkOverflow()
  const index = items.value.findIndex(tab => tab.key === props.activeKey)
  const el = listRef.value?.children[index] as HTMLElement | undefined
  const viewport = viewportRef.value
  if (!el || !viewport) return
  const offset = el.offsetLeft - listRef.value!.offsetLeft
  if (offset < viewport.scrollLeft) viewport.scrollLeft = offset
  else if (offset + el.offsetWidth > viewport.scrollLeft + viewport.clientWidth)
    viewport.scrollLeft = offset + el.offsetWidth - viewport.clientWidth
}
let observer: ResizeObserver | undefined
let sortable: Sortable | undefined
onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(checkOverflow)
    if (viewportRef.value) observer.observe(viewportRef.value)
    if (listRef.value) observer.observe(listRef.value)
  }
  if (listRef.value)
    sortable = Sortable.create(listRef.value, {
      animation: 150,
      draggable: '.pro-layout-tabs__item:not(.is-affix):not(.is-disabled)',
      filter: 'button',
      preventOnFilter: false,
      onMove: event => !event.related.classList.contains('is-affix'),
      onEnd: event => {
        const { oldIndex, newIndex, item, from } = event
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
        // 还原 Sortable 的 DOM 修改，由调用方更新数据后交给 Vue 排序。
        from.removeChild(item)
        from.insertBefore(item, from.children[oldIndex] ?? null)
        const order = [...items.value]
        const moved = order.splice(oldIndex, 1)[0]
        if (!moved) return
        order.splice(newIndex, 0, moved)
        emit(
          'reorder',
          order.map(tab => tab.key)
        )
      }
    })
  document.addEventListener('pointerdown', dismissContext)
  window.addEventListener('resize', dismissContext)
  void scrollToActive()
})
watch(() => [props.activeKey, props.tabs], scrollToActive, { deep: true })
onBeforeUnmount(() => {
  observer?.disconnect()
  sortable?.destroy()
  document.removeEventListener('pointerdown', dismissContext)
  window.removeEventListener('resize', dismissContext)
})
</script>

<style scoped lang="scss">
.pro-layout-tabs {
  --pro-tab-radius: 6px;
  --pro-tab-gap: 6px;
  --pro-tab-padding-x: 10px;
  --pro-tab-padding-y: 4px;
  --pro-tab-hover-bg: var(--pro-layout-fill);
  --pro-tab-active-bg: linear-gradient(
    180deg,
    var(--el-fill-color, rgba(55, 65, 81, 0.09)) 0%,
    var(--pro-layout-fill, rgba(55, 65, 81, 0.04)) 100%
  );
  --pro-tab-active-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 1px rgba(15, 23, 42, 0.04),
    inset 0 0 0 1px var(--pro-layout-line);
  --pro-tab-close-color: var(--pro-layout-text-placeholder);
  --pro-tab-close-hover-bg: var(--el-fill-color, rgba(55, 65, 81, 0.1));

  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: var(--pro-tab-padding-y) 10px;

  &__viewport {
    flex: 1 1 auto;
    overflow: auto;
    scrollbar-width: none;
    height: 100%;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__list {
    display: flex;
    align-items: center;
    height: 100%;
    width: max-content;
    min-width: 100%;
    gap: var(--pro-tab-gap);
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  }

  &__item {
    position: relative;
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    gap: 7px;
    box-sizing: border-box;
    max-width: 240px;
    height: auto;
    padding: var(--pro-tab-padding-y) var(--pro-tab-padding-x);
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: 0.01em;
    color: var(--pro-layout-text-secondary);
    background: transparent;
    border: 0;
    border-radius: var(--pro-tab-radius);
    cursor: pointer;
    transition:
      color 0.18s ease,
      background-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.12s ease;

    &:hover:not(.is-disabled) {
      color: var(--pro-layout-text-regular);
      background: var(--pro-tab-hover-bg);
    }

    &:active:not(.is-disabled) {
      transform: scale(0.985);
    }

    &.is-active {
      color: var(--pro-layout-heading-color);
      font-weight: 600;
      background: var(--pro-tab-active-bg);
      box-shadow: var(--pro-tab-active-shadow);
    }

    &.is-disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__label {
    display: block;
    min-width: 0;
    max-width: 150px;
    overflow: hidden;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    color: inherit;
    opacity: 0.85;

    :deep(svg) {
      width: 14px;
      height: 14px;
    }
  }

  &__affix {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 1px;
    color: var(--pro-tab-close-color);

    svg {
      display: block;
    }
  }

  &__close {
    border: 0;
    background: transparent;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin: 0 -2px 0 2px;
    flex-shrink: 0;
    border-radius: 4px;
    color: var(--pro-tab-close-color);
    cursor: pointer;
    transition:
      color 0.16s ease,
      background-color 0.16s ease,
      transform 0.12s ease;

    &:hover {
      color: var(--pro-layout-text-regular);
      background: var(--pro-tab-close-hover-bg);
      transform: scale(1.05);
    }
  }
}
</style>

<style lang="scss">
.pro-layout-tabs__nav,
.pro-layout-tabs__more {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 24px;
  border: 0;
  border-radius: 5px;
  color: var(--pro-layout-text-secondary);
  background: transparent;
  cursor: pointer;
  &:hover {
    background: var(--pro-layout-fill);
  }
}
.pro-layout-tabs__more {
  margin-left: 8px;
  border-left: 1px solid var(--pro-layout-line);
}
.pro-layout-tabs-context {
  position: fixed;
  z-index: 3100;
  width: 156px;
  padding: 5px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color-overlay, #fff);
  box-shadow: var(--el-box-shadow-light);
  button {
    display: block;
    width: 100%;
    padding: 8px 12px;
    border: 0;
    border-radius: 4px;
    text-align: left;
    color: var(--el-text-color-regular);
    background: transparent;
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
      background: var(--el-fill-color-light);
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}
</style>
