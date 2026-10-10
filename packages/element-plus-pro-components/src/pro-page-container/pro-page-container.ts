import type { CSSProperties } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export interface ProPageBreadcrumbItem {
  /** 面包屑文案 */
  text: string
  /** 传入后点击面包屑跳转,需要项目安装 vue-router */
  to?: RouteLocationRaw
  /** 跳转时使用 replace 而非 push */
  replace?: boolean
}

export type ProPageBreadcrumbs = Array<string | ProPageBreadcrumbItem>

export interface ProPageContainerProps {
  /** 页面标题 */
  title?: string
  /** 副标题,显示在标题下方 */
  subtitle?: string
  /** 描述文案,显示在标题行下方 */
  description?: string
  /** 标题行右侧操作区文案,复杂内容请使用 extra 插槽 */
  extra?: string
  /** 面包屑,支持字符串简写 */
  breadcrumb?: ProPageBreadcrumbs
  /** 是否显示返回按钮,默认在监听 back 事件时自动显示 */
  back?: boolean
  /** 透明模式:去除背景、边框与圆角,内容区默认无内边距 */
  ghost?: boolean
  /** 是否显示边框 */
  bordered?: boolean
  /** 页头与内容之间是否显示分隔线 */
  headerBordered?: boolean
  /** 内容区加载态,展示骨架屏 */
  loading?: boolean
  /** 内容区内边距,false 时为 0 */
  contentPadding?: number | string | boolean
  /** 页头样式 */
  headerStyle?: CSSProperties
  /** 内容区样式 */
  contentStyle?: CSSProperties
  /** 底部工具栏样式 */
  footerStyle?: CSSProperties
  /** 底部工具栏内容对齐方式 */
  footerAlign?: 'left' | 'center' | 'right'
}
