<template>
  <el-drawer
    v-model="visibleSync"
    class="pro-layout-settings"
    :style="surfaceStyle"
    :with-header="false"
    direction="rtl"
    :size="typeof size === 'number' ? `min(${size}px, 100%)` : `min(${size}, 100%)`"
    :append-to-body="!contained"
    :lock-scroll="!contained"
    :modal-class="contained ? 'pro-layout__drawer-overlay' : undefined"
  >
    <div class="settings">
      <header class="settings-header">
        <h2>系统布局配置</h2>
        <button
          class="settings-header__close"
          aria-label="关闭布局设置"
          type="button"
          @click="emit('update:visible', false)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 6 18 18" />
            <path d="M6 18 18 6" />
          </svg>
        </button>
      </header>

      <div class="settings-body">
        <section class="settings-section">
          <h3>主题</h3>
          <div class="settings-item">
            <span class="settings-item__label">应用主题</span>
            <el-radio-group :model-value="config.theme" size="small" @change="onThemeChange">
              <el-radio-button value="light">亮色</el-radio-button>
              <el-radio-button value="dark">暗色</el-radio-button>
            </el-radio-group>
          </div>
          <div class="settings-item">
            <span class="settings-item__label">主题色</span>
            <el-color-picker
              :model-value="config.themeColor"
              size="small"
              @change="(v: string | null) => emit('change', 'themeColor', v || config.themeColor)"
            />
          </div>
          <div class="settings-item settings-item--block">
            <span class="settings-item__label">预设颜色</span>
            <div class="settings-swatches" role="group" aria-label="主题色预设">
              <button
                v-for="swatch in swatches"
                :key="swatch"
                type="button"
                class="settings-swatch"
                :class="{ 'is-active': config.themeColor === swatch }"
                :style="{ '--sw': swatch }"
                :aria-label="`切换主题色 ${swatch}`"
                :aria-pressed="config.themeColor === swatch"
                @click="emit('change', 'themeColor', swatch)"
              >
                <span class="settings-swatch__ring" aria-hidden="true"></span>
                <el-icon
                  v-if="config.themeColor === swatch"
                  class="settings-swatch__check"
                  size="10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="10"
                    height="10"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </el-icon>
              </button>
            </div>
          </div>
          <div class="settings-item">
            <span class="settings-item__label">深色侧边栏</span>
            <el-switch
              :model-value="config.sidebarTheme === 'dark'"
              :disabled="config.theme === 'dark'"
              @change="
                (v: boolean | string | number) =>
                  emit('change', 'sidebarTheme', v ? 'dark' : 'light')
              "
            />
          </div>
          <div class="settings-item">
            <span class="settings-item__label">深色顶部导航</span>
            <el-switch
              :model-value="config.headerTheme === 'dark'"
              :disabled="config.theme === 'dark'"
              @change="
                (v: boolean | string | number) =>
                  emit('change', 'headerTheme', v ? 'dark' : 'light')
              "
            />
          </div>
          <div
            v-if="config.sidebarTheme === 'dark' || config.headerTheme === 'dark'"
            class="settings-item"
          >
            <span class="settings-item__label">深色导航背景</span>
            <el-color-picker
              :model-value="config.darkMenuBackground"
              :disabled="config.theme === 'dark'"
              size="small"
              @change="
                (v: string | null) =>
                  emit('change', 'darkMenuBackground', v || config.darkMenuBackground)
              "
            />
          </div>
        </section>

        <section class="settings-section">
          <h3>导航模式</h3>
          <ProLayoutCheckButtonGroup
            :model-value="config.layoutMode"
            :options="layoutModeOptions"
            @change="(v: string) => emit('change', 'layoutMode', v)"
          />
        </section>

        <section class="settings-section">
          <h3>菜单</h3>
          <div class="settings-item">
            <span class="settings-item__label">折叠菜单</span>
            <el-switch
              :model-value="config.collapsed"
              @change="(v: boolean | string | number) => emit('change', 'collapsed', Boolean(v))"
            />
          </div>
          <div class="settings-item">
            <span class="settings-item__label">分割菜单</span>
            <el-switch
              :model-value="config.splitMenu"
              :disabled="config.layoutMode !== 'topMix'"
              @change="(v: boolean | string | number) => emit('change', 'splitMenu', Boolean(v))"
            />
          </div>
          <div v-if="config.layoutMode === 'topMix' && config.splitMenu" class="settings-item">
            <span class="settings-item__label">无子菜单时显示侧栏</span>
            <el-switch
              :model-value="config.showEmptySplitSidebar"
              @change="
                (v: boolean | string | number) =>
                  emit('change', 'showEmptySplitSidebar', Boolean(v))
              "
            />
          </div>
          <div class="settings-item">
            <span class="settings-item__label">侧栏展开宽度</span>
            <el-input-number
              :model-value="config.asideWidth"
              :min="180"
              :max="320"
              :step="10"
              size="small"
              @change="
                (v: number | undefined) => emit('change', 'asideWidth', v ?? config.asideWidth)
              "
            />
          </div>
        </section>

        <section class="settings-section">
          <h3>页面区域</h3>
          <div class="settings-item">
            <span class="settings-item__label">面包屑导航</span>
            <el-switch
              :model-value="config.showBreadcrumb"
              @change="
                (v: boolean | string | number) => emit('change', 'showBreadcrumb', Boolean(v))
              "
            />
          </div>
          <div class="settings-item">
            <span class="settings-item__label">标签栏</span>
            <el-switch
              :model-value="config.showTabs"
              @change="(v: boolean | string | number) => emit('change', 'showTabs', Boolean(v))"
            />
          </div>
          <div class="settings-item">
            <span class="settings-item__label">页脚</span>
            <el-switch
              :model-value="config.showFooter"
              @change="(v: boolean | string | number) => emit('change', 'showFooter', Boolean(v))"
            />
          </div>
        </section>
        <slot :config="config" :set-setting="setSetting" />

        <section class="settings-section">
          <h3>尺寸</h3>
          <div class="settings-dimension-grid">
            <label class="settings-dimension">
              <span>头部高度</span>
              <el-input-number
                :model-value="config.headerHeight"
                :min="40"
                :max="80"
                :step="2"
                size="small"
                @change="
                  (v: number | undefined) =>
                    emit('change', 'headerHeight', v ?? config.headerHeight)
                "
              />
            </label>
            <label class="settings-dimension">
              <span>标签栏高度</span>
              <el-input-number
                :model-value="config.tabHeight"
                :min="28"
                :max="60"
                :step="2"
                size="small"
                @change="
                  (v: number | undefined) => emit('change', 'tabHeight', v ?? config.tabHeight)
                "
              />
            </label>
          </div>
        </section>
      </div>

      <footer class="settings-footer">
        <el-button size="small" @click="emit('reset')">重置</el-button>
        <el-button size="small" type="primary" @click="onCopy"> 复制配置 </el-button>
      </footer>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProLayoutTheme } from './theme'
