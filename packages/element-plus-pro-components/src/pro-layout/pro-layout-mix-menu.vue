<template>
  <div
    :class="['pro-layout-mix-menu', fixed ? 'is-fixed' : '']"
    tabindex="-1"
    @focusout="onFocusOut"
  >
    <div class="pro-layout-mix-menu__module">
      <button
        v-for="item in menus"
        :key="item.key"
        type="button"
        :disabled="item.disabled"
        :class="['pro-layout-mix-menu__item', item.key === activeRootKey ? 'is-active' : '']"
        :title="item.title"
        @click="onClick(item)"
      >
        <div :class="['pro-layout-mix-menu__icon', !renderIcon(item.icon) ? 'no-icon' : '']">
          <component
            :is="renderIcon(item.icon)"
            v-if="typeof item.icon !== 'string' && renderIcon(item.icon)"
          />
          <span v-else>{{ resolveLayoutBrandInitial(item.title) }}</span>
        </div>
        <div class="pro-layout-mix-menu__label">{{ item.title }}</div>
        <span
          v-show="item.key === activeRootKey"
          class="pro-layout-mix-menu__line"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      :class="['pro-layout-mix-menu__children', showChildren ? 'is-show' : '']"
      :style="{ width: showChildren ? `${menuWidth}px` : '0px' }"
    >
      <div class="pro-layout-mix-menu__children-inner">
        <div class="pro-layout-mix-menu__children-header" :style="{ height: headerHeight + 'px' }">
          <span class="pro-layout-mix-menu__children-title">{{
            menus.find(item => item.key === activeRootKey)?.title
          }}</span>
          <button
            type="button"
            class="pro-layout-mix-menu__pin"
            :aria-label="fixed ? '取消固定子菜单' : '固定子菜单'"
            :title="fixed ? '取消固定子菜单' : '固定子菜单'"
            @mousedown.prevent.stop
            @click.stop="toggleFixed"
          >
            <PushpinIcon />
          </button>
        </div>

        <div class="pro-layout-mix-menu__children-content">
          <el-menu
            :default-active="activeKey"
            :popper-class="'pro-layout-menu__popper'"
            class="pro-layout-menu"
            :router="router"
            @select="onChildSelect"
          >
            <ProLayoutMenuItem
              v-for="child in activeChildren"
              :key="child.key"
              :item="child"
              :router="router"
            />
          </el-menu>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMenu } from 'element-plus'
import ProLayoutMenuItem from './pro-layout-menu-item.vue'
import { PushpinIcon } from './icons/mode-icons'
import type { LayoutMenuItem } from './types'
import {
  resolveLayoutBrandInitial,
  renderLayoutIcon,
  findLayoutRootMenu,
  findLayoutMenu
} from './utils'

defineOptions({ name: 'ProLayoutMixMenu' })

const props = withDefaults(
  defineProps<{
    menus: LayoutMenuItem[]
    activeKey: string
    /** 图标列 + 子菜单面板宽度，比例 = 60 + N */
    menuWidth?: number
    /** 子菜单面板顶部高度 */
    headerHeight?: number
    /** 图钉固定（侧栏不离开后保持打开） */
    fixed?: boolean
    /** el-menu 是否使用 router 模式 */
    router?: boolean
  }>(),
  {
    menuWidth: 200,
    headerHeight: 44,
    fixed: false,
    router: false
  }
)

const emit = defineEmits<{
  select: [key: string, item: LayoutMenuItem]
  'update:fixed': [value: boolean]
  'children-visible': [value: boolean]
}>()

const showChildren = ref(false)
const activeChildren = ref<LayoutMenuItem[]>([])
const selectedRoot = ref('')
const navigationRouter = props.router ? useRouter() : undefined
const activeRootKey = computed(
  () =>
    selectedRoot.value || findLayoutRootMenu(props.menus, props.activeKey)?.key || props.activeKey
)

function findActiveChildren() {
  const root = props.menus.find(m => m.key === activeRootKey.value)
  if (!root?.children?.length) {
    activeChildren.value = []
    showChildren.value = false
    return
  }
  activeChildren.value = root.children
  if (props.fixed) showChildren.value = true
}
findActiveChildren()
watch(
  () => [props.activeKey, props.menus] as const,
  () => {
    selectedRoot.value = ''
    findActiveChildren()
  },
  { deep: true }
)
watch(() => props.fixed, findActiveChildren)

function onClick(item: LayoutMenuItem) {
  if (item.disabled) return
  selectedRoot.value = item.key
  findActiveChildren()
  showChildren.value = Boolean(item.children?.length)
  if (!item.children?.length) {
    emit('select', item.key, item)
    if (navigationRouter)
      void navigationRouter.push(item.path ? { path: item.path } : { name: item.key })
  }
}

