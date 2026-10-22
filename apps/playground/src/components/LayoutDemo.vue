<template>
  <ProLayout
    :store="store"
    :bind-theme="bindTheme"
    title="Framebase Admin"
    :height="height"
    :menus="menus"
    :tabs="tabs"
    :active-key="activeKey"
    :active-tab-key="activeKey"
    :breadcrumbs="breadcrumbs"
    :show-settings="showSettings"
    :mobile="mobile"
    show-back-top
    user-name="admin"
    watermark="Framebase Admin"
    footer-text="Copyright 2021 - 2026 by Framebase"
    @menu-select="selectMenu"
    @tab-change="selectTab"
    @tab-close="closeTabs([$event])"
    @tab-action="tabAction"
    @tab-reorder="reorderTabs"
    @user-command="command => ElMessage.info(`用户操作：${command}`)"
  >
    <template #header-actions>
      <slot name="header-actions">
        <RouterLink class="layout-demo-back" :to="height ? '/layout/preview' : '/layout'">{{
          height ? '全屏预览' : '返回示例'
        }}</RouterLink>
      </slot>
    </template>
    <template #menu-title="{ item, active }">
      <span :class="['layout-demo-menu-title', active && 'is-active']">{{ item.title }}</span>
    </template>
    <template #menu-extra="{ item, level }">
      <el-badge
        v-if="menuBadges[item.key]"
        class="layout-demo-menu-badge"
        :value="menuBadges[item.key]"
        :max="99"
        :type="level === 0 ? 'primary' : 'danger'"
      />
    </template>
    <template #tabs-prefix="{ store: layoutStore }">
      <el-tooltip content="通过插槽访问布局 Store" placement="bottom">
        <button
          class="layout-demo-tabs-action"
          type="button"
          @click="layoutStore.toggleCollapsed()"
        >
          <el-icon><Fold v-if="!layoutStore.config.collapsed" /><Expand v-else /></el-icon>
        </button>
      </el-tooltip>
    </template>
    <template #tabs-extra="{ store: layoutStore }">
      <el-tooltip content="打开布局设置" placement="bottom">
        <button class="layout-demo-tabs-action" type="button" @click="layoutStore.openSettings()">
          <el-icon><Setting /></el-icon>
        </button>
      </el-tooltip>
    </template>
    <section class="layout-demo-hero">
      <div>
        <p>
          {{
            new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })
          }}
        </p>
        <h1>{{ activeTitle }}</h1>
        <p>上午好，管理员。这里是今天需要关注的业务进展。</p>
      </div>
      <div class="layout-demo-actions">
        <el-button @click="refresh">刷新数据</el-button
        ><el-button type="primary" @click="selectMenu('tasks', { key: 'tasks', title: '任务管理' })"
          >新建任务</el-button
        >
      </div>
    </section>
    <div v-if="activeKey === 'dashboard'" class="layout-demo-stats">
      <article v-for="stat in stats" :key="stat.label">
        <p>
          {{ stat.label
          }}<el-icon :style="{ color: stat.color, background: stat.background }"
            ><component :is="stat.icon"
          /></el-icon>
        </p>
        <strong>{{ stat.value }}</strong
        ><small>↗ {{ stat.change }} <span>较昨日</span></small>
      </article>
    </div>
    <section class="layout-demo-card">
      <header>
        <div>
          <h2>{{ activeKey === 'dashboard' ? '最近订单' : activeTitle }}</h2>
          <p>最新业务记录与处理状态</p>
        </div>
        <el-button
          text
          type="primary"
          @click="selectMenu('orders', { key: 'orders', title: '订单管理' })"
          >查看全部</el-button
        >
      </header>
      <el-table :key="refreshKey" :data="records" style="width: 100%"
        ><el-table-column prop="id" label="订单号" min-width="180" /><el-table-column
          prop="customer"
          label="客户"
          min-width="160"
        /><el-table-column prop="amount" label="金额" min-width="100" /><el-table-column
          label="状态"
          min-width="100"
          ><template #default="{ row }"
            ><el-tag :type="row.type" size="small">{{ row.status }}</el-tag></template
          ></el-table-column
        ></el-table
      >
    </section>
    <section class="layout-demo-card">
      <header>
        <div>
          <h2>业务动态</h2>
          <p>团队最新操作记录</p>
        </div>
      </header>
      <div v-for="(activity, index) in activities" :key="index" class="layout-demo-activity">
        <el-avatar :size="30">{{ activity.name.charAt(0) }}</el-avatar>
        <div>
          <strong>{{ activity.name }}</strong> {{ activity.text }}<small>{{ activity.time }}</small>
        </div>
      </div>
    </section>
  </ProLayout>