import {
  ElButton,
  ElIcon,
  ElMessage,
  ElColorPicker,
  ElDrawer,
  ElInputNumber,
  ElRadioButton,
  ElRadioGroup,
  ElSwitch
} from 'element-plus'
import ProLayoutCheckButtonGroup from './pro-layout-check-button-group.vue'
import {
  LayoutIconSide,
  LayoutIconSideMix,
  LayoutIconTop,
  LayoutIconTopMix
} from './icons/mode-icons'
import type { LayoutConfig, LayoutMode } from './types'
import { layoutThemeSwatches } from './types'
import { exportLayoutConfig } from './utils'

defineOptions({ name: 'ProLayoutSettings' })

const props = withDefaults(
  defineProps<{
    visible?: boolean
    config: LayoutConfig
    bindTheme?: boolean
    themeSwatches?: string[]
    size?: string | number
    /** 在 ProLayout 内展示抽屉和遮罩，不锁定页面滚动 */
    contained?: boolean
  }>(),
  { visible: false, themeSwatches: () => [], size: '420px', contained: false, bindTheme: true }
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  change: [key: keyof LayoutConfig, value: LayoutConfig[keyof LayoutConfig]]
  reset: []
}>()
const swatches = computed(() =>
  props.themeSwatches.length ? props.themeSwatches : layoutThemeSwatches
)
function setSetting(key: keyof LayoutConfig, value: LayoutConfig[keyof LayoutConfig]) {
  emit('change', key, value)
}

