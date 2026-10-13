<template>
  <div class="pro-layout-demo">
    <div class="pro-layout-demo__toolbar">
      <el-radio-group
        :model-value="layoutModeSync"
        size="small"
        @change="(v: string) => store.setLayoutMode(v as typeof store.config.layoutMode)"
      >
        <el-radio-button value="side">侧边栏</el-radio-button>
        <el-radio-button value="top">顶部</el-radio-button>
        <el-radio-button value="topMix">顶部分割</el-radio-button>
        <el-radio-button value="sideMix">侧边混合</el-radio-button>
      </el-radio-group>
      <div class="pro-layout-demo__toolbar-right">
        <el-switch
          :model-value="store.config.collapsed"
          inline-prompt
          active-text="收起"
          inactive-text="展开"
          @change="(v: boolean | string | number) => store.setCollapsed(Boolean(v))"
        />
        <el-button size="small" :icon="Setting" @click="store.openSettings()">
          打开设置抽屉
        </el-button>
        <el-color-picker
          size="small"
          :model-value="store.config.themeColor"
          @change="(v: string | null) => v && store.setThemeColor(v)"
        />
      </div>
    </div>

    <div class="pro-layout-demo__hint">
      <el-tag size="small" type="info" effect="plain">单 store 共享</el-tag>
      <span>
        下方两个 ProLayout 实例通过 :store 传入同一份 store —— 切换模式 / 折叠 /
        主题色在两端同步刷新。
      </span>
    </div>

    <div class="pro-layout-demo__row">
      <ProLayout
        v-model:active-key="activeKey"
        v-model:active-tab-key="activeKey"
        class="pro-layout-demo__box"
        :store="store"
        :title="'Framebase'"
        :menus="menus"
        :tabs="tabs"
        :breadcrumbs="breadcrumbs"
        :height="'480px'"
        :content-padding="12"
        :show-footer="true"
        :footer-text="'内部布局 #1'"
        :user-name="'管理员 A'"
        @menu-select="selectMenu"
        @tab-change="key => (activeKey = key)"
        @tab-close="closeTab"
        @tab-action="onTabAction"
        @tab-reorder="onTabReorder"
      >
        <h3 class="pro-layout-demo__title">主布局</h3>
        <p v-for="row in 8" :key="row" class="pro-layout-demo__row-content">占位内容行 {{ row }}</p>
      </ProLayout>

      <ProLayout
        class="pro-layout-demo__box"
        :store="store"
        :title="'Framebase'"
        :menus="menus"
        :height="'480px'"
        :content-padding="12"
        :show-back-top="true"
        :user-name="'管理员 B'"
        :show-settings="false"
        @menu-select="k => ElMessage.info(`#2 选中菜单：${k}`)"
      >
        <h3 class="pro-layout-demo__title">从布局</h3>
        <p v-for="row in 8" :key="row" class="pro-layout-demo__row-content">占位内容行 {{ row }}</p>
      </ProLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, ref } from 'vue'
import { Setting, Odometer, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  ProLayout,
  createProLayoutStore,
  type LayoutBreadcrumbItem,
  type LayoutMenuItem,
  type LayoutTabItem,
  type LayoutTabAction
} from '@framebase/element-plus-pro-components'

/** 手动创建 store，并通过 :store 传给两个 ProLayout 实现共享 */
const store = createProLayoutStore({ syncDocumentTheme: false })
onBeforeUnmount(() => store.destroy())
const activeKey = ref('dashboard')

const layoutModeSync = computed(() => store.config.layoutMode)

const menus: LayoutMenuItem[] = [
  { key: 'dashboard', title: '工作台', icon: markRaw(Odometer) },
  {
    key: 'system',
    title: '系统管理',
    icon: markRaw(Setting),
    children: [
      { key: 'system-user', title: '用户管理' },
      { key: 'system-role', title: '角色管理' }
    ]
  },
  {
    key: 'docs',
    title: '内容管理',
    icon: markRaw(Document),
    children: [
      { key: 'docs-article', title: '文章列表' },
      { key: 'docs-category', title: '分类管理' }
    ]
  }
]

const tabs = ref<LayoutTabItem[]>([
  { key: 'dashboard', label: '工作台', affix: true },
  { key: 'system-user', label: '用户管理' },
  { key: 'docs-article', label: '文章列表' }
])

const breadcrumbs = computed<LayoutBreadcrumbItem[]>(() => [
  { text: '首页' },
  { text: tabs.value.find(tab => tab.key === activeKey.value)?.label ?? '工作台' }
])

function selectMenu(key: string, item?: LayoutMenuItem) {
  if (!item || item.children?.length) return
  activeKey.value = key
  if (!tabs.value.some(tab => tab.key === key)) {
    tabs.value.push({ key, label: item.title, icon: item.icon })
  }
}
function removeTabs(keys: string[]) {
  tabs.value = tabs.value.filter(
    tab => !keys.includes(tab.key) || tab.affix || tab.closable === false
  )
  if (!tabs.value.some(tab => tab.key === activeKey.value))
    activeKey.value = tabs.value[0]?.key ?? ''
}
function closeTab(key: string) {
  removeTabs([key])
}
function onTabAction(action: LayoutTabAction, key: string, keys: string[]) {
  if (action === 'reload') ElMessage.success(`已刷新：${key}`)
  else removeTabs(keys)
}
function onTabReorder(keys: string[]) {
  const byKey = new Map(tabs.value.map(tab => [tab.key, tab]))
  tabs.value = keys.flatMap(key => (byKey.has(key) ? [byKey.get(key)!] : []))
}
</script>

<style scoped>
.pro-layout-demo {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pro-layout-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pro-layout-demo__toolbar-right {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.pro-layout-demo__hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.pro-layout-demo__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

.pro-layout-demo__box {
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
}

.pro-layout-demo__title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
}

.pro-layout-demo__row-content {
  margin: 0 0 6px;
  color: var(--el-text-color-regular);
}

@media (max-width: 980px) {
  .pro-layout-demo__row {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
