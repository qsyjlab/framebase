import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

export interface PlaygroundNavItem {
  path: string
  title: string
  description: string
  components: string[]
}

export interface PlaygroundNavGroup {
  title: string
  items: PlaygroundNavItem[]
}

export const navigation: PlaygroundNavGroup[] = [
  {
    title: '开始',
    items: [
      {
        path: '/',
        title: '组件总览',
        description: '按领域浏览全部公开组件，并验证发布产物是否完整。',
        components: []
      }
    ]
  },
  {
    title: '@framebase/core',
    items: [
      {
        path: '/core',
        title: '路径与分页工具',
        description:
          'getPathValue / setPathValue / normalizePath / paginateData / getRowKey / moveItem。',
        components: []
      }
    ]
  },
  {
    title: '@framebase/vue',
    items: [
      {
        path: '/vue',
        title: '组合式 API',
        description: 'useRequest / usePagination / useSelection / useUrlState。',
        components: []
      }
    ]
  },
  {
    title: '数据展示',
    items: [
      {
        path: '/display/actions',
        title: '操作与状态',
        description: '异步操作、危险确认、状态语义和通知徽标。',
        components: ['ProAsyncButton', 'ProConfirmButton', 'ProStatus', 'ProBadge']
      },
      {
        path: '/display/cards',
        title: '卡片与描述',
        description: '卡片、统计、详情、空状态和结果反馈。',
        components: ['ProCard', 'ProStatisticCard', 'ProDescriptions', 'ProEmpty', 'ProResult']
      },
      {
        path: '/display/list',
        title: '列表',
        description: '请求驱动、分页、选择与网格布局。',
        components: ['ProList']
      },
      {
        path: '/display/feedback',
        title: '反馈与异常',
        description: 'HTTP 异常状态页与运行时错误边界。',
        components: ['ProException', 'ProErrorBoundary']
      }
    ]
  },
  {
    title: '数据录入',
    items: [
      {
        path: '/input/choices',
        title: '选择组件',
        description: '选择器、单复选、卡片选择和树形选择。',
        components: [
          'ProSelect',
          'ProRadioGroup',
          'ProCheckboxGroup',
          'ProCheckCard',
          'ProCheckCardGroup',
          'ProTree',
          'ProTreeSelect'
        ]
      },
      {
        path: '/input/form',
        title: '字段与表单',
        description: '统一字段渲染与 Schema 表单。',
        components: ['ProField', 'ProForm']
      },
      {
        path: '/input/form-containers',
        title: '容器表单',
        description: '弹窗、抽屉和分步提交工作流。',
        components: ['ProModalForm', 'ProDrawerForm', 'ProStepsForm']
      }
    ]
  },
  {
    title: '复杂数据',
    items: [
      {
        path: '/data/tables',
        title: '表格',
        description: '标准表格、可编辑表格与拖拽排序。',
        components: ['ProTable', 'ProEditableTable', 'ProDragSortTable']
      }
    ]
  },
  {
    title: '文件与配置',
    items: [
      {
        path: '/files',
        title: '文件能力',
        description: '上传、批量上传与统一文件预览。',
        components: ['ProUpload', 'ProUploadList', 'ProPreviewFile']
      },
      {
        path: '/config',
        title: '全局配置',
        description: '局部尺寸、主题和组件默认值。',
        components: ['ProConfigProvider']
      }
    ]
  }
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./views/OverviewPage.vue'),
    meta: { title: '组件总览', description: '按领域浏览全部公开组件，并验证发布产物是否完整。' }
  },
  {
    path: '/core',
    component: () => import('./views/CorePage.vue'),
    meta: {
      title: '路径与分页工具',
      description:
        'getPathValue / setPathValue / normalizePath / paginateData / getRowKey / moveItem。',
      eyebrow: '@framebase/core'
    }
  },
  {
    path: '/vue',
    component: () => import('./views/VueHooksPage.vue'),
    meta: {
      title: '组合式 API',
      description: 'useRequest / usePagination / useSelection / useUrlState。',
      eyebrow: '@framebase/vue'
    }
  },
  {
    path: '/display/cards',
    component: () => import('./views/DisplayPage.vue'),
    meta: { title: '卡片与描述', description: '卡片、统计、详情、空状态和结果反馈。' }
  },
  {
    path: '/display/actions',
    component: () => import('./views/ActionsPage.vue'),
    meta: { title: '操作与状态', description: '异步操作、危险确认、状态语义和通知徽标。' }
  },
  {
    path: '/display/list',
    component: () => import('./views/ListPage.vue'),
    meta: { title: '列表', description: '请求驱动、分页、选择与网格布局。' }
  },
  {
    path: '/display/feedback',
    component: () => import('./views/FeedbackPage.vue'),
    meta: {
      title: '反馈与异常',
      description: 'HTTP 异常状态页与运行时错误边界。'
    }
  },
  {
    path: '/input/choices',
    component: () => import('./views/ChoicesPage.vue'),
    meta: { title: '选择组件', description: '选择器、单复选、卡片选择和树形选择。' }
  },
  {
    path: '/input/form',
    component: () => import('./views/FormPage.vue'),
    meta: { title: '字段与表单', description: '统一字段渲染与 Schema 表单。' }
  },
  {
    path: '/input/form-containers',
    component: () => import('./views/FormContainersPage.vue'),
    meta: { title: '容器表单', description: '弹窗、抽屉和分步提交工作流。' }
  },
  {
    path: '/data/tables',
    component: () => import('./views/TablesPage.vue'),
    meta: { title: '表格', description: '标准表格、可编辑表格与拖拽排序。' }
  },
  {
    path: '/files',
    component: () => import('./views/FilesPage.vue'),
    meta: { title: '文件能力', description: '上传、批量上传与统一文件预览。' }
  },
  {
    path: '/config',
    component: () => import('./views/ConfigPage.vue'),
    meta: { title: '全局配置', description: '局部尺寸、主题和组件默认值。' }
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})
