import type { Plugin } from 'vite'

/**
 * 让 VitePress 默认主题的排版样式不再命中 `.vp-raw` 子树（示例区域）。
 *
 * 为什么不是降特异性：
 *   `.vp-doc table { display: block }` 之所以污染组件，不是因为它「优先级高」，
 *   而是因为它**匹配到了**组件内部的 <table>。EP 的 `.el-table__body` 并没有声明
 *   `display`，没有竞争规则，降权到 (0,0,1) 也依然会生效。
 *   真正有效的做法是让规则不匹配——Element Plus 官方文档是换掉文档容器来实现的，
 *   这里用选择器排除，效果等价但不用重写整套排版。
 *
 * 变换示例：
 *   .vp-doc table          →  .vp-doc table:not(.vp-raw *)
 *   .vp-doc tr:nth-child(2n) → .vp-doc tr:nth-child(2n):not(.vp-raw *)
 *   .vp-doc > div          →  .vp-doc > div:not(.vp-raw *)
 *
 * 于是文档里的普通元素照旧吃 VitePress 样式，示例区域内的元素一条都不匹配，
 * 不再需要手写 `.vp-raw` 重置规则。
 */
const COMBINATORS = [' ', '>', '+', '~']

function scopeSelector(selector: string): string {
  const value = selector.trim()
  if (!value.includes('.vp-doc')) return selector
  // 已经是排除过的就不再重复加
  if (value.includes(':not(.vp-raw *)')) return selector

  let cut = -1
  COMBINATORS.forEach(char => {
    cut = Math.max(cut, value.lastIndexOf(char))
  })
  // 单个 `.vp-doc`（容器自身）没有后代部分，不处理
  if (cut < 0) return selector

  const head = value.slice(0, cut + 1)
  const tail = value.slice(cut + 1).trim()
  if (!tail) return selector
  return `${head}${tail}:not(.vp-raw *)`
}

export function vpDocExcludeRaw(): Plugin {
  return {
    name: 'framebase:vp-doc-exclude-raw',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('vitepress') || !id.includes('theme-default')) return
      if (!id.includes('/styles/')) return
      if (!code.includes('.vp-doc')) return
      return code.replace(/([^{}]+)\{/g, (match, prelude: string) => {
        if (!prelude.includes('.vp-doc')) return match
        const scoped = prelude
          .split(',')
          .map(part => scopeSelector(part))
          .join(',')
        return `${scoped}{`
      })
    }
  }
}