</template>
<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  House,
  Setting,
  Document,
  ShoppingCart,
  Coin,
  User,
  CircleCheck,
  Grid,
  Link,
  Warning,
  InfoFilled,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  ProLayout,
  createProLayoutStore,
  findLayoutMenu,
  findLayoutRootMenu,
  type LayoutMenuItem,
  type LayoutTabItem,
  type ProLayoutStore,
  type LayoutTabAction
} from '@framebase/element-plus-pro-components'
const props = withDefaults(
  defineProps<{
    height?: string
    store?: ProLayoutStore
    bindTheme?: boolean
    showSettings?: boolean
    mobile?: boolean
  }>(),
  { height: '', showSettings: true, mobile: false, bindTheme: true }
)
const store =
  props.store ??
  createProLayoutStore({
    syncDocumentTheme: !props.height,
    defaults: { headerHeight: 48, tabHeight: 30 }
  })
onBeforeUnmount(() => {
  if (!props.store) store.destroy()
})
const activeKey = ref('dashboard')
const tabs = ref<LayoutTabItem[]>([
  { key: 'dashboard', label: '工作台', icon: markRaw(House), affix: true }
])
const refreshKey = ref(0)
const menus: LayoutMenuItem[] = [
  { key: 'dashboard', title: '工作台', icon: markRaw(House) },
  { key: 'reports', title: '经营报表', icon: markRaw(Document) },
  {
    key: 'system',
    title: '系统管理',
    icon: markRaw(Grid),
    children: [
      { key: 'users', title: '用户管理', icon: markRaw(User) },
      { key: 'roles', title: '角色管理', icon: markRaw(Setting) },
      {
        key: 'organization',
        title: '组织管理',
        children: [
          { key: 'departments', title: '部门管理' },
          { key: 'members', title: '成员管理' }
        ]
      }
    ]
  },
  {
    key: 'business',
    title: '业务管理',
    icon: markRaw(ShoppingCart),
    children: [
      { key: 'orders', title: '订单管理' },
      { key: 'tasks', title: '任务管理' },
      { key: 'disabled', title: '禁用菜单', disabled: true }
    ]
  },
  {
    key: 'external',
    title: '外部页面',
    icon: markRaw(Link),
    children: [{ key: 'docs', title: '项目文档' }]
  },
  {
    key: 'exceptions',
    title: '异常页面',
    icon: markRaw(Warning),
    children: [{ key: 'not-found', title: '404 页面' }]
  },
  { key: 'about', title: '关于', icon: markRaw(InfoFilled) }
]
const menuBadges: Record<string, number> = {
  reports: 3,
  business: 8,
  orders: 12,
  tasks: 5
}
const activeTitle = computed(() => findLayoutMenu(menus, activeKey.value)?.title ?? activeKey.value)
const breadcrumbs = computed(() => {
  const root = findLayoutRootMenu(menus, activeKey.value)
  return root && root.key !== activeKey.value
    ? [{ text: root.title, icon: root.icon }, { text: activeTitle.value }]
    : [{ text: activeTitle.value, icon: root?.icon }]
})
function selectMenu(key: string, item: LayoutMenuItem) {
  if (item.children?.length) {
    let leaf = item.children[0]!
    while (leaf.children?.length) leaf = leaf.children[0]!
    selectMenu(leaf.key, leaf)
    return
  }
  if (item.disabled) return
  if (!tabs.value.some(tab => tab.key === key))
    tabs.value.push({ key, label: item.title, icon: item.icon })
  activeKey.value = key
}
function selectTab(key: string) {
  activeKey.value = key
}
function closeTabs(keys: string[]) {
  const currentIndex = tabs.value.findIndex(tab => tab.key === activeKey.value)
  tabs.value = tabs.value.filter(tab => tab.affix || !keys.includes(tab.key))
  if (!tabs.value.some(tab => tab.key === activeKey.value))
    activeKey.value =
      tabs.value[Math.max(0, Math.min(currentIndex - 1, tabs.value.length - 1))]?.key ?? 'dashboard'
}
function tabAction(action: LayoutTabAction, _key: string, closeKeys: string[]) {
  if (action === 'reload') refresh()
  else closeTabs(closeKeys)
}
function reorderTabs(keys: string[]) {
  const map = new Map(tabs.value.map(tab => [tab.key, tab]))
  tabs.value = keys.map(key => map.get(key)!).filter(Boolean)
}
function refresh() {
  refreshKey.value++
  ElMessage.success('数据已刷新')
}
const stats = [
  {
    label: '待处理订单',
    value: '18',
    change: '12.5%',
    icon: ShoppingCart,
    color: '#3472f5',
    background: '#edf1ff'
  },
  {
    label: '今日收入',
    value: '¥28,640',
    change: '8.2%',
    icon: Coin,
    color: '#519563',
    background: '#edf6ef'
  },
  {
    label: '活跃客户',
    value: '1,284',
    change: '5.7%',
    icon: User,
    color: '#44879f',
    background: '#edf5f8'
  },
  {
    label: '本月完成率',
    value: '86.4%',
    change: '3.1%',
    icon: CircleCheck,
    color: '#b78b51',
    background: '#fbf0e7'
  }
]
const records = [
  {
    id: 'SO-20261012-018',
    customer: '上海云启科技',
    amount: '¥12,860',
    status: '待审核',
    type: 'warning'
  },
  {
    id: 'SO-20261012-017',
    customer: '杭州星澜网络',
    amount: '¥8,420',
    status: '处理中',
    type: 'primary'
  },
  {
    id: 'SO-20261012-016',
    customer: '深圳远帆数字',
    amount: '¥21,600',
    status: '已完成',
    type: 'success'
  },
  {
    id: 'SO-20261012-015',
    customer: '北京启明咨询',
    amount: '¥6,980',
    status: '待付款',
    type: 'info'
  }
]
const activities = [
  { name: '李敏', text: '完成了订单的出库审核', time: '10 分钟前' },
  { name: '王凯', text: '提交了华东区采购申请', time: '36 分钟前' },
  { name: '系统', text: '生成了本周服务质量分析报告', time: '1 小时前' },
  { name: '陈晨', text: '更新了重点客户续约跟进记录', time: '2 小时前' }
]
</script>
<style scoped lang="scss">
.layout-demo-back {
  margin-left: 8px;
  font-size: 12px;
  white-space: nowrap;
  color: var(--pro-layout-text-secondary);
}
.layout-demo-menu-title.is-active {
  font-weight: 600;
}
.layout-demo-menu-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.layout-demo-menu-badge :deep(.el-badge__content) {
  position: static;
  transform: none;
}
.layout-demo-tabs-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 100%;
  padding: 0;
  border: 0;
  border-right: 1px solid var(--pro-layout-line);
  color: var(--pro-layout-text-regular);
  background: transparent;
  cursor: pointer;
}
.layout-demo-tabs-action:last-child {
  border-right: 0;
  border-left: 1px solid var(--pro-layout-line);
}
.layout-demo-tabs-action:hover {
  color: var(--el-color-primary);
  background: var(--pro-layout-hover-bg);
}
.layout-demo-hero,
.layout-demo-card,
.layout-demo-stats article {
  border: 1px solid var(--pro-layout-line);
  border-radius: 8px;
  background: var(--pro-layout-surface);
  box-shadow: 0 1px 3px rgb(15 23 42 / 4%);
}
.layout-demo-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  padding: 22px;
  margin-bottom: 16px;
  h1 {
    margin: 6px 0;
    font-size: 26px;
    color: var(--pro-layout-heading-color);
  }
  p {
    margin: 0;
    font-size: 13px;
    color: var(--pro-layout-text-secondary);
  }
}
.layout-demo-actions {
  display: flex;
  flex-shrink: 0;
}
.layout-demo-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  article {
    padding: 20px;
  }
  p {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 14px;
    font-size: 13px;
    color: var(--pro-layout-text-secondary);
  }
  .el-icon {
    width: 38px;
    height: 38px;
    border-radius: 6px;
    font-size: 19px;
  }
  strong {
    font-size: 27px;
    color: var(--pro-layout-heading-color);
  }
  small {
    display: block;
    margin-top: 12px;
    color: #519563;
    font-size: 11px;
    span {
      color: var(--pro-layout-text-secondary);
    }
  }
}
.layout-demo-card {
  margin-bottom: 16px;
  padding: 20px;
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  h2 {
    margin: 0 0 6px;
    font-size: 16px;
    color: var(--pro-layout-heading-color);
  }
  p {
    margin: 0;
    font-size: 12px;
    color: var(--pro-layout-text-secondary);
  }
}
.layout-demo-activity {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--pro-layout-line);
  font-size: 13px;
  small {
    display: block;
    margin-top: 5px;
    color: var(--pro-layout-text-secondary);
  }
  &:last-child {
    border: 0;
  }
}
@media (max-width: 900px) {
  .layout-demo-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 550px) {
  .layout-demo-hero {
    align-items: flex-start;
    flex-direction: column;
    padding: 16px;
  }
  .layout-demo-stats {
    gap: 8px;
    article {
      padding: 14px;
    }
    strong {
      font-size: 22px;
    }
  }
}
</style>
