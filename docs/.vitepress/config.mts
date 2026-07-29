import { defineConfig } from 'vitepress'
import { transformDemo } from './plugins/transform-demo'

export default defineConfig({
  title: 'Framebase',
  description: 'Vue 3 + Element Plus Pro 组件库',
  base: '/framebase/',
  markdown: {
    config(md) {
      transformDemo(md)
    }
  },
  vite: {
    plugins: []
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/intro' },
      { text: '@framebase/core', link: '/core/' },
      { text: '@framebase/vue', link: '/vue/' },
      { text: '组件库', link: '/components/guide' },
      { text: 'Playground', link: 'https://github.com/qsyjlab/framebase/tree/main/apps/playground' }
    ],
    sidebar: {
      '/guide': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/intro' },
            { text: '架构说明', link: '/guide/architecture' },
            { text: '安装', link: '/guide/install' },
            { text: '快速上手', link: '/guide/quick-start' }
          ]
        },
        {
          text: '工程',
          items: [{ text: '贡献与发版', link: '/guide/contributing' }]
        }
      ],
      '/core': [
        { text: '总览', link: '/core/' },
        {
          text: '路径工具',
          items: [
            { text: 'getPathValue', link: '/core/get-path-value' },
            { text: 'setPathValue', link: '/core/set-path-value' },
            { text: 'unsetPathValue', link: '/core/unset-path-value' },
            { text: 'normalizePath', link: '/core/normalize-path' }
          ]
        },
        {
          text: '路径类型',
          items: [
            { text: 'DataPath / DataIndex', link: '/core/data-path' }
          ]
        },
        {
          text: '分页工具',
          items: [
            { text: 'normalizePagedResponse', link: '/core/normalize-paged-response' },
            { text: 'paginateData', link: '/core/paginate-data' },
            { text: 'getRowKey', link: '/core/get-row-key' },
            { text: 'moveItem', link: '/core/move-item' }
          ]
        }
      ],
      '/vue': [
        { text: '总览', link: '/vue/' },
        {
          text: '请求',
          items: [
            { text: 'useRequest', link: '/vue/use-request' },
            { text: 'usePagedList', link: '/vue/use-paged-list' }
          ]
        },
        {
          text: '状态',
          items: [
            { text: 'usePagination', link: '/vue/use-pagination' },
            { text: 'useSelection', link: '/vue/use-selection' },
            { text: 'useUrlState', link: '/vue/use-url-state' }
          ]
        },
        {
          text: '配置',
          items: [
            { text: 'useHookConfig / provideHookConfig', link: '/vue/use-hook-config' }
          ]
        }
      ],
      '/components': [
        { text: '组件总览', link: '/components/guide' },
        {
          text: '数据展示',
          items: [
            { text: 'ProCard 卡片', link: '/components/pro-card' },
            { text: 'ProDescriptions 描述列表', link: '/components/pro-descriptions' },
            { text: 'ProList 列表', link: '/components/pro-list' },
            { text: 'ProEmpty 空状态', link: '/components/pro-empty' },
            { text: 'ProResult 结果', link: '/components/pro-result' },
            { text: 'ProStatus 状态', link: '/components/pro-status' },
            { text: 'ProBadge 徽标', link: '/components/pro-badge' }
          ]
        },
        {
          text: '操作反馈',
          items: [
            { text: 'ProAsyncButton 异步按钮', link: '/components/pro-async-button' },
            { text: 'ProConfirmButton 确认按钮', link: '/components/pro-confirm-button' }
          ]
        },
        {
          text: '数据录入',
          items: [
            { text: 'ProField 字段', link: '/components/pro-field' },
            { text: 'ProForm 表单', link: '/components/pro-form' },
            { text: 'ProModalForm 弹窗表单', link: '/components/pro-modal-form' },
            { text: 'ProDrawerForm 抽屉表单', link: '/components/pro-drawer-form' },
            { text: 'ProStepsForm 分步表单', link: '/components/pro-steps-form' },
            { text: 'ProSelect 选择器', link: '/components/pro-select' },
            { text: 'ProRadioGroup 单选组', link: '/components/pro-radio-group' },
            { text: 'ProCheckboxGroup 复选组', link: '/components/pro-checkbox-group' },
            { text: 'ProCheckCard 选择卡片', link: '/components/pro-check-card' },
            { text: 'ProTree 树', link: '/components/pro-tree' }
          ]
        },
        {
          text: '复杂数据',
          items: [
            { text: 'ProTable 表格', link: '/components/pro-table' },
            { text: 'ProEditableTable 可编辑表格', link: '/components/pro-editable-table' },
            { text: 'ProDragSortTable 拖拽排序表格', link: '/components/pro-drag-sort-table' }
          ]
        },
        {
          text: '文件与配置',
          items: [
            { text: 'ProUpload 上传', link: '/components/pro-upload' },
            { text: 'ProUploadList 批量上传', link: '/components/pro-upload-list' },
            { text: 'ProPreviewFile 文件预览', link: '/components/pro-preview-file' },
            { text: 'ProConfigProvider 全局配置', link: '/components/pro-config-provider' }
          ]
        }
      ]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/qsyjlab/framebase' }]
  }
})