const themeVars = useProLayoutTheme(() => props.config)
const surfaceStyle = computed(() => (props.bindTheme ? themeVars.value : {}))
const visibleSync = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v)
})

const layoutModeOptions: { title: string; value: LayoutMode; icon: typeof LayoutIconSide }[] = [
  { title: '侧边栏布局', value: 'side', icon: LayoutIconSide },
  { title: '顶部菜单布局', value: 'top', icon: LayoutIconTop },
  { title: '顶部混合菜单', value: 'topMix', icon: LayoutIconTopMix },
  { title: '左侧菜单混合', value: 'sideMix', icon: LayoutIconSideMix }
]

async function onCopy() {
  const text = JSON.stringify(exportLayoutConfig(props.config), null, 2)
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    ElMessage.warning('当前环境不支持复制配置')
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('配置已复制')
  } catch {
    ElMessage.error('复制失败，请检查剪贴板权限')
  }
}

function onThemeChange(value: string | number | boolean | undefined) {
  const next: LayoutConfig['theme'] = value === 'dark' ? 'dark' : 'light'
  emit('change', 'theme', next)
}
</script>

<style scoped lang="scss">
.settings {
  --pro-layout-text-regular: var(--el-text-color-regular);
  --pro-layout-text-secondary: var(--el-text-color-secondary);
  --pro-layout-heading-color: var(--el-text-color-primary);
  --pro-layout-line: var(--el-border-color-light);
  --pro-layout-surface: var(--el-bg-color-overlay);
  --pro-layout-hover-bg: var(--el-fill-color-light);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: var(--pro-layout-text-regular);
  background-color: var(--pro-layout-surface);
}

.settings-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid var(--pro-layout-line);

  h2 {
    margin: 0;
    color: var(--pro-layout-heading-color);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0;
  }

  &__close {
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
    color: var(--pro-layout-text-regular);
    transition:
      background-color 0.18s ease,
      color 0.18s ease;

    &:hover {
      color: var(--el-color-primary);
      background: var(--pro-layout-hover-bg);
    }
  }
}

.settings-body {
  min-height: 0;
  flex: 1 1 auto;
  padding: 4px 20px 16px;
  overflow-x: hidden;
  overflow-y: auto;
}

.settings-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--pro-layout-line);

  &:last-child {
    border-bottom: 0;
  }

  h3 {
    margin: 0 0 10px;
    color: var(--pro-layout-text-secondary);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0;
  }
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  gap: 16px;
  font-size: 14px;
  padding: 4px 0;

  &__label {
    color: var(--pro-layout-text-regular);
    font-weight: 500;
  }

  &--block {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding: 8px 0 10px;
  }
}

.settings-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.settings-swatch {
  position: relative;
  width: 28px;
  height: 28px;
  padding: 0;
  cursor: pointer;
  background: var(--sw);
  border: 0;
  border-radius: 999px;
  outline: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  -webkit-tap-highlight-color: transparent;

  &::after {
    position: absolute;
    inset: 0;
    content: '';
    pointer-events: none;
    border: 1px solid rgba(15, 23, 42, 6%);
    border-radius: inherit;
  }

  .settings-swatch__ring {
    position: absolute;
    inset: -4px;
    border: 2px solid var(--sw);
    border-radius: 999px;
    opacity: 0;
    transform: scale(0.9);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
    pointer-events: none;
  }

  .settings-swatch__check {
    position: absolute;
    inset: 0;
    margin: auto;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px color-mix(in srgb, var(--sw) 32%, transparent);
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--sw) 28%, transparent);
  }

  &.is-active .settings-swatch__ring {
    opacity: 1;
    transform: scale(1);
  }
}

.settings-dimension-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.settings-dimension {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  color: var(--pro-layout-text-regular);
  font-size: 13px;
  font-weight: 500;
}

.settings-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  flex-shrink: 0;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid var(--pro-layout-line);
  background: var(--pro-layout-surface);

  :deep(.el-button) {
    width: 100%;
    height: 36px;
    margin: 0;
  }
}

:deep(.el-color-picker__trigger) {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

:deep(.el-input-number) {
  width: 140px;
}
</style>