function onChildSelect(key: string) {
  const item = findLayoutMenu(props.menus, key)
  if (item) emit('select', item.key, item)
  if (!props.fixed) showChildren.value = false
}

function onFocusOut(event: FocusEvent) {
  if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) return
  leaveChildrenMenuHandler()
}

function leaveChildrenMenuHandler() {
  if (props.fixed && showChildren.value) return
  showChildren.value = false
}

function toggleFixed() {
  emit('update:fixed', !props.fixed)
}

function renderIcon(icon: unknown) {
  return renderLayoutIcon(icon as never)
}

watch(showChildren, value => emit('children-visible', value), { immediate: true })
</script>

<style scoped lang="scss">
$mix-width: 60px;
$mix-icon-size: 22px;

.pro-layout-mix-menu {
  --pro-layout-mix-width: #{$mix-width};
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
  overflow: visible;

  &__module {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    box-sizing: border-box;
    width: var(--pro-layout-mix-width);
    height: 100%;
    padding: 8px 4px;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  }

  &__item {
    border: 0;
    font: inherit;
    position: relative;
    display: grid;
    grid-template-rows: 22px auto;
    align-content: center;
    justify-items: center;
    box-sizing: border-box;
    width: 100%;
    max-width: 52px;
    height: 52px;
    min-height: 52px;
    padding: 4px 0;
    margin: 0 0 6px;
    cursor: pointer;
    background-color: transparent;
    border-radius: 6px;
    row-gap: 4px;
    color: var(--pro-layout-text-regular);
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    transition:
      background-color 0.18s ease,
      color 0.18s ease;

    &:hover:not(.is-active) {
      background-color: var(--pro-layout-hover-bg);
      color: var(--pro-layout-text-primary);
    }

    &.is-active {
      background-color: var(--el-color-primary);
      color: #fff;

      .pro-layout-mix-menu__label,
      .pro-layout-mix-menu__icon :is(.el-icon, svg) {
        color: #fff;
      }
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    min-width: 22px;
    margin: 0 auto;
    position: relative;
    line-height: 1;
    font-size: 16px;

    :deep(svg) {
      display: block;
      width: 20px;
      height: 20px;
    }

    &.no-icon {
      background: var(--pro-layout-surface-muted);
      border-radius: 4px;
      color: var(--pro-layout-text-secondary);
      font-weight: 600;
      font-size: 12px;
    }
  }

  &__label {
    max-width: 52px;
    margin-top: 0;
    font-size: 10px;
    line-height: 1.2;
    color: var(--pro-layout-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__line {
    position: absolute;
    left: -1px;
    top: 50%;
    width: 3px;
    height: 20px;
    border-radius: 0 3px 3px 0;
    background-color: var(--el-color-primary);
    transform: translateY(-50%);
  }

  &__children {
    position: fixed;
    z-index: 1003;
    top: 0;
    bottom: 0;
    left: var(--pro-layout-mix-width);
    height: 100vh;
    box-sizing: border-box;
    overflow: hidden;
    background-color: var(--pro-layout-aside-bg);
    border-right: 1px solid var(--pro-layout-line);
    box-shadow: var(--el-box-shadow-light);
    transition: width 0.2s ease;

    &.is-show {
      padding: 0 8px;
    }
  }

  &__children-inner {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &__children-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
  }

  &__children-title {
    padding-left: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--pro-layout-heading-color);
  }

  &__pin {
    position: absolute;
    top: 50%;
    right: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;
    color: var(--pro-layout-text-secondary);
    transform: translateY(-50%);
    transition:
      background-color 0.18s ease,
      color 0.18s ease;

    &:hover {
      color: var(--el-color-primary);
      background: var(--pro-layout-hover-bg);
    }

    :deep(svg) {
      width: 14px;
      height: 14px;
    }
  }

  &__children-content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    :deep(.el-menu) {
      min-height: 0;
      flex: 1 1 auto;
      padding: 8px;
      overflow-x: hidden;
      overflow-y: auto;

      .el-menu-item,
      .el-sub-menu__title {
        margin: 2px 0;
      }
    }
  }

  &.is-fixed {
    .pro-layout-mix-menu__children {
      position: absolute;
      height: 100%;
      box-shadow: none;
    }
  }
}

html.dark .pro-layout-mix-menu {
  &__module {
    background: transparent;
  }

  &__item:not(.is-active):hover {
    color: var(--pro-layout-text-primary);
  }
}
</style>
