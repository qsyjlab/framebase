import type { Component, VNode } from 'vue'
import { h } from 'vue'

/**
 * 4 种布局模式对应的预览小图标。
 * 与 vite-admin-vue `basic-layout/components/setting/icon` 同款 SVG，
 * 由 framebase packages 内部手写，避免外部依赖。
 */

function makeIcon(children: () => VNode[]) {
  const component: Component = {
    name: 'LayoutModeIcon',
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 48 48',
          fill: 'none',
          width: '1em',
          height: '1em'
        },
        children()
      )
    }
  }
  return component
}

/** 侧边栏布局：左 vertical bar */
export const LayoutIconSide = makeIcon(() => [
  h('rect', { x: 6, y: 8, width: 36, height: 32, rx: 4, fill: 'currentColor', opacity: 0.18 }),
  h('rect', { x: 9, y: 11, width: 8, height: 22, rx: 1.5, fill: 'currentColor' }),
  h('rect', { x: 19, y: 12, width: 20, height: 3, rx: 1, fill: 'currentColor', opacity: 0.6 }),
  h('rect', { x: 19, y: 17, width: 20, height: 3, rx: 1, fill: 'currentColor', opacity: 0.4 }),
  h('rect', { x: 19, y: 22, width: 20, height: 3, rx: 1, fill: 'currentColor', opacity: 0.4 })
])

/** 顶部布局：顶部 horizontal bar */
export const LayoutIconTop = makeIcon(() => [
  h('rect', { x: 6, y: 8, width: 36, height: 32, rx: 4, fill: 'currentColor', opacity: 0.18 }),
  h('rect', { x: 9, y: 11, width: 30, height: 6, rx: 1.5, fill: 'currentColor' }),
  h('rect', { x: 9, y: 21, width: 14, height: 3, rx: 1, fill: 'currentColor', opacity: 0.5 }),
  h('rect', { x: 9, y: 26, width: 30, height: 3, rx: 1, fill: 'currentColor', opacity: 0.35 }),
  h('rect', { x: 9, y: 31, width: 30, height: 3, rx: 1, fill: 'currentColor', opacity: 0.35 })
])

/** 顶部混合：top + side */
export const LayoutIconTopMix = makeIcon(() => [
  h('rect', { x: 6, y: 8, width: 36, height: 32, rx: 4, fill: 'currentColor', opacity: 0.18 }),
  h('rect', { x: 9, y: 11, width: 30, height: 6, rx: 1.5, fill: 'currentColor' }),
  h('rect', { x: 9, y: 20, width: 6, height: 17, rx: 1.5, fill: 'currentColor' }),
  h('rect', { x: 18, y: 22, width: 22, height: 3, rx: 1, fill: 'currentColor', opacity: 0.5 }),
  h('rect', { x: 18, y: 27, width: 22, height: 3, rx: 1, fill: 'currentColor', opacity: 0.35 }),
  h('rect', { x: 18, y: 32, width: 22, height: 3, rx: 1, fill: 'currentColor', opacity: 0.35 })
])

/** 侧边混合：左边窄图标列 + 右边面板 */
export const LayoutIconSideMix = makeIcon(() => [
  h('rect', { x: 6, y: 8, width: 36, height: 32, rx: 4, fill: 'currentColor', opacity: 0.18 }),
  h('rect', { x: 9, y: 11, width: 6, height: 26, rx: 1.5, fill: 'currentColor' }),
  h('rect', { x: 17, y: 11, width: 22, height: 3, rx: 1, fill: 'currentColor', opacity: 0.6 }),
  h('rect', { x: 17, y: 16, width: 22, height: 3, rx: 1, fill: 'currentColor', opacity: 0.4 }),
  h('rect', { x: 17, y: 21, width: 22, height: 3, rx: 1, fill: 'currentColor', opacity: 0.4 }),
  h('rect', { x: 17, y: 26, width: 22, height: 3, rx: 1, fill: 'currentColor', opacity: 0.4 })
])

/** 设置抽屉右上角的 ✓ */
export const CheckIcon = makeIcon(() => [
  h('path', {
    d: 'M20 6 9 17l-5-5',
    stroke: 'currentColor',
    'stroke-width': 3,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    fill: 'none'
  })
])

/** 图钉 / push-pin */
export const PushpinIcon = makeIcon(() => [
  h('path', {
    d: 'M16 2v6m-4 0V8h8V6.5L18 4l-2 2.5h-4Zm0 6L8 22m8-6 4 12',
    stroke: 'currentColor',
    'stroke-width': 1.6,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    fill: 'none'
  })
])
